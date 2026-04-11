import os
import sys

sys.path.append(r"C:\final_year_project\skill_link_app\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from applications.models import WorkAgreement
from accounts.models import WalletTransaction

agreement = WorkAgreement.objects.get(id=5)

if agreement.status == 'completed':
    # Check if release is already recorded
    release_exists = WalletTransaction.objects.filter(
        user=agreement.provider, 
        transaction_type='escrow_release',
        tx_hash=agreement.tx_hash
    ).exists()
    
    if not release_exists:
        WalletTransaction.objects.create(
            user=agreement.provider,
            transaction_type='escrow_release',
            amount=agreement.amount,
            tx_hash=agreement.tx_hash,
            description=f"Escrow Released: {agreement.job_title}"
        )
        print("Logged escrow_release for provider")
        
    # Check if income is already recorded
    income_exists = WalletTransaction.objects.filter(
        user=agreement.seeker, 
        transaction_type='income',
        tx_hash=agreement.tx_hash
    ).exists()
    
    if not income_exists:
        WalletTransaction.objects.create(
            user=agreement.seeker,
            transaction_type='income',
            amount=agreement.amount,
            tx_hash=agreement.tx_hash,
            description=f"Payment Received: {agreement.job_title}"
        )
        print("Logged income for seeker")

print("Done")
