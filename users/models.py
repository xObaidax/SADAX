from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)
    google_id = models.CharField(max_length=128, blank=True, null=True, unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    last_login_at = models.DateTimeField(blank=True, null=True)

    otp_code = models.CharField(max_length=64, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)
    otp_attempts = models.PositiveSmallIntegerField(default=0)
    otp_last_sent = models.DateTimeField(blank=True, null=True)
    otp_sent_count = models.PositiveSmallIntegerField(default=0)
    otp_window_started_at = models.DateTimeField(blank=True, null=True)
    otp_locked_until = models.DateTimeField(blank=True, null=True)

    backup_email = models.EmailField(blank=True, null=True, unique=True)
    backup_email_verified = models.BooleanField(default=False)


class Word(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="words")
    french = models.CharField(max_length=200)
    arabic = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True)
    mastery_level = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Keep the existing browser-based sets and word IDs stable during sync.
    client_id = models.CharField(max_length=128, blank=True)
    set_id = models.CharField(max_length=128, blank=True)
    set_name = models.CharField(max_length=200, blank=True)
    source_language = models.CharField(max_length=16, default="fr")
    target_language = models.CharField(max_length=16, default="ar")
    file_id = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "client_id"],
                condition=~models.Q(client_id=""),
                name="unique_user_word_client_id",
            ),
        ]


class Folder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="folders")
    name = models.CharField(max_length=200)
    lang1 = models.CharField(max_length=16, default="fr")
    lang2 = models.CharField(max_length=16, default="ar")
    files = models.JSONField(default=list, blank=True)
    client_id = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "client_id"],
                condition=~models.Q(client_id=""),
                name="unique_user_folder_client_id",
            ),
        ]
