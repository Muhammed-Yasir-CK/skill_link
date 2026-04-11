def skill_match_score(seeker_skills, job_skills):
    """
    Calculates a score based on the intersection of seeker skills and job skills.
    Returns a float between 0 and 1.
    """
    if not job_skills:
        return 0.5  # Neutral if no skills required

    seeker_set = set([s.lower() for s in seeker_skills])
    job_set = set([s.lower() for s in job_skills])

    common = seeker_set.intersection(job_set)
    
    # Matching ratio: How many of the required skills does the seeker have?
    score = len(common) / len(job_set) if len(job_set) > 0 else 0
    
    return score
