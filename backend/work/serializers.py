from rest_framework import serializers
from .models import WorkPost
from applications.models import SavedJob


class WorkPostSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(
        source='user.seeker_profile.full_name',
        read_only=True
    )
    provider_id = serializers.IntegerField(
        source='user.id',
        read_only=True
    )
    is_saved = serializers.SerializerMethodField()
    saved_id = serializers.SerializerMethodField()
    applicants = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    class Meta:
        model = WorkPost
        exclude = ['user', 'is_active']

    def validate(self, data):
        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')

        if budget_min and budget_max and budget_max < budget_min:
            raise serializers.ValidationError(
                "budget_max must be greater than or equal to budget_min"
            )
        return data
    
    def get_is_saved(self, obj):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(
                user=request.user,
                user_job=obj
            ).exists()

        return False
    
    def get_saved_id(self, obj):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            saved = SavedJob.objects.filter(
                user=request.user,
                user_job=obj
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