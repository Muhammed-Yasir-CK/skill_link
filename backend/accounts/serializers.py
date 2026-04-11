# backend/accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser,Company,CompanyDocument,JobSeekerProfile,JobSeekerDocument
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


# Job Seeker Serializer
class JobSeekerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['user_type'] = 'seeker'
        return CustomUser.objects.create_user(**validated_data)

# Company Serializer
class CompanyRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'company_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['user_type'] = 'company'
        user = CustomUser.objects.create_user(**validated_data)
        
        # Create Company profile immediately
        Company.objects.create(
            user=user,
            company_name=validated_data.get("company_name", user.username)
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs.get("username"),
            password=attrs.get("password")
        )

        if not user:
            raise serializers.ValidationError("Invalid username or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_type": user.user_type,
            "username": user.username,
            "email": user.email
        }



class MeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    brand_logo = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "user_type",
            "company_name",
            "full_name",
            "wallet_address",
            "wallet_type",
            "is_superuser",
            "verification_status",
            "profile_picture",
            "brand_logo",
        ]

    def get_profile_picture(self, obj):
        if obj.user_type == "seeker" and hasattr(obj, "seeker_profile"):
            if obj.seeker_profile.profile_picture:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.seeker_profile.profile_picture.url)
                return obj.seeker_profile.profile_picture.url
        return None

    def get_brand_logo(self, obj):
        if obj.user_type == "company" and hasattr(obj, "company_profile"):
            if obj.company_profile.brand_logo:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.company_profile.brand_logo.url)
                return obj.company_profile.brand_logo.url
        return None

    def get_verification_status(self, obj):
        if obj.user_type == "company" and hasattr(obj, "company_profile"):
            return obj.company_profile.verification_status
        return None
    def get_full_name(self, obj):
        if obj.user_type == "seeker" and hasattr(obj, "seeker_profile"):
            return obj.seeker_profile.full_name
        return None

# class CompanyProfileSerializer(serializers.ModelSerializer):
#     #brand_logo = serializers.ImageField(required=False, allow_null=True) 
#     brand_logo = serializers.SerializerMethodField() 
#     class Meta:
#         model = Company
#         fields = "__all__"
#         #exclude = ["id", "user", "created_at", "updated_at", "verification_status", "rejection_reason"]
    
#     def get_brand_logo(self, obj):
#         if obj.brand_logo:
#             request = self.context.get("request")
#             # return request.build_absolute_uri(obj.brand_logo.url)
#             if request:
#                 return request.build_absolute_uri(obj.brand_logo.url)
#             return obj.brand_logo.url
#         return None


class CompanyProfileSerializer(serializers.ModelSerializer):
    brand_logo = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    posted_jobs_count = serializers.SerializerMethodField()
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Company
        fields = "__all__"

    def get_brand_logo(self, obj):
        if obj.brand_logo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.brand_logo.url)
            return obj.brand_logo.url
        return None

    def get_document_count(self, obj):
        return obj.documents.count()

    def get_posted_jobs_count(self, obj):
        # Assuming we have a Job model with a ForeignKey to Company or User
        # For now, let's just use a placeholder if the relationship isn't clear
        # But looking at models.py, Company is related to User, and Jobs are likely related to User or Company
        # Let's check imports in models.py or views.py to be sure
        return getattr(obj.user, 'posted_jobs', obj).count() if hasattr(obj.user, 'posted_jobs') else 0

class CompanyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDocument
        fields = ['id', 'document_key', 'file', 'uploaded_at']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    work_modes = serializers.ListField(
    child=serializers.CharField(),
    required=False
    )
    skills = serializers.ListField(
    child=serializers.CharField(),
    required=False
    )
    email = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()
    work_proof = serializers.SerializerMethodField()
    wallet_address = serializers.CharField(source="user.wallet_address", read_only=True)
    class Meta:
        model = JobSeekerProfile
        exclude = ["id", "user", "created_at", "updated_at"]

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

    def get_email(self, obj):
        return obj.user.email
    
    def get_resume(self, obj):
        request = self.context.get("request")
        doc = obj.documents.filter(document_type="resume").first()
        if doc and doc.file:
            return request.build_absolute_uri(doc.file.url)
        return None

    def get_work_proof(self, obj):
        request = self.context.get("request")
        doc = obj.documents.filter(document_type="work_proof").first()
        if doc and doc.file:
            return request.build_absolute_uri(doc.file.url)
        return None

class JobSeekerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeekerDocument
        fields = ["id", "document_type", "file", "uploaded_at"]

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'date_joined', 'user_type', 'is_active']
