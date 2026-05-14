import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Notification, CustomUser

print("--- Notifications for user 'thomas' ---")
user = CustomUser.objects.filter(username='thomas').first()
if user:
    notifs = Notification.objects.filter(user=user).order_by('-created_at')
    for n in notifs:
        print(f"ID: {n.id}, Title: {n.title}, Read: {n.is_read}, Created: {n.created_at}")
else:
    print("User 'thomas' not found.")
