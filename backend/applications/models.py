from django.db import models
from django.conf import settings
from work.models import WorkPost
from jobs.models import Job   
from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from work.models import WorkPost
from jobs.models import Job
from django.core.exceptions import ValidationError


class JobApplication(models.Model):

    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Review", "Review"),
        ("Shortlisted", "Shortlisted"),
        ("Interview", "Interview"),
        ("Selected", "Selected"),
        ("Rejected", "Rejected"),
    )

    JOB_SOURCE_CHOICES = (
        ("user", "User Job"),
        ("company", "Company Job"),
    )

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_applications"
    )

    job_source = models.CharField(
        max_length=20,
        choices=JOB_SOURCE_CHOICES
    )

    user_job = models.ForeignKey(
        WorkPost,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    company_job = models.ForeignKey(
        Job,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-applied_at"]

        unique_together = (
            ("applicant", "user_job"),
            ("applicant", "company_job"),
        )

        indexes = [
            models.Index(fields=["applicant"]),
            models.Index(fields=["user_job"]),
            models.Index(fields=["company_job"]),
        ]

    def clean(self):

        if self.job_source == "user" and not self.user_job:
            raise ValidationError("User job must be set")

        if self.job_source == "company" and not self.company_job:
            raise ValidationError("Company job must be set")

    def get_job_title(self):

        if self.job_source == "user" and self.user_job:
            return self.user_job.title

        if self.job_source == "company" and self.company_job:
            return self.company_job.title

        return None

    def __str__(self):

        title = self.get_job_title()

        return f"{self.applicant.username} applied to {title}"
    
    
from django.db import models
from django.conf import settings
from work.models import WorkPost
from jobs.models import Job


class SavedJob(models.Model):

    JOB_SOURCE_CHOICES = (
        ('user', 'User Job'),
        ('company', 'Company Job'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_jobs"
    )

    job_source = models.CharField(max_length=20, choices=JOB_SOURCE_CHOICES)

    user_job = models.ForeignKey(
        WorkPost,
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )

    company_job = models.ForeignKey(
        Job,
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )

    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            ('user', 'user_job'),
            ('user', 'company_job'),
        )
        
        
        
class ApplicationActivity(models.Model):

    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application.id}: {self.old_status} → {self.new_status}"
    
    
    
from django.db import models
from django.conf import settings
from applications.models import JobApplication


class WorkAgreement(models.Model):

    STATUS_CHOICES = [
        ("pending", "Agreement Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("in_progress", "InProgress"),
        ("submitted", "Submitted"),
        ("paid", "Payment Released"),
        ("completed", "Completed"),
    ]

    application = models.OneToOneField(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="agreement"
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provided_agreements"
    )

    seeker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_agreements"
    )

    job_title = models.CharField(max_length=255)

    description = models.TextField()

    deliverables = models.JSONField(default=list)

    deadline = models.DateField(null=True, blank=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    currency = models.CharField(max_length=10, default="INR")

    payment_method = models.CharField(max_length=50, default="Blockchain Escrow")

    release_strategy = models.CharField(max_length=255, null=True, blank=True)

    terms = models.JSONField(default=list)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    tx_hash = models.CharField(max_length=255, null=True, blank=True)
    on_chain_id = models.IntegerField(null=True, blank=True, help_text="Agreement ID in the smart contract")

    # Work Submission Fields
    submission_notes = models.TextField(null=True, blank=True)
    submission_attachment = models.FileField(upload_to="agreement_submissions/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_title} - {self.provider.username}"