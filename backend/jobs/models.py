from django.db import models
from accounts.models import CustomUser



class Job(models.Model):

    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Paused', 'Paused'),
        ('Closed', 'Closed'),
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='Active'
    )


    WORK_MODE_CHOICES = (
        ('on_site', 'On-site'),
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
    )

    SALARY_PERIOD_CHOICES = (
        ('yearly', 'Yearly'),
        ('monthly', 'Monthly'),
        ('hourly', 'Hourly'),
    )

    APPLICATION_METHOD_CHOICES = (
        ('in_app', 'Via App'),
        ('external', 'External Link'),
    )

    company = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='posted_jobs'
    )

    # Basic Info
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=50)
    seniority_level = models.CharField(max_length=50)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES)
    location = models.CharField(max_length=255, blank=True)

    # Details
    description = models.TextField()
    skills = models.JSONField(default=list)
    education = models.CharField(max_length=255, blank=True)
    experience = models.CharField(max_length=100, blank=True)
    certifications = models.CharField(max_length=255, blank=True)

    # Compensation
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='INR')
    salary_period = models.CharField(
        max_length=20,
        choices=SALARY_PERIOD_CHOICES,
        default='yearly'
    )
    benefits = models.JSONField(default=list)

    # Application
    application_deadline = models.DateField()
    application_method = models.CharField(
        max_length=20,
        choices=APPLICATION_METHOD_CHOICES,
        default='in_app'
    )
    application_link = models.URLField(blank=True)
    openings = models.PositiveIntegerField(default=1)

    # Search & Extras
    tags = models.JSONField(default=list)
    short_summary = models.CharField(max_length=300, blank=True)
    screening_questions = models.JSONField(default=list)

    # Meta
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    #new change for manage application life
    is_deleted = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.title} ({self.company.company_name})"
