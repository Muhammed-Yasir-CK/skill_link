import os
import sys

sys.path.append(r"C:\final_year_project\skill_link_app\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from accounts.models import WalletTransaction

# Delete the bad 1000 MATIC records out of the DB completely since there was no actual fiat-deposit locked originally
deleted, _ = WalletTransaction.objects.filter(amount=1000.0).delete()
print(f"Deleted {deleted} corrupted WalletTransactions of 1000 MATIC.")
