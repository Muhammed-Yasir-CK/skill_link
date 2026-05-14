from django.contrib.auth.models import User
from django.db import models
from django.conf import settings
# Create your models here.
# backend/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('seeker', 'Job Seeker'),
        ('company', 'Company'),
        ('admin', 'Administrator'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    wallet_address = models.CharField(max_length=42, blank=True, null=True)
    encrypted_private_key = models.TextField(blank=True, null=True)
    wallet_type = models.CharField(
        max_length=20, 
        choices=[('managed', 'Managed'), ('external', 'External')],
        default='external'
    )
    is_wallet_active = models.BooleanField(default=False)

    def __str__(self):
        return self.username


       


class Company(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_profile"
    )
    # Core identity (minimal required)
    company_name = models.CharField(max_length=255)  # initial name from signup

    brand_logo = models.ImageField(
        upload_to="company_logos/",
        blank=True,
        null=True
    )
    
    # Profile
    company_legal_name = models.CharField(max_length=255, blank=True)
    brand_name = models.CharField(max_length=255, blank=True)
    company_type = models.CharField(max_length=50, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    founded_year = models.CharField(max_length=4, blank=True)
    description = models.TextField(blank=True)
    headquarters = models.CharField(max_length=255, blank=True)

    # Contact
    official_email = models.EmailField(blank=True)
    support_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    careers_page_url = models.URLField(blank=True)

    # Address
    registered_address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    branch_locations = models.TextField(blank=True)
    is_remote_friendly = models.BooleanField(default=False)

    # Legal
    registration_number = models.CharField(max_length=100, blank=True)
    business_type = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    registration_date = models.DateField(null=True, blank=True)
    registered_country = models.CharField(max_length=100, blank=True)

    VERIFICATION_STATUS_CHOICES = [
        ('unverified', 'Unverified'),
        ('pending', 'Pending Approval'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default="unverified"
    )
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class CompanyDocument(models.Model):
    DOCUMENT_KEYS = [
        ('registration', 'Business Registration'),
        ('tax', 'Tax / GST / EIN'),
        ('proof', 'Government Proof'),
        ('signatory', 'Authorized Signatory'),
    ]


    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_key = models.CharField(max_length=20, choices=DOCUMENT_KEYS)
    file = models.FileField(upload_to='company_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('company', 'document_key')




class JobSeekerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seeker_profile"
    )

    # Basic
    full_name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20, blank=True)
    profession = models.CharField(max_length=100, blank=True)
    other_profession = models.CharField(max_length=100, blank=True)

    # Address
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    area = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)

    # Work preferences
    location = models.CharField(max_length=255, blank=True)

    travel_willingness = models.CharField(max_length=50, blank=True)
    availability_status = models.CharField(max_length=50, blank=True)
    work_modes = models.JSONField(default=list)

    # Professional
    experience_level = models.CharField(max_length=50, blank=True)

    skills = models.JSONField(default=list)

    # Education
    qualification = models.CharField(max_length=255, blank=True)
    institution = models.CharField(max_length=255, blank=True)
    year = models.CharField(max_length=10, blank=True)

    # Summary
    summary = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    profile_picture = models.ImageField(
        upload_to="seeker_profiles/",
        blank=True,
        null=True
        )


class JobSeekerDocument(models.Model):
    DOCUMENT_TYPES = [
        ('resume', 'Resume'),
        ('work_proof', 'Work Proof'),
    ]

    profile = models.ForeignKey(
        JobSeekerProfile,
        on_delete=models.CASCADE,
        related_name="documents"
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to="seeker_documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile', 'document_type')


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Fiat Deposit (Treasury to Managed)'),
        ('escrow_lock', 'Escrow Lock (Managed to Smart Contract)'),
        ('income', 'Project Income (Smart Contract to Managed)'),
        ('withdrawal', 'Withdrawal (Managed to External Wallet)'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wallet_transactions"
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=18, decimal_places=8) # MATIC amount
    currency = models.CharField(max_length=10, default="MATIC")
    tx_hash = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default="completed")
    description = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount} MATIC"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('application', 'Application Update'),
        ('agreement', 'Agreement Update'),
        ('payment', 'Payment Received'),
        ('match', 'Job Match Alert'),
        ('system', 'System Message'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Metadata for linking
    link = models.CharField(max_length=255, blank=True, null=True) 

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.title}"
