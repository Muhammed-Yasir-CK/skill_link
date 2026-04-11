from django.urls import path
from .views import WorkPostCreateView, WorkPostUpdateView, WorkPostDeleteView, WorkPostDetailView, WorkStatsView, WorkActivityView

urlpatterns = [
    # List all posts of logged-in user / Create new post
    path('work-posts/', WorkPostCreateView.as_view(), name='workpost-list-create'),

    # Update specific post
    path('work-posts/<int:post_id>/update/', WorkPostUpdateView.as_view(), name='workpost-update'),

    # Delete specific post
    path('work-posts/<int:post_id>/delete/', WorkPostDeleteView.as_view(), name='workpost-delete'),
    
    path('work-posts/<int:pk>/', WorkPostDetailView.as_view(), name='workpost-detail'),
    path('work-stats/', WorkStatsView.as_view(), name='work-stats'),
    path('work-activity/', WorkActivityView.as_view(), name='work-activity'),
]
