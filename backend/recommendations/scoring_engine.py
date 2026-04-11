from .skill_matcher import skill_match_score
from .location_matcher import location_match_score

def calculate_match_score(seeker_profile, job_instance):
    """
    Combines various matching scores into a final weighted score.
    """
    # 1. Skill Match (40% Weight)
    seeker_skills = seeker_profile.skills or []
    job_skills = getattr(job_instance, 'skills', [])
    skill_score = skill_match_score(seeker_skills, job_skills)

    # 2. Location Match (30% Weight)
    loc_score = location_match_score(seeker_profile, job_instance)

    # 3. Experience Match (20% Weight)
    # Simple logic: If seeker exp level matches job requirements
    # Improvement: parse '3+ years' vs profile.experience_level
    job_exp = (getattr(job_instance, 'experience', "") or "").lower()
    seeker_exp = (seeker_profile.experience_level or "").lower()
    
    experience_score = 0.5 # Default neutral
    if job_exp and seeker_exp:
        if seeker_exp in job_exp or job_exp in seeker_exp:
            experience_score = 1.0
        else:
            experience_score = 0.3

    # 4. Profession/Title Match (10% Weight)
    # Match seeker.profession against job.title
    seeker_profession = (seeker_profile.profession or "").lower()
    job_title = (getattr(job_instance, 'title', "") or "").lower()
    
    title_score = 0.5
    if seeker_profession and job_title:
        if seeker_profession in job_title or job_title in seeker_profession:
            title_score = 1.0

    # Weighted Calculation
    final_score = (
        (skill_score * 0.4) + 
        (loc_score * 0.3) + 
        (experience_score * 0.2) + 
        (title_score * 0.1)
    )

    return round(final_score, 2)
