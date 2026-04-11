
from rest_framework import serializers
from .models import Job
from applications.models import SavedJob

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    company_logo = serializers.SerializerMethodField()
    company_website = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    applicants = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    class Meta:
        model = Job
        exclude = ['company']  # backend sets company automatically

    def get_company_logo(self, obj):
        user = obj.company
        if user and hasattr(user, 'company_profile') and user.company_profile.brand_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(user.company_profile.brand_logo.url)
            return user.company_profile.brand_logo.url
        return None

    def get_company_website(self, obj):
        user = obj.company
        if user and hasattr(user, 'company_profile') and user.company_profile.website:
            return user.company_profile.website
        return None

    # Optional validation: ensure salary_max >= salary_min
    def validate_salary_max(self, value):
        salary_min = self.initial_data.get('salary_min')
        if value and salary_min:
            try:
                salary_min = int(salary_min)
            except ValueError:
                raise serializers.ValidationError("Salary min must be a number")

            if value < salary_min:
                raise serializers.ValidationError("Salary max must be greater than or equal to salary min")
        return value
    
    def get_is_saved(self, obj):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(
                user=request.user,
                company_job=obj
            ).exists()

        return False
    def get_saved_id(self, obj):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            saved = SavedJob.objects.filter(
                user=request.user,
                company_job=obj
            ).first()
            return saved.id if saved else None

        return None

    def get_applicants(self, obj):
        return obj.applications.count()

    def get_is_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.applications.filter(applicant=request.user).exists()
        return False