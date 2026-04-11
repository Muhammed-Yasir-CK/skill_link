from django.shortcuts import render

# Create your views here.


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import WorkPost
from .serializers import WorkPostSerializer
from .permissions import IsOwnerUser
from applications.models import JobApplication, WorkAgreement

class WorkPostCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # List all work posts by logged-in user
        posts = WorkPost.objects.filter(user=request.user).order_by('-created_at')
        #serializer = WorkPostSerializer(posts, many=True)
        serializer = WorkPostSerializer(
            posts,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = WorkPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    
class WorkPostUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerUser]

    def patch(self, request, post_id):
        try:
            post = WorkPost.objects.get(id=post_id, user=request.user)
        except WorkPost.DoesNotExist:
            return Response({'error': 'Work post not found'}, status=404)

        serializer = WorkPostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkPostDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerUser]

    def delete(self, request, post_id):
        try:
            post = WorkPost.objects.get(id=post_id, user=request.user)
        except WorkPost.DoesNotExist:
            return Response({'error': 'Work post not found'}, status=404)

        post.delete()
        return Response({'message': 'Work post deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


from rest_framework.generics import RetrieveAPIView

# class WorkPostDetailView(RetrieveAPIView):
#     queryset = WorkPost.objects.all()
#     serializer_class = WorkPostSerializer
#     permission_classes = [IsAuthenticated]

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context["request"] = self.request
#         return context

#     def get(self, request, pk):
#         try:
#             post = WorkPost.objects.get(id=pk)
#         except WorkPost.DoesNotExist:
#             return Response({'error': 'Work post not found'}, status=404)

#         serializer = WorkPostSerializer(post,context={"request": request})
#         return Response(serializer.data)

from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import WorkPost
from .serializers import WorkPostSerializer


class WorkPostDetailView(RetrieveAPIView):
    queryset = WorkPost.objects.all()
    serializer_class = WorkPostSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

class WorkStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        active_works = WorkPost.objects.filter(user=user, is_active=True).count()
        
        pending_applicants = JobApplication.objects.filter(
            user_job__user=user, 
            status="Pending"
        ).count()
        
        # In Progress: Accepted but not yet completed
        in_progress = WorkAgreement.objects.filter(
            seeker=user, 
            status__in=["accepted", "in_progress", "submitted"]
        ).count()
        
        completed = WorkAgreement.objects.filter(
            seeker=user, 
            status="completed"
        ).count()

        return Response({
            "active_works": active_works,
            "pending_applicants": pending_applicants,
            "in_progress": in_progress,
            "completed": completed
        })

class WorkActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # New Applicants
        recent_apps = JobApplication.objects.filter(
            user_job__user=user
        ).order_by('-applied_at')[:3]
        
        activities = []
        for app in recent_apps:
            activities.append({
                "type": "new_applicant",
                "title": f"New applicant for {app.user_job.title}",
                "detail": app.applicant.username,
                "timestamp": app.applied_at.isoformat()
            })
            
        # Agreement Updates
        recent_agreements = WorkAgreement.objects.filter(
            seeker=user
        ).order_by('-created_at')[:3]
        
        for ag in recent_agreements:
            activities.append({
                "type": "agreement",
                "title": f"Agreement for {ag.job_title}",
                "detail": ag.status.replace('_', ' ').title(),
                "timestamp": ag.created_at.isoformat()
            })
            
        # Sort combined activities by timestamp
        activities = sorted(activities, key=lambda x: x['timestamp'], reverse=True)[:3]

        return Response(activities)