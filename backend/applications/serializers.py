from rest_framework import serializers
from .models import JobApplication,SavedJob,ApplicationActivity
from work.serializers import WorkPostSerializer
from jobs.serializers import JobSerializer
from work.models import WorkPost
from jobs.models import Job




class ApplicationActivitySerializer(serializers.ModelSerializer):

    actor = serializers.CharField(source="actor.username")

    class Meta:
        model = ApplicationActivity
        fields = ["old_status", "new_status", "actor", "created_at"]


class JobApplicationSerializer(serializers.ModelSerializer):

    job_title = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job_source',
            'user_job',
            'company_job',
            'job_title',
            'applied_at'
        ]
        read_only_fields = ['applied_at']

    def get_job_title(self, obj):
        if obj.job_source == "user" and obj.user_job:
            return obj.user_job.title
        if obj.job_source == "company" and obj.company_job:
            return obj.company_job.title
        return None
    




class WorkPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkPost
        fields = "__all__"


class CompanyJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"

from jobs.serializers import JobSerializer

class SavedJobSerializer(serializers.ModelSerializer):
    user_job = WorkPostSerializer(read_only=True)
    company_job = JobSerializer(read_only=True)   # 🔥 IMPORTANT

    job_title = serializers.SerializerMethodField()

    class Meta:
        model = SavedJob
        fields = ['id', 'job_source', 'user_job', 'company_job', 'job_title']

    def get_job_title(self, obj):
        if obj.job_source == "user" and obj.user_job:
            return obj.user_job.title
        if obj.job_source == "company" and obj.company_job:
            return obj.company_job.title
        return None
    
from rest_framework import serializers
from .models import JobApplication

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_source",
            "applied_at",
            "job_title",
            "company_name",
            "company_logo",
            "status",
            "company_job_id",
            "user_job_id"
        ]

    def get_job_title(self, obj):
        if obj.job_source == "company" and obj.company_job:
            return obj.company_job.title
        if obj.job_source == "user" and obj.user_job:
            return obj.user_job.title
        return None

    def get_company_name(self, obj):

        # If company job
        if obj.job_source == "company" and obj.company_job:
            if obj.company_job.company:
                return obj.company_job.company.company_name
            return "Company Job"

        # If user/local job
        if obj.job_source == "user" and obj.user_job:
            if obj.user_job.user and hasattr(obj.user_job.user, 'seeker_profile'):
                return obj.user_job.user.seeker_profile.full_name
            return "Local Job"

        return None
        
    def get_company_logo(self, obj):
        request = self.context.get('request')
        
        if obj.job_source == "company" and obj.company_job:
            user = obj.company_job.company
            if user and hasattr(user, 'company_profile') and user.company_profile.brand_logo:
                if request:
                    return request.build_absolute_uri(user.company_profile.brand_logo.url)
                return user.company_profile.brand_logo.url
        
        if obj.job_source == "user" and obj.user_job:
            user = obj.user_job.user
            if user and hasattr(user, 'seeker_profile') and user.seeker_profile.profile_picture:
                if request:
                    return request.build_absolute_uri(user.seeker_profile.profile_picture.url)
                return user.seeker_profile.profile_picture.url
                
        return None
    
    

