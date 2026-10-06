import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.conf import settings
from django.test import TestCase

from .models import Word


User = get_user_model()


class WordApiTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", email="owner@example.com")
        self.other = User.objects.create_user(username="other", email="other@example.com")

    def test_login_required_for_all_word_methods(self):
        for method, url in (
            ("get", "/api/words/"),
            ("post", "/api/words/"),
            ("put", "/api/words/1/"),
            ("delete", "/api/words/1/"),
        ):
            response = getattr(self.client, method)(url)
            self.assertEqual(response.status_code, 401)

    def test_crud_is_limited_to_owner(self):
        self.client.force_login(self.owner)
        payload = {
            "french": "bonjour", "arabic": "مرحبا", "client_id": "local-1",
            "set_id": "set-1", "set_name": "Basics",
        }
        created = self.client.post("/api/words/", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(created.status_code, 201)
        word_id = created.json()["id"]
        self.assertEqual(Word.objects.count(), 1)

        duplicate = self.client.post("/api/words/", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(duplicate.status_code, 200)
        self.assertEqual(Word.objects.count(), 1)

        self.client.force_login(self.other)
        self.assertEqual(self.client.get("/api/words/").json(), [])
        self.assertEqual(self.client.put(f"/api/words/{word_id}/", data="{}", content_type="application/json").status_code, 404)
        self.assertEqual(self.client.delete(f"/api/words/{word_id}/").status_code, 404)

        self.client.force_login(self.owner)
        updated = self.client.put(
            f"/api/words/{word_id}/",
            data=json.dumps({"french": "salut"}),
            content_type="application/json",
        )
        self.assertEqual(updated.json()["french"], "salut")
        self.assertEqual(self.client.delete(f"/api/words/{word_id}/").json(), {"ok": True})
        self.assertEqual(Word.objects.count(), 0)


class GoogleCallbackTests(TestCase):
    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_links_existing_email_and_restores_session(self, verify):
        existing = User.objects.create_user(username="test", email="test@example.com")
        verify.return_value = {
            "sub": "google-123", "email": "test@example.com", "email_verified": True,
            "name": "Test User", "picture": "https://example.com/avatar.png",
        }
        response = self.client.post(
            "/auth/google/callback/",
            data=json.dumps({"credential": "valid-token"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["id"], existing.pk)
        existing.refresh_from_db()
        self.assertEqual(existing.google_id, "google-123")
        self.assertTrue(existing.email_verified)
        self.assertIsNotNone(existing.last_login_at)
        self.assertEqual(self.client.get("/auth/me/").json()["user"]["id"], existing.pk)

    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_rejects_unverified_email(self, verify):
        verify.return_value = {
            "sub": "google-123", "email": "test@example.com", "email_verified": False,
        }
        response = self.client.post(
            "/auth/google/callback/",
            data=json.dumps({"credential": "valid-token"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(User.objects.count(), 0)


class LogoutTests(TestCase):
    def test_logout_destroys_authenticated_session(self):
        user = User.objects.create_user(username="logout-test", email="logout@example.com")
        self.client.force_login(user)
        self.assertEqual(self.client.get("/auth/me/").status_code, 200)

        response = self.client.post("/auth/logout/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"ok": True})
        self.assertEqual(self.client.get("/auth/me/").status_code, 401)
        self.assertNotIn("_auth_user_id", self.client.session)


class GooglePageConfigTests(TestCase):
    def test_local_google_page_has_client_id_and_popup_headers(self):
        response = self.client.get("/", HTTP_HOST="127.0.0.1:8000")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, f'window.GOOGLE_CLIENT_ID = "{settings.GOOGLE_CLIENT_ID}";')
        self.assertContains(response, "https://accounts.google.com/gsi/client")
        self.assertNotContains(response, "__GOOGLE_CLIENT_ID_JSON__")
        self.assertEqual(response["Cross-Origin-Opener-Policy"], "same-origin-allow-popups")
        self.assertEqual(response["Referrer-Policy"], "no-referrer-when-downgrade")
