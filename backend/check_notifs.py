import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Notification, User

print("--- Notifications in DB ---")
notifs = Notification.objects.all().order_by('-created_at')[:10]
if not notifs:
    print("No notifications found.")
for n in notifs:
    print(f"User: {n.user.username}, Title: {n.title}, Type: {n.notification_type}, Created: {n.created_at}")

print("\n--- Users ---")
for u in User.objects.all():
    print(f"ID: {u.id}, Username: {u.username}")
