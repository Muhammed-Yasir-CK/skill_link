import os
import django
import sys

# Set up Django environment
sys.path.append('c:/final_year_project/skill_link_app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from recommendations.skill_matcher import skill_match_score
from recommendations.location_matcher import location_match_score
from recommendations.scoring_engine import calculate_match_score

def test_skill_matcher():
    print("Testing Skill Matcher...")
    seeker_skills = ["Python", "Django", "React"]
    job_skills = ["Django", "PostgreSQL", "Docker"]
    score = skill_match_score(seeker_skills, job_skills)
    print(f"Score for {seeker_skills} vs {job_skills}: {score}")
    assert 0.3 <= score <= 0.35 # 1/3 match

def test_location_matcher():
    print("\nTesting Location Matcher...")
    class MockProfile:
        def __init__(self, city, state):
            self.city = city
            self.state = state
    
    class MockJob:
        def __init__(self, location, work_mode):
            self.location = location
            self.work_mode = work_mode

    seeker = MockProfile("Kochi", "Kerala")
    job_remote = MockJob("Bangalore", "remote")
    job_city = MockJob("Kochi, Kerala", "on_site")
    job_mismatch = MockJob("Mumbai", "on_site")

    print(f"Remote Score: {location_match_score(seeker, job_remote)}")
    print(f"City Match Score: {location_match_score(seeker, job_city)}")
    print(f"Mismatch Score: {location_match_score(seeker, job_mismatch)}")

def test_scoring_engine():
    print("\nTesting Scoring Engine...")
    class MockProfile:
        skills = ["Python", "Django"]
        city = "Kochi"
        state = "Kerala"
        experience_level = "Intermediate"
        profession = "Backend Developer"

    class MockJob:
        title = "Python Django Backend Developer"
        skills = ["Python", "Django", "AWS"]
        location = "Kochi"
        work_mode = "on_site"
        experience = "2-5 years (Intermediate)"

    seeker = MockProfile()
    job = MockJob()
    
    score = calculate_match_score(seeker, job)
    print(f"Final Match Score: {score}")
    assert score > 0.7

if __name__ == "__main__":
    try:
        test_skill_matcher()
        test_location_matcher()
        test_scoring_engine()
        print("\nAll unit tests passed!")
    except Exception as e:
        print(f"\nTest failed: {str(e)}")
