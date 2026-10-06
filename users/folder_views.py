import json

from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Folder
from .word_views import serialize_folder


FOLDER_TEXT_FIELDS = {
    "client_id": 128,
    "name": 200,
    "lang1": 16,
    "lang2": 16,
}


def parse_folder_fields(request, creating=False):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None, "Invalid JSON."
    if not isinstance(payload, dict):
        return None, "Expected a JSON object."

    fields = {}
    for key, max_length in FOLDER_TEXT_FIELDS.items():
        if key in payload:
            value = payload[key]
            if not isinstance(value, str) or len(value) > max_length:
                return None, f"Invalid {key}."
            fields[key] = value.strip()
    if (creating and not fields.get("name")) or ("name" in fields and not fields["name"]):
        return None, "Folder name is required."
    if "files" in payload:
        files = payload["files"]
        if not isinstance(files, list):
            return None, "Invalid files."
        seen = set()
        for item in files:
            if not isinstance(item, dict) or not isinstance(item.get("id"), str) or not isinstance(item.get("name"), str):
                return None, "Invalid files."
            file_id = item["id"].strip()
            file_name = item["name"].strip()
            if not file_id or len(file_id) > 128 or not file_name or len(file_name) > 200 or file_id in seen:
                return None, "Invalid files."
            seen.add(file_id)
        fields["files"] = [{"id": item["id"].strip(), "name": item["name"].strip()} for item in files]
    return fields, None


@csrf_exempt
def folder_list_or_create(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required."}, status=401)
    if request.method == "GET":
        folders = Folder.objects.filter(user=request.user).order_by("created_at", "id")
        return JsonResponse({"folders": [serialize_folder(folder) for folder in folders]})
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    fields, error = parse_folder_fields(request, creating=True)
    if error:
        return JsonResponse({"detail": error}, status=400)
    client_id = fields.get("client_id")
    try:
        if client_id:
            folder, created = Folder.objects.get_or_create(
                user=request.user,
                client_id=client_id,
                defaults={key: value for key, value in fields.items() if key != "client_id"},
            )
            if not created:
                for key, value in fields.items():
                    setattr(folder, key, value)
                folder.save()
        else:
            folder = Folder.objects.create(user=request.user, **fields)
            created = True
    except IntegrityError:
        return JsonResponse({"detail": "Folder already exists."}, status=409)
    return JsonResponse(serialize_folder(folder), status=201 if created else 200)


@csrf_exempt
def folder_update_or_delete(request, folder_id):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required."}, status=401)
    if request.method not in {"PUT", "DELETE"}:
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    folder = Folder.objects.filter(pk=folder_id).first()
    if folder is None:
        return JsonResponse({"detail": "Folder not found."}, status=404)
    if folder.user_id != request.user.pk:
        return JsonResponse({"detail": "Forbidden."}, status=403)
    if request.method == "DELETE":
        folder.delete()
        return JsonResponse({"ok": True})

    fields, error = parse_folder_fields(request)
    if error:
        return JsonResponse({"detail": error}, status=400)
    for key, value in fields.items():
        setattr(folder, key, value)
    try:
        folder.save()
    except IntegrityError:
        return JsonResponse({"detail": "Folder ID already exists."}, status=409)
    return JsonResponse(serialize_folder(folder))
