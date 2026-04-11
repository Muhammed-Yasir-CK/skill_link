import os
import django
import sys
import json
from datetime import date, timedelta

# Set up Django environment
sys.path.append('c:/final_year_project/skill_link_app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import CustomUser, JobSeekerProfile, Company
from jobs.models import Job
from work.models import WorkPost
import requests
from django.core.files.base import ContentFile

def download_image(name, is_profile=False):
    """Downloads a placeholder image from ui-avatars.com"""
    base_url = "https://ui-avatars.com/api/"
    params = f"?name={name.replace(' ', '+')}&background=random&size=512&bold=true"
    if is_profile:
        params += "&rounded=true"
    
    try:
        response = requests.get(base_url + params, timeout=10)
        if response.status_code == 200:
            suffix = "profile.png" if is_profile else "logo.png"
            filename = f"{name.lower().replace(' ', '_')}_{suffix}"
            return ContentFile(response.content, name=filename)
    except Exception as e:
        print(f"⚠️ Failed to download image for {name}: {e}")
    return None

def populate_data():
    print("🚀 Starting Comprehensive Data Population...")

    # --- 1. POPULATE SEEKERS ---
    seekers_data = [
        {
            "email": "rahul@test.com",
            "profile": {
                "full_name": "Rahul Sharma",
                "mobile": "9876543210",
                "profession": "Software Engineer",
                "city": "Bangalore",
                "state": "Karnataka",
                "country": "India",
                "pincode": "560001",
                "area": "MG Road",
                "location": "Bangalore, India",
                "travel_willingness": "Anywhere",
                "availability_status": "Available now",
                "experience_level": "3–5 years",
                "work_modes": ["Remote", "Hybrid"],
                "skills": ["python", "django", "postgresql", "rest", "docker", "javascript"],
                "qualification": "B.Tech Computer Science",
                "institution": "IIT Madras",
                "year": "2020",
                "summary": "Experienced backend developer with a passion for building scalable web applications. Expert in Python and Django."
            }
        },
        {
            "email": "anisha@test.com",
            "profile": {
                "full_name": "Anisha V.R.",
                "mobile": "9876543211",
                "profession": "IoT Specialist",
                "city": "Kochi",
                "state": "Kerala",
                "country": "India",
                "pincode": "682030",
                "area": "Kakkanad",
                "location": "Kochi, Kerala",
                "travel_willingness": "Within city",
                "availability_status": "Available now",
                "experience_level": "3–5 years",
                "work_modes": ["Onsite"],
                "skills": ["python", "iot", "electronics", "raspberry pi", "c++", "arduino"],
                "qualification": "M.Tech Electronics",
                "institution": "CUSAT",
                "year": "2019",
                "summary": "IoT specialist with expertise in embedded systems and sensor integration. Focused on smart agriculture solutions."
            }
        },
        {
            "email": "kevin@test.com",
            "profile": {
                "full_name": "Kevin Peter",
                "mobile": "9876543212",
                "profession": "Full Stack Dev",
                "city": "Kochi",
                "state": "Kerala",
                "country": "India",
                "pincode": "682030",
                "area": "Kakkanad",
                "location": "Kochi, Kerala",
                "travel_willingness": "Nearby districts",
                "availability_status": "Available now",
                "experience_level": "1–3 years",
                "work_modes": ["Remote", "Hybrid"],
                "skills": ["python", "react", "django", "javascript", "css", "html5"],
                "qualification": "MCA",
                "institution": "Rajagiri College",
                "year": "2021",
                "summary": "Full stack developer comfortable with both React and Django. Love building user-centric interfaces."
            }
        },
        {
            "email": "siddharth@test.com",
            "profile": {
                "full_name": "Siddharth Nair",
                "mobile": "9876543213",
                "profession": "Software Engineer",
                "city": "Trivandrum",
                "state": "Kerala",
                "country": "India",
                "pincode": "695001",
                "area": "Kazhakkuttam",
                "location": "Trivandrum, Kerala",
                "travel_willingness": "Within city",
                "availability_status": "Available now",
                "experience_level": "Fresher",
                "work_modes": ["Onsite"],
                "skills": ["react", "html", "css", "javascript"],
                "qualification": "B.Sc Computer Science",
                "institution": "Kerala University",
                "year": "2023",
                "summary": "Recent graduate eager to start a career in web development. Strong foundation in JavaScript and React."
            }
        },
        {
            "email": "maria@test.com",
            "profile": {
                "full_name": "Maria Gomez",
                "mobile": "9876543214",
                "profession": "Other",
                "other_profession": "HR Manager",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "pincode": "400001",
                "area": "Colaba",
                "location": "Mumbai, Maharashtra",
                "travel_willingness": "Anywhere",
                "availability_status": "Available part-time",
                "experience_level": "5+ years",
                "work_modes": ["Hybrid"],
                "skills": ["hiring", "payroll", "management", "recruitment", "public relations"],
                "qualification": "MBA HR",
                "institution": "JBIMS Mumbai",
                "year": "2016",
                "summary": "Seasoned HR professional with extensive experience in talent acquisition and employee management."
            }
        }
    ]

    for item in seekers_data:
        try:
            user = CustomUser.objects.get(email=item['email'])
            profile, created = JobSeekerProfile.objects.get_or_create(user=user)
            for key, value in item['profile'].items():
                setattr(profile, key, value)
            
            # Download profile picture if not exists
            if not profile.profile_picture:
                img_file = download_image(profile.full_name, is_profile=True)
                if img_file:
                    profile.profile_picture.save(img_file.name, img_file, save=False)
                    
            profile.save()
            print(f"✅ Populated Seeker Profile: {item['email']}")
        except CustomUser.DoesNotExist:
            print(f"⚠️ User not found: {item['email']}")

    # --- 2. POPULATE COMPANIES ---
    companies_data = [
        {
            "email": "nexus@test.com",
            "profile": {
                "company_name": "Nexus Tech Solutions",
                "company_legal_name": "Nexus Technological Solutions Private Limited",
                "brand_name": "Nexus Tech",
                "company_type": "Private",
                "industry": "Technology",
                "company_size": "51-200",
                "founded_year": "2015",
                "description": "Nexus Tech Solutions is a leading provider of innovative IT solutions, specialized in blockchain, AI, and cloud computing.",
                "headquarters": "Kochi, Kerala, India",
                "official_email": "contact@nexustech.com",
                "support_email": "support@nexustech.com",
                "phone_number": "+91 484 2345678",
                "website": "https://nexustech.io",
                "linkedin_url": "https://linkedin.com/company/nexus-tech",
                "twitter_url": "https://twitter.com/nexustech",
                "careers_page_url": "https://nexustech.io/careers",
                "registered_address": "Building 45, Infopark Phase II, Kakkanad",
                "city": "Kochi",
                "state": "Kerala",
                "country": "India",
                "postal_code": "682030",
                "branch_locations": "Bangalore, Chennai, Hyderabad",
                "is_remote_friendly": True,
                "registration_number": "U72200KL2015PTC037845",
                "business_type": "Private Limited",
                "tax_id": "32AAACN1234F1Z5",
                "registration_date": date(2015, 6, 12),
                "registered_country": "India",
                "verification_status": "verified"
            },
            "jobs": [
                {
                    "title": "Senior Python Backend Developer",
                    "category": "Software Development",
                    "employment_type": "Full-time",
                    "seniority_level": "Senior",
                    "work_mode": "remote",
                    "location": "Bangalore",
                    "skills": ["Python", "Django", "PostgreSQL", "AWS", "Docker", "REST API"],
                    "experience": "5+ years",
                    "salary_min": 1200000,
                    "salary_max": 1800000,
                    "application_deadline": date.today() + timedelta(days=90),
                    "description": "We are looking for a Senior Python Developer to join our core backend team. You will be responsible for designing and implementing scalable APIs, managing cloud infrastructure on AWS, and optimizing database performance. Requirements include proficiency in Python/Django, experience with containerization using Docker, and strong knowledge of PostgreSQL."
                },
                {
                    "title": "Junior Frontend Developer",
                    "category": "Web Development",
                    "employment_type": "Internship",
                    "seniority_level": "Entry-level",
                    "work_mode": "on_site",
                    "location": "Kochi, Vyttila",
                    "skills": ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
                    "experience": "0-1 year",
                    "salary_min": 250000,
                    "salary_max": 350000,
                    "application_deadline": date.today() + timedelta(days=60),
                    "description": "Exiciting opportunity for a Junior Frontend Developer to work on modern web architectures. You will collaborate with designers to build responsive UI components using React and Tailwind CSS. Basic understanding of JavaScript ES6+ and modern CSS techniques is required."
                }
            ]
        },
        {
            "email": "greenhorizon@test.com",
            "profile": {
                "company_name": "GreenHorizon AgriTech",
                "company_legal_name": "GreenHorizon Agri-Technology Solutions",
                "brand_name": "GreenHorizon",
                "company_type": "Startup",
                "industry": "Agriculture",
                "company_size": "11-50",
                "founded_year": "2020",
                "description": "GreenHorizon AgriTech is dedicated to revolutionizing farming through IoT and advanced data analytics. Our mission is to empower farmers with real-time data to optimize crop yield and reduce resource waste.",
                "headquarters": "Kochi, Kerala, India",
                "official_email": "hello@greenhorizon.com",
                "support_email": "hr@greenhorizon.com",
                "phone_number": "+91 484 9876543",
                "website": "https://greenhorizon.agri",
                "linkedin_url": "https://linkedin.com/company/greenhorizon",
                "twitter_url": "https://twitter.com/greenhorizon",
                "careers_page_url": "https://greenhorizon.agri/jobs",
                "registered_address": "Suite 102, Startup Village, Kalamassery",
                "city": "Kochi",
                "state": "Kerala",
                "country": "India",
                "postal_code": "682030",
                "branch_locations": "No other branches",
                "is_remote_friendly": False,
                "registration_number": "U01100KL2020PTC062341",
                "business_type": "Private Limited",
                "tax_id": "32BBBDN5678G1Z9",
                "registration_date": date(2020, 1, 15),
                "registered_country": "India",
                "verification_status": "verified"
            },
            "jobs": [
                {
                    "title": "IoT System Integrator",
                    "category": "Engineering",
                    "employment_type": "Full-time",
                    "seniority_level": "Intermediate",
                    "work_mode": "hybrid",
                    "location": "Kochi, Kakkanad",
                    "skills": ["Python", "IoT", "Raspberry Pi", "Arduino", "MQTT", "Sensors"],
                    "experience": "2+ years",
                    "salary_min": 600000,
                    "salary_max": 800000,
                    "application_deadline": date.today() + timedelta(days=120),
                    "description": "Join our R&D team to integrate IoT sensors with our cloud platform. You will work on Arduino and Raspberry Pi based systems to capture agricultural data. Proficiency in Python and experience with MQTT protocol are essential."
                }
            ]
        }
    ]

    for item in companies_data:
        try:
            user = CustomUser.objects.get(email=item['email'])
            comp, created = Company.objects.get_or_create(user=user)
            for key, value in item['profile'].items():
                setattr(comp, key, value)
            
            # Download brand logo if not exists
            if not comp.brand_logo:
                logo_file = download_image(comp.company_name, is_profile=False)
                if logo_file:
                    comp.brand_logo.save(logo_file.name, logo_file, save=False)

            comp.save()
            print(f"✅ Populated Company & Verified: {item['email']}")

            for j_data in item['jobs']:
                Job.objects.update_or_create(
                    company=user,
                    title=j_data['title'],
                    defaults=j_data
                )
            print(f"✅ Created {len(item['jobs'])} Jobs for: {item['email']}")
        except CustomUser.DoesNotExist:
            print(f"⚠️ User not found: {item['email']}")

    # --- 3. POPULATE WORKPOSTS ---
    work_posts_data = [
        {
            "email": "rahul@test.com",
            "posts": [
                {
                    "title": "Kitchen Sink Leakage Repair",
                    "work_nature": "Local",
                    "category": "Plumbing",
                    "description": "The main kitchen sink is leaking from the pipe junction. Need someone to fix it immediately. The work involves replacing a section of the PVC pipe and ensuring the seal is watertight.",
                    "city": "Bangalore",
                    "area": "MG Road",
                    "pincode": "560001",
                    "work_location_type": "Home",
                    "tools_provided_by": "Worker",
                    "urgency": "Immediate",
                    "budget_min": 500,
                    "budget_max": 1200,
                    "currency": "INR",
                    "skills": ["Pipe Repair", "Leak Detection", "Plumbing Basics"],
                    "is_active": True
                },
                {
                    "title": "Garden Fence Painting",
                    "work_nature": "Local",
                    "category": "Maintenance",
                    "description": "Wooden fence around the garden needs a fresh coat of white paint. Paint will be provided. The worker should bring their own brushes and protective sheets for the grass.",
                    "city": "Bangalore",
                    "area": "Indiranagar",
                    "pincode": "560038",
                    "work_location_type": "Home",
                    "tools_provided_by": "Me",
                    "urgency": "Flexible",
                    "budget_min": 2000,
                    "budget_max": 3500,
                    "currency": "INR",
                    "skills": ["Painting", "Surface Preparation", "Exterior Maintenance"],
                    "is_active": True
                }
            ]
        },
        {
            "email": "anisha@test.com",
            "posts": [
                {
                    "title": "Office AC Servicing",
                    "work_nature": "Local",
                    "category": "Electrical",
                    "description": "Two split AC units in the office need general servicing and gas check. One unit is making a rattling noise and might need a fan adjustment.",
                    "city": "Kochi",
                    "area": "Kakkanad",
                    "pincode": "682030",
                    "work_location_type": "Office",
                    "tools_provided_by": "Worker",
                    "urgency": "Scheduled",
                    "budget_min": 1500,
                    "budget_max": 2500,
                    "currency": "INR",
                    "skills": ["AC Maintenance", "Gas Refitting", "Electrical Diagnostics"],
                    "is_active": True
                },
                {
                    "title": "Assemble IKEA Bookshelves",
                    "work_nature": "Local",
                    "category": "Carpentry",
                    "description": "Need help assembling 3 large Billy bookshelves. All parts and manuals available. Experience in following IKEA manuals is a plus.",
                    "city": "Kochi",
                    "area": "Edapally",
                    "pincode": "682024",
                    "work_location_type": "Home",
                    "tools_provided_by": "Me",
                    "urgency": "Flexible",
                    "budget_min": 1000,
                    "budget_max": 2000,
                    "currency": "INR",
                    "skills": ["Furniture Assembly", "Carpentry Basics", "Manual Reading"],
                    "is_active": True
                }
            ]
        }
    ]

    for item in work_posts_data:
        try:
            user = CustomUser.objects.get(email=item['email'])
            for p_data in item['posts']:
                WorkPost.objects.update_or_create(
                    user=user,
                    title=p_data['title'],
                    defaults=p_data
                )
            print(f"✅ Created {len(item['posts'])} Local WorkPosts for: {item['email']}")
        except Exception as e:
            print(f"⚠️ Could not create WorkPosts for {item['email']}: {e}")

if __name__ == "__main__":
    populate_data()
    print("\n🏁 Final robust population completed.")
