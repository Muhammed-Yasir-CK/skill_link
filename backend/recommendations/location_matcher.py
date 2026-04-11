def location_match_score(seeker_profile, job_instance):
    """
    Calculates a location-based score.
    seeker_profile: accounts.models.JobSeekerProfile
    job_instance: jobs.models.Job or work.models.WorkPost
    """
    # 1. Check for Work Mode
    work_mode = getattr(job_instance, 'work_mode', None)
    work_nature = getattr(job_instance, 'work_nature', None) # for WorkPost
    
    # 2. Extract seeker and job location data
    seeker_city = (seeker_profile.city or "").lower().strip()
    seeker_pincode = (seeker_profile.pincode or "").strip()
    seeker_area = (seeker_profile.area or "").lower().strip()

    job_city = (getattr(job_instance, 'city', getattr(job_instance, 'location', "")) or "").lower().strip()
    job_pincode = (getattr(job_instance, 'pincode', "") or "").strip()
    job_area = (getattr(job_instance, 'area', "") or "").lower().strip()

    # Determine if the job is effectively remote
    is_remote = work_mode == 'remote' or (work_nature == 'Professional' and not job_city and not job_pincode)

    if is_remote:
        return 1.0

    # 3. Hyper-local Matching (Geo-fence)
    # Highest priority: Pincode match
    if seeker_pincode and job_pincode and seeker_pincode == job_pincode:
        return 1.0
    
    # High priority: Area match
    if seeker_area and job_area and (seeker_area in job_area or job_area in seeker_area):
        return 0.9

    # Medium priority: City match
    if seeker_city and job_city and (seeker_city in job_city or job_city in seeker_city):
        return 0.8
    
    # State check
    seeker_state = (seeker_profile.state or "").lower().strip()
    if seeker_state and seeker_state in job_city:
        return 0.5

    # Default if no match found but required (on-site/local)
    if work_nature == 'Local' or work_mode in ['on_site', 'hybrid']:
        return 0.1
        
    return 0.4  # Neutral default
