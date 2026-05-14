import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from work.models import WorkPost
from accounts.models import CustomUser

print(f"Total WorkPosts in DB: {WorkPost.objects.count()}")
for user in CustomUser.objects.all():
    count = WorkPost.objects.filter(user=user).count()
    if count > 0:
        print(f"User {user.email} has {count} work posts.")