class WorkerApplicationSerializer(serializers.ModelSerializer):

    applicantName = serializers.CharField(
        source="applicant.seeker_profile.full_name",
        read_only=True
    )

    applicantRole = serializers.CharField(
        source="applicant.seeker_profile.profession",
        read_only=True
    )

    experience = serializers.CharField(
        source="applicant.seeker_profile.experience_level",
        read_only=True
    )

    profileSummary = serializers.CharField(
        source="applicant.seeker_profile.summary",
        read_only=True
    )
    
    email = serializers.SerializerMethodField()
    
    phone = serializers.SerializerMethodField()
    
    workTitle = serializers.SerializerMethodField()

    avatar = serializers.SerializerMethodField()

    resume = serializers.SerializerMethodField()

    certificate = serializers.SerializerMethodField()

    date = serializers.DateTimeField(
        source="applied_at",
        read_only=True
    )

    class Meta:
        model = JobApplication

        fields = [
            "id",
            "applicantName",
            "applicantRole",
            "workTitle",
            "status",
            "date",
            "experience",
            "profileSummary",
            "avatar",
            "resume",
            "certificate",
            "email",
            "phone",
        ]




    def get_workTitle(self, obj):

        if obj.job_source == "user" and obj.user_job:
            return obj.user_job.title

        if obj.job_source == "company" and obj.company_job:
            return obj.company_job.title

        return None



    def get_resume(self, obj):

        request = self.context.get("request")

        profile = getattr(obj.applicant, "seeker_profile", None)

        if not profile:
            return None

        resume_doc = profile.documents.filter(
            document_type="resume"
        ).first()

        if resume_doc:
            return request.build_absolute_uri(resume_doc.file.url)

        return None



    def get_certificate(self, obj):

        request = self.context.get("request")

        profile = getattr(obj.applicant, "seeker_profile", None)

        if not profile:
            return None

        cert_doc = profile.documents.filter(
            document_type="work_proof"
        ).first()

        if cert_doc:
            return request.build_absolute_uri(cert_doc.file.url)

        return None

    
    def get_avatar(self, obj):
        try:
            profile = obj.applicant.seeker_profile
            if profile.profile_picture:
                request = self.context.get("request")
                return request.build_absolute_uri(profile.profile_picture.url)
        except:
            pass

        return None
    
    
    def get_email(self, obj):
        try:
            return obj.applicant.email
        except:
            return ""

    def get_phone(self, obj):
        try:
            return obj.applicant.seeker_profile.mobile
        except:
            return ""
        
        
        
        
class CompanyApplicationSerializer(serializers.ModelSerializer):
    
    history = ApplicationActivitySerializer(
    many=True,
    read_only=True,
    source="activities"
    )
    candidateName = serializers.CharField(
        source="applicant.seeker_profile.full_name",
        read_only=True
    )

    role = serializers.CharField(
        source="applicant.seeker_profile.profession",
        read_only=True
    )

    experience = serializers.CharField(
        source="applicant.seeker_profile.experience_level",
        read_only=True
    )

    location = serializers.CharField(
        source="applicant.seeker_profile.location",
        read_only=True
    )

    bio = serializers.CharField(
        source="applicant.seeker_profile.summary",
        read_only=True
    )

    email = serializers.CharField(
        source="applicant.email",
        read_only=True
    )

    phone = serializers.CharField(
        source="applicant.seeker_profile.mobile",
        read_only=True
    )

    jobTitle = serializers.CharField(
        source="company_job.title",
        read_only=True
    )

    appliedDate = serializers.DateTimeField(
        source="applied_at",
        read_only=True
    )
    skills = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()
    certificates = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication

        fields = [
            "id",
            "candidateName",
            "role",
            "experience",
            "location",
            "bio",
            "email",
            "phone",
            "jobTitle",
            "status",
            "appliedDate",
            "avatar",
            "resume",
            "certificates",
            "skills",
            "history" 
        ]
        
        
    def get_avatar(self, obj):

        profile = getattr(obj.applicant, "seeker_profile", None)

        if profile and profile.profile_picture:

            request = self.context.get("request")

            return request.build_absolute_uri(
                profile.profile_picture.url
            )

        return None
    
    def get_resume(self, obj):

        profile = getattr(obj.applicant, "seeker_profile", None)

        if not profile:
            return None

        doc = profile.documents.filter(
            document_type="resume"
        ).first()

        if doc:

            request = self.context.get("request")

            return request.build_absolute_uri(doc.file.url)

        return None
    
    def get_certificates(self, obj):

        profile = getattr(obj.applicant, "seeker_profile", None)

        if not profile:
            return []

        docs = profile.documents.filter(
            document_type="work_proof"
        )

        request = self.context.get("request")

        return [
            request.build_absolute_uri(d.file.url)
            for d in docs
        ]
    
    def get_skills(self, obj):

        profile = getattr(obj.applicant, "seeker_profile", None)

        if not profile:
            return []

        if profile.skills:
            return profile.skills

        return []
    
    
    
