from accounts.models import JobSeekerProfile
from jobs.models import Job
from work.models import WorkPost
from .scoring_engine import calculate_match_score

def recommend_jobs_for_user(user_id, request=None):
    """
    Fetches all active jobs and work posts, scores them against the user's profile,
    and returns a ranked list.
    """
    try:
        seeker = JobSeekerProfile.objects.get(user_id=user_id)
    except JobSeekerProfile.DoesNotExist:
        return []

    # 1. Fetch Candidates (Company Jobs)
    company_jobs = Job.objects.filter(is_active=True, is_deleted=False).exclude(company=seeker.user)
    
    # 2. Fetch Candidates (Freelance/Local Work Posts)
    freelance_posts = WorkPost.objects.filter(is_active=True).exclude(user=seeker.user)

    recommendations = []

    # Score Company Jobs
    for job in company_jobs:
        score = calculate_match_score(seeker, job)
        
        logo_url = None
        if hasattr(job.company, 'company_profile') and job.company.company_profile.brand_logo:
             logo_url = job.company.company_profile.brand_logo.url
             if request:
                 logo_url = request.build_absolute_uri(logo_url)

        recommendations.append({
            "id": job.id,
            "title": job.title,
            "company": job.company.company_name if hasattr(job.company, 'company_name') else "Company",
            "company_logo": logo_url,
            "company_website": getattr(job.company.company_profile, 'website', '') if hasattr(job.company, 'company_profile') else '',
            "source": "company",
            "location": job.location or "Remote",
            "workType": job.employment_type,
            "salary": f"{job.salary_min} - {job.salary_max} {job.salary_currency}" if job.salary_min and job.salary_max else "Not specified",
            "posted": job.created_at.isoformat() if job.created_at else None,
            "tags": job.skills or [],
            "score": score,
            "category": job.category,
            "is_applied": job.applications.filter(applicant_id=user_id).exists()
        })

    # Score Freelance/Local Posts
    for post in freelance_posts:
        score = calculate_match_score(seeker, post)
        
        # Determine "Company Logo" for individual posters
        poster_logo = None
        poster_name = "Local User"
        if hasattr(post.user, 'seeker_profile') and post.user.seeker_profile.profile_picture:
            poster_logo = post.user.seeker_profile.profile_picture.url
            poster_name = post.user.seeker_profile.full_name
        elif hasattr(post.user, 'company_profile') and post.user.company_profile.brand_logo:
             poster_logo = post.user.company_profile.brand_logo.url
             poster_name = post.user.company_profile.company_name
        
        if poster_logo and request:
            poster_logo = request.build_absolute_uri(poster_logo)

        recommendations.append({
            "id": post.id,
            "title": post.title,
            "company": poster_name,
            "company_name": poster_name,
            "company_logo": poster_logo,
            "source": "local",
            "location": f"{post.area}, {post.city}" if post.city else "Remote",
            "workType": post.work_nature,
            "salary": f"{post.budget_min} - {post.budget_max} {post.currency}" if post.budget_min and post.budget_max else "Budget flexible",
            "posted": post.created_at.isoformat() if post.created_at else None,
            "tags": post.skills or [],
            "score": score,
            "category": post.category,
            "is_applied": post.applications.filter(applicant_id=user_id).exists()
        })

    # 3. Rank by score (highest first)
    ranked_recommendations = sorted(recommendations, key=lambda x: x["score"], reverse=True)

    return ranked_recommendations[:20]  # Return top 20
