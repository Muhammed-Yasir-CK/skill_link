import os
import sys

sys.path.append(r"C:\final_year_project\skill_link_app\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from applications.models import WorkAgreement

try:
    agreement = WorkAgreement.objects.get(id=5)
    print(f"Agreement ID: {agreement.id}")
    print(f"Provider ID: {agreement.provider.id}")
    print(f"Provider Username: {agreement.provider.username}")
    print(f"Provider Type: {getattr(agreement.provider, 'user_type', 'unknown')}")
    print("---")
    print(f"Current Status: {agreement.status}")
except Exception as e:
    print(f"Error: {e}")
