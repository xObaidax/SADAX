import json

from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt

from .models import Word


EDITABLE_FIELDS = {
    "french": (str, 200),
    "arabic": (str, 200),
    "category": (str, 100),
    "client_id": (str, 128),
    "set_id": (str, 128),
    "set_name": (str, 200),
    "source_language": (str, 16),
    "target_language": (str, 16),
    "file_id": (str, 128),
}


def serialize_word(word):
    return {
        "id": word.pk,
        "french": word.french,
        "arabic": word.arabic,
        "category": word.category,
        "mastery_level": word.mastery_level,
        "client_id": word.client_id,
        "set_id": word.set_id,
        "set_name": word.set_name,
        "source_language": word.source_language,
        "target_language": word.target_language,
        "created_at": word.created_at.isoformat(),
        "updated_at": word.updated_at.isoformat(),
        "file_id": word.file_id,
    }


def serialize_folder(folder):
    return {
        "id": folder.pk,
        "name": folder.name,
        "lang1": folder.lang1,
        "lang2": folder.lang2,
        "files": folder.files or [],
        "client_id": folder.client_id,
        "created_at": folder.created_at.isoformat(),
        "updated_at": folder.updated_at.isoformat(),
    }


def parse_fields(request, creating=False):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None, "Invalid JSON."
    if not isinstance(payload, dict):
        return None, "Expected a JSON object."

    fields = {}
    for key, (expected_type, max_length) in EDITABLE_FIELDS.items():
        if key in payload:
            value = payload[key]
            if not isinstance(value, expected_type) or len(value) > max_length:
                return None, f"Invalid {key}."
            fields[key] = value.strip()
    if "mastery_level" in payload:
        value = payload["mastery_level"]
        if type(value) is not int or value < 0:
            return None, "Invalid mastery_level."
        fields["mastery_level"] = value
    if creating and (not fields.get("french") or not fields.get("arabic")):
        return None, "French and Arabic are required."
    if "french" in fields and not fields["french"]:
        return None, "French is required."
    if "arabic" in fields and not fields["arabic"]:
        return None, "Arabic is required."
    return fields, None


@csrf_exempt
def words_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required."}, status=401)
    if request.method == "GET":
        words = Word.objects.filter(user=request.user).order_by("created_at", "id")
        return JsonResponse([serialize_word(word) for word in words], safe=False)
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    fields, error = parse_fields(request, creating=True)
    if error:
        return JsonResponse({"detail": error}, status=400)
    client_id = fields.get("client_id")
    if client_id:
        word, created = Word.objects.get_or_create(
            user=request.user,
            client_id=client_id,
            defaults={key: value for key, value in fields.items() if key != "client_id"},
        )
        return JsonResponse(serialize_word(word), status=201 if created else 200)
    try:
        word = Word.objects.create(user=request.user, **fields)
    except IntegrityError:
        return JsonResponse({"detail": "Word already exists."}, status=409)
    return JsonResponse(serialize_word(word), status=201)


@csrf_exempt
def word_detail(request, word_id):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required."}, status=401)
    if request.method not in {"PUT", "DELETE"}:
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    word = Word.objects.filter(pk=word_id, user=request.user).first()
    if word is None:
        return JsonResponse({"detail": "Word not found."}, status=404)
    if request.method == "DELETE":
        word.delete()
        return JsonResponse({"ok": True})

    fields, error = parse_fields(request)
    if error:
        return JsonResponse({"detail": error}, status=400)
    for key, value in fields.items():
        setattr(word, key, value)
    try:
        word.save()
    except IntegrityError:
        return JsonResponse({"detail": "Word ID already exists."}, status=409)
    return JsonResponse(serialize_word(word))
