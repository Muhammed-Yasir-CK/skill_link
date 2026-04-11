from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Job
from .serializers import JobSerializer
from .permissions import IsCompanyUser
from applications.models import JobApplication

from django.db.models import Count

class CompanyJobCreateView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyUser]

    # def get(self, request):
    #     jobs = Job.objects.filter(company=request.user)
    #     serializer = JobSerializer(
    #         jobs,
    #         many=True,
    #         context={"request": request}
    #     )
    #     return Response(serializer.data)
    
    def get(self, request):

        jobs = Job.objects.filter(
            company=request.user,
            is_deleted=False
        ).annotate(
            applicant_count=Count('applications')
        )

        data = []

        for job in jobs:

            serializer = JobSerializer(
                job,
                context={"request": request}
            )

            # get first 3 applicants
            applications = JobApplication.objects.filter(
                company_job=job
            ).select_related("applicant")[:3]

            avatars = []
            for app in applications:
                if hasattr(app.applicant, "seeker_profile") and app.applicant.seeker_profile.profile_picture:
                    avatars.append(app.applicant.seeker_profile.profile_picture.url)
                # Diagnostic print moved inside and made safe
                print(f"DEBUG: Applicant: {app.applicant.username}, Profile: {hasattr(app.applicant, 'seeker_profile')}")

            job_data = serializer.data
            job_data["applicant_count"] = job.applicant_count
            job_data["applicant_avatars"] = avatars

            data.append(job_data)

        return Response(data)

    def post(self, request):
        company = request.user.company_profile
        if company.verification_status != 'verified':
            return Response(
                {"error": "Your account is not verified. Please complete your profile and wait for admin approval before posting jobs."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class JobStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyUser]



    def patch(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, company=request.user)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

        new_status = request.data.get('status')

        if new_status not in ['Active', 'Paused', 'Closed']:
            return Response({'error': 'Invalid status'}, status=400)

        # Optional business rule
        if job.status == 'Closed' and new_status != 'Closed':
            return Response({'error': 'Closed jobs cannot be reopened'}, status=400)

        job.status = new_status
        job.is_active = (new_status == 'Active')
        job.save()

        return Response({
            'id': job.id,
            'status': job.status,
            'is_active': job.is_active
        }, status=200)

    
    
class JobDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def delete(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, company=request.user)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # job.delete()
        job.is_deleted = True
        job.save()
        return Response(
            {'message': 'Job deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
        
        
from rest_framework.permissions import AllowAny
from work.models import WorkPost
from work.serializers import WorkPostSerializer


class SeekerJobListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Only ACTIVE company jobs
        company_jobs = Job.objects.filter(
            is_active=True,
            status='Active',
            is_deleted=False
        ).order_by('-created_at')

        # Only ACTIVE work posts
        user_works = WorkPost.objects.filter(
            is_active=True,
            status='active'
        ).order_by('-created_at')

        return Response({
            "company_jobs": JobSerializer(
                company_jobs,
                many=True,
                context={"request": request}
            ).data,

            "common_user_works": WorkPostSerializer(
                user_works,
                many=True,
                context={"request": request}
            ).data
        })
        


from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from .models import Job
from .serializers import JobSerializer


class JobDetailView(RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context