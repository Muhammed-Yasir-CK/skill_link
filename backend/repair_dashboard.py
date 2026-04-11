import os
import sys

sys.path.append(r"C:\final_year_project\skill_link_app\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from applications.models import WorkAgreement
from accounts.models import WalletTransaction

agreement = WorkAgreement.objects.get(id=5)

# First get the actual locked amount
lock_tx = WalletTransaction.objects.filter(
    user=agreement.provider,
    transaction_type='escrow_lock'
).order_by('-timestamp').first()

if not lock_tx:
    print("Could not find the original lock transaction")
    sys.exit(1)

proper_amount = lock_tx.amount
print(f"Proper amount is {proper_amount} MATIC")

# Update the corrupted Provider Release
release_tx = WalletTransaction.objects.filter(
    user=agreement.provider,
    transaction_type='escrow_release',
    tx_hash=agreement.tx_hash
).first()

if release_tx and release_tx.amount != proper_amount:
    print(f"Fixing Provider Release from {release_tx.amount} to {proper_amount}")
    release_tx.amount = proper_amount
    release_tx.save()

# Update the corrupted Seeker Income
income_tx = WalletTransaction.objects.filter(
    user=agreement.seeker,
    transaction_type='income',
    tx_hash=agreement.tx_hash
).first()

if income_tx and income_tx.amount != proper_amount:
    print(f"Fixing Seeker Income from {income_tx.amount} to {proper_amount}")
    income_tx.amount = proper_amount
    income_tx.save()

print("Database fixed successfully.")
