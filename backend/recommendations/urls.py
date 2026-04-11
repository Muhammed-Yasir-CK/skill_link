from django.urls import path
from .views import recommended_jobs_view

urlpatterns = [
    path('jobs/', recommended_jobs_view, name='recommended-jobs'),
]
