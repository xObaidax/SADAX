import hashlib
import json
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.core.mail import EmailMultiAlternatives
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt


User = get_user_model()
OTP_TTL = timedelta(minutes=10)
RESEND_DELAY = timedelta(seconds=60)
RATE_WINDOW = timedelta(hours=1)
LOCKOUT_TIME = timedelta(minutes=30)
MAX_ATTEMPTS = 5
MAX_EMAILS_PER_WINDOW = 3


def normalize_email(value):
    return (value or "").strip().lower()


def hash_otp(code):
    value = f"{settings.SECRET_KEY}:{code}".encode("utf-8")
    return hashlib.sha256(value).hexdigest()


def valid_email(value):
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(value)
        return True
    except ValidationError:
        return False


def user_for_email(email):
    from django.db.models import Q
    return User.objects.filter(
        Q(email__iexact=email)
        | Q(backup_email__iexact=email, backup_email_verified=True)
    ).first()


def create_unverified_user(email):
    fields = {field.name for field in User._meta.get_fields()}
    if "username" in fields:
        user = User.objects.create_user(
            username=email,
            email=email,
            email_verified=False,
        )
    else:
        user = User.objects.create(email=email, email_verified=False)
    return user


def send_otp_email(email, code):
    context = {
        "code": code,
        "expires_minutes": int(OTP_TTL.total_seconds() // 60),
        "email": email,
    }
    html_body = render_to_string("emails/otp.html", context)
    text_body = (
        f"Your VocaBloom login code is {code}. "
        f"It expires in {context['expires_minutes']} minutes. "
        "If you did not request this, ignore this email."
    )
    message = EmailMultiAlternatives(
        subject=f"Your login code: {code}",
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)


def json_body(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
        return payload if isinstance(payload, dict) else {}
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}


def user_payload(user):
    return {
        "id": user.pk,
        "name": user.get_full_name() or user.username or user.email.split("@")[0],
        "email": user.email,
        "avatar_url": user.avatar_url,
        "emailVerified": user.email_verified,
        "backupEmail": user.backup_email if user.backup_email_verified else "",
        "backupEmailVerified": user.backup_email_verified,
    }


@csrf_exempt
@require_POST
def google_callback(request):
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
    from google.auth.exceptions import GoogleAuthError

    credential = json_body(request).get("credential")
    if not isinstance(credential, str) or not credential:
        return JsonResponse({"detail": "A Google credential is required."}, status=400)
    if not settings.GOOGLE_CLIENT_ID:
        return JsonResponse({"detail": "Google sign-in is not configured."}, status=503)

    try:
        claims = id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except (ValueError, GoogleAuthError):
        return JsonResponse({"detail": "Invalid Google credential."}, status=401)

    google_id = claims.get("sub")
    email = normalize_email(claims.get("email"))
    if not google_id or not valid_email(email) or claims.get("email_verified") is not True:
        return JsonResponse({"detail": "A verified Google email is required."}, status=401)

    try:
        with transaction.atomic():
            user = User.objects.select_for_update().filter(google_id=google_id).first()
            email_user = User.objects.select_for_update().filter(email__iexact=email).first()
            if user and email_user and user.pk != email_user.pk:
                return JsonResponse({"detail": "This email belongs to another account."}, status=409)
            if user is None:
                user = email_user
            if user and user.google_id and user.google_id != google_id:
                return JsonResponse({"detail": "This email is linked to another Google account."}, status=409)
            if user is None:
                base = email[:150]
                username = base
                suffix = 1
                while User.objects.filter(username=username).exists():
                    ending = f"_{suffix}"
                    username = base[:150 - len(ending)] + ending
                    suffix += 1
                user = User.objects.create_user(username=username, email=email)
            if not user.is_active:
                return JsonResponse({"detail": "This account is disabled."}, status=403)
            user.google_id = google_id
            user.email = email
            user.email_verified = True
            full_name = (claims.get("name") or "").strip()
            if full_name:
                first_name, _, last_name = full_name.partition(" ")
                user.first_name = first_name[:150]
                user.last_name = last_name[:150]
            picture = claims.get("picture") or ""
            if not isinstance(picture, str):
                picture = ""
            user.avatar_url = picture if len(picture) <= 200 else None
            user.last_login_at = timezone.now()
            user.save()
    except IntegrityError:
        return JsonResponse({"detail": "Account linking conflicted. Please retry."}, status=409)

    login(request, user)
    return JsonResponse({"ok": True, "user": user_payload(user)})


@csrf_exempt
@require_POST
def request_email_otp(request):
    payload = json_body(request)
    email = normalize_email(payload.get("email"))
    purpose = payload.get("purpose", "login")

    if purpose not in {"login", "backup"}:
        return JsonResponse({"detail": "Invalid OTP purpose."}, status=400)
    if not valid_email(email):
        return JsonResponse({"detail": "Enter a valid email address."}, status=400)

    current_user = request.user if request.user.is_authenticated else None
    if purpose == "backup" and current_user is None:
        return JsonResponse({"detail": "You must be signed in."}, status=401)
    if purpose == "backup" and current_user and email == normalize_email(current_user.email):
        return JsonResponse({"detail": "That is already your primary email."}, status=400)

    user = current_user if purpose == "backup" else user_for_email(email)
    if user is None:
        try:
            user = create_unverified_user(email)
        except Exception:
            user = user_for_email(email)
            if user is None:
                return JsonResponse({"detail": "Could not create the account."}, status=409)

    now = timezone.now()
    if user.otp_locked_until and user.otp_locked_until > now:
        remaining = int((user.otp_locked_until - now).total_seconds() // 60) + 1
        return JsonResponse({"detail": f"Try again in {remaining} minutes.", "locked": True}, status=429)
    if user.otp_last_sent and now - user.otp_last_sent < RESEND_DELAY:
        wait = int((RESEND_DELAY - (now - user.otp_last_sent)).total_seconds()) + 1
        return JsonResponse({"detail": f"Please wait {wait} seconds."}, status=429)

    window_start = user.otp_window_started_at
    if not window_start or now - window_start >= RATE_WINDOW:
        window_start = now
        sent_count = 0
    else:
        sent_count = user.otp_sent_count
    if sent_count >= MAX_EMAILS_PER_WINDOW:
        return JsonResponse({"detail": "Email rate limit reached."}, status=429)

    code = f"{secrets.randbelow(1000000):06d}"
    user.otp_code = hash_otp(code)
    user.otp_expiry = now + OTP_TTL
    user.otp_attempts = 0
    user.otp_last_sent = now
    user.otp_sent_count = sent_count + 1
    user.otp_window_started_at = window_start
    user.save(update_fields=[
        "otp_code", "otp_expiry", "otp_attempts", "otp_last_sent",
        "otp_sent_count", "otp_window_started_at",
    ])

    try:
        send_otp_email(email, code)
    except Exception:
        user.otp_code = None
        user.otp_expiry = None
        user.save(update_fields=["otp_code", "otp_expiry"])
        return JsonResponse({"detail": "Could not send the email."}, status=503)

    request.session["otp_email"] = email
    request.session["otp_purpose"] = purpose
    return JsonResponse({"ok": True, "expires_in": int(OTP_TTL.total_seconds())})


@csrf_exempt
@require_POST
def verify_email_otp(request):
    payload = json_body(request)
    email = normalize_email(payload.get("email"))
    code = str(payload.get("code", "")).strip()
    purpose = payload.get("purpose", request.session.get("otp_purpose", "login"))

    if not valid_email(email) or len(code) != 6 or not code.isdigit():
        return JsonResponse({"detail": "Invalid email or code."}, status=400)
    if request.session.get("otp_email") != email:
        return JsonResponse({"detail": "Request a new code first."}, status=400)

    user = user_for_email(email)
    if purpose == "backup" and request.user.is_authenticated:
        user = request.user
    if user is None:
        return JsonResponse({"detail": "Request a new code first."}, status=400)

    now = timezone.now()
    if user.otp_locked_until and user.otp_locked_until > now:
        return JsonResponse({"detail": "Too many attempts. Try again in 30 minutes.", "locked": True}, status=429)
    if not user.otp_expiry or user.otp_expiry <= now or not user.otp_code:
        return JsonResponse({"detail": "The code expired."}, status=400)

    if not secrets.compare_digest(user.otp_code, hash_otp(code)):
        user.otp_attempts += 1
        remaining = max(0, MAX_ATTEMPTS - user.otp_attempts)
        update_fields = ["otp_attempts"]
        if user.otp_attempts >= MAX_ATTEMPTS:
            user.otp_locked_until = now + LOCKOUT_TIME
            user.otp_expiry = None
            user.otp_code = None
            update_fields += ["otp_locked_until", "otp_expiry", "otp_code"]
        user.save(update_fields=update_fields)
        if user.otp_attempts >= MAX_ATTEMPTS:
            return JsonResponse({"detail": "Too many attempts.", "locked": True}, status=429)
        return JsonResponse({"detail": "Incorrect code.", "attempts_remaining": remaining}, status=400)

    if purpose == "backup":
        other = User.objects.filter(backup_email__iexact=email).exclude(pk=user.pk).exists()
        if other or User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            return JsonResponse({"detail": "Email already linked to another account."}, status=409)
        user.backup_email = email
        user.backup_email_verified = True
    else:
        user.email = email
        user.email_verified = True

    user.otp_code = None
    user.otp_expiry = None
    user.otp_attempts = 0
    user.otp_locked_until = None
    user.last_login_at = now
    user.save()
    login(request, user)
    request.session.pop("otp_email", None)
    request.session.pop("otp_purpose", None)
    return JsonResponse({
        "ok": True,
        "user": user_payload(user),
    })


@csrf_exempt
@require_POST
def logout_view(request):
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({"ok": True})


def current_user_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"user": None}, status=401)
    user = request.user
    return JsonResponse({
        "user": user_payload(user),
    })
