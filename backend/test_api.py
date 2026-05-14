import requests

# We need a token. I'll try to find an existing one or just skip this if I can't.
# Alternatively, I can just check the view logic again.

# Wait, I can just check the view's output by calling it in a django shell script.

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Notification, CustomUser
from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.views import NotificationView

factory = APIRequestFactory()
user = CustomUser.objects.filter(username='thomas').first()
view = NotificationView.as_view()

request = factory.get('/api/accounts/notifications/')
force_authenticate(request, user=user)
response = view(request)

print(f"Status: {response.status_code}")
print(f"Content: {json.dumps(response.data, indent=2, default=str)}")
