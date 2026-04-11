from django.urls import path
from .views import CompanyJobCreateView,JobStatusUpdateView,JobDeleteView,SeekerJobListView,JobDetailView

urlpatterns = [
    path('company/jobs/', CompanyJobCreateView.as_view(), name='company_jobs_create'),
    path('company/jobs/<int:job_id>/status/', JobStatusUpdateView.as_view(), name='job_status_update'),
    path(
    'company/jobs/<int:job_id>/delete/',JobDeleteView.as_view(),name='job_delete'),
    path('seeker-jobs/', SeekerJobListView.as_view(), name='seeker-jobs'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    
]
