from django.db import models
from accounts.models import CustomUser

class WorkPost(models.Model):

    # Choices
    WORK_NATURE_CHOICES = (
        ('Professional', 'Professional'),
        ('Local', 'Local'),
    )

    PAYMENT_TYPE_CHOICES = (
        ('Fixed', 'Fixed'),
        ('Hourly', 'Hourly'),
    )

    URGENCY_CHOICES = (
        ('Immediate', 'Immediate'),
        ('Flexible', 'Flexible'),
        ('Scheduled', 'Scheduled'),
    )

    WORK_LOCATION_TYPE_CHOICES = (
        ('Home', 'Home'),
        ('Office', 'Office'),
        ('Shop', 'Shop'),
        ('Construction Site', 'Construction Site'),
    )

    TOOLS_PROVIDED_BY_CHOICES = (
        ('Worker', 'Worker'),
        ('Me', 'Me'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    )

    # User who posts
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='work_posts'
    )

    # Step 1: Classification
    work_nature = models.CharField(max_length=20, choices=WORK_NATURE_CHOICES)
    category = models.CharField(max_length=100)

    # Step 2: Common Basics
    title = models.CharField(max_length=255)
    description = models.TextField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='Flexible')

    # Step 3: Professional Fields
    skills = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(max_length=50, blank=True, default='Intermediate')
    portfolio_required = models.BooleanField(default=False)
    deliverables = models.TextField(blank=True)
    professional_duration = models.CharField(max_length=50, blank=True, default='1-4 weeks')
    keywords = models.JSONField(default=list, blank=True)  # extra tags

    # Step 3: Local Fields
    city = models.CharField(max_length=100, blank=True)
    area = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    distance_preference = models.CharField(max_length=20, blank=True, default='5km')
    work_location_type = models.CharField(max_length=20, choices=WORK_LOCATION_TYPE_CHOICES, blank=True)
    tools_provided_by = models.CharField(max_length=20, choices=TOOLS_PROVIDED_BY_CHOICES, blank=True)
    local_time_estimate = models.CharField(max_length=50, blank=True, default='Half Day')
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time_slot = models.TimeField(null=True, blank=True)
    certification_required = models.BooleanField(default=False)

    # Step 4: Payment
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='Fixed')
    budget_min = models.IntegerField(null=True, blank=True)
    budget_max = models.IntegerField(null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')

    # Visibility / Contact
    contact_method = models.CharField(max_length=20, default='Chat')
    show_profile = models.BooleanField(default=True)

    # Meta
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.email})"
