from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve as serve_static_file
from django.http import HttpResponse
from django.conf import settings
import os
import json

def serve_frontend(request):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    html_path = os.path.join(base_dir, 'html', 'index.html')
    with open(html_path, encoding='utf-8') as f:
        client_id = json.dumps(settings.GOOGLE_CLIENT_ID).replace('<', '\\u003c')
        response = HttpResponse(f.read().replace('__GOOGLE_CLIENT_ID_JSON__', client_id))
        # Google Identity Services needs to communicate with its popup window.
        response['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
        if request.get_host().split(':')[0] in {'localhost', '127.0.0.1'}:
            response['Referrer-Policy'] = 'no-referrer-when-downgrade'
        return response


def serve_html_asset(request, path):
    response = serve_static_file(request, path, document_root=settings.BASE_DIR / 'html')
    if path.endswith('.jsx'):
        response['Content-Type'] = 'application/javascript'
    return response

from users.otp_views import (
    request_email_otp,
    verify_email_otp,
    logout_view,
    current_user_view,
    google_callback,
)
from users.word_views import words_collection, word_detail
from users.folder_views import folder_list_or_create, folder_update_or_delete

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/email/request-otp/', request_email_otp),
    path('auth/email/verify-otp/', verify_email_otp),
    path('auth/me/', current_user_view),
    path('auth/logout/', logout_view),
    path('auth/google/callback/', google_callback),
    path('api/words/', words_collection),
    path('api/words/<int:word_id>/', word_detail),
    path('api/folders/', folder_list_or_create),
    path('api/folders/<int:folder_id>/', folder_update_or_delete),
    path('', serve_frontend),
    path('html/index.html', serve_frontend),
    re_path(
        r'^(?:html/)?(?P<path>(styles\.css|app\.jsx|components\.jsx|games\.jsx|i18n\.jsx|assets/.+|vendor/.+|favicon\.ico|logo\.svg))$',
        serve_html_asset,
    ),
]
