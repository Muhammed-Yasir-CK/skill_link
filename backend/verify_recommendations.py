import os
import django
import sys
import json

# Set up Django environment
sys.path.append('c:/final_year_project/skill_link_app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import CustomUser
from recommendations.services import recommend_jobs_for_user

def verify_recommendations():
    test_emails = [
        "rahul@test.com",    # Should see Nexus Job 1 (Senior Python)
        "anisha@test.com",   # Should see GreenHorizon Job (IoT)
        "siddharth@test.com" # Should see Nexus Job 2 (Junior Frontend)
    ]

    for email in test_emails:
        try:
            user = CustomUser.objects.get(email=email)
            results = recommend_jobs_for_user(user.id)
            print(f"\n🔍 Recommendations for {user.username} ({email}):")
            if not results:
                print("   No recommendations found.")
                continue
            
            for i, res in enumerate(results[:3], 1):
                print(f"   {i}. {res['title']} at {res['company_name']} (Score: {res['score']}) - {res['type']}")
        except Exception as e:
            print(f"❌ Error for {email}: {e}")

if __name__ == "__main__":
    verify_recommendations()
