import os
import sys

sys.path.append(r"C:\final_year_project\skill_link_app\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from applications.models import WorkAgreement
from accounts.models import WalletTransaction

agreement = WorkAgreement.objects.get(id=5)

print(f"Provider: {agreement.provider.username}")
print(f"Seeker: {agreement.seeker.username}")

print("\n--- All Transactions for Provider ---")
for t in WalletTransaction.objects.filter(user=agreement.provider):
    print(f"ID: {t.id} | Type: {t.transaction_type} | Amount: {t.amount} MATIC | Hash: {t.tx_hash}")

print("\n--- All Transactions for Seeker ---")
for t in WalletTransaction.objects.filter(user=agreement.seeker):
    print(f"ID: {t.id} | Type: {t.transaction_type} | Amount: {t.amount} MATIC | Hash: {t.tx_hash}")
