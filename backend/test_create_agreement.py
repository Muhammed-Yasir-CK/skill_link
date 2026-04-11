import os
import sys

# Set up Django
sys.path.append(r"C:\final_year_project\skill_link_app\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from applications.models import JobApplication

User = get_user_model()

# Grab any provider/company who has an application we can test with
user = User.objects.filter(is_superuser=True).first() or User.objects.first()
if getattr(user, 'user_type', None) == 'company' or getattr(user, 'user_type', None) == 'seeker':
    pass
else:
    # try to find a company user
    user = User.objects.filter(user_type='company').first() or user

# We need application ID 32 based on the user's log
application_id = 32

client = APIClient()
client.force_authenticate(user=user)

# Emulate the payload that the frontend sends
payload = {
    "description": "Test description",
    "deadline": "2026-12-31",
    "amount": "1000",
    "deliverables": [],
    "method": "Blockchain Escrow",
    "release_strategy": "",
    "terms": []
}

print(f"Testing CreateAgreementView with application_id={application_id}")
response = client.post(f"/api/provider/create-agreement/{application_id}/", payload, format="json")

print("\n--- RESPONSE ---")
print("Status Code:", response.status_code)
print("Data:", response.json())
