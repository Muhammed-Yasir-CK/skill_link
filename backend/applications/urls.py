from django.urls import path, include
from rest_framework.routers import DefaultRouter
from applications.views import JobApplicationViewSet, SavedJobViewSet,MyApplicationsView,WorkerReceivedApplicationsView,UpdateApplicationStatusView,CompanyReceivedApplicationsView,CreateAgreementView,GetAgreementView,UpdateAgreementView,SeekerGetAgreementView,SeekerRespondAgreementView, ProviderPayAgreementView, SeekerSubmitWorkView, ProviderApproveWorkView, UserCompletedWorksView

router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet, basename='applications')
router.register(r'saved-jobs', SavedJobViewSet, basename='saved-jobs')

urlpatterns = [
    path('', include(router.urls)),
    path("my-applications/", MyApplicationsView.as_view()),
    path(
        "worker/received-applications/",
        WorkerReceivedApplicationsView.as_view()
    ),
    path(
        "jobapplications/<int:pk>/",
        UpdateApplicationStatusView.as_view(),
    ),
    path(
        "company/received-applications/",
        CompanyReceivedApplicationsView.as_view()
    ),
    path(
        "company/update-application-status/<int:pk>/",
        UpdateApplicationStatusView.as_view(),
        name="update_application_status",
    ),
    path(
        "provider/create-agreement/<int:application_id>/",
        CreateAgreementView.as_view()
    ),

    path(
        "provider/get-agreement/<int:application_id>/",
        GetAgreementView.as_view()
    ),

    path(
        "provider/update-agreement/<int:agreement_id>/",
        UpdateAgreementView.as_view()
    ),
    path(
        "seeker/get-agreement/<int:application_id>/",
        SeekerGetAgreementView.as_view()
    ),
    path(
        "seeker/respond-agreement/<int:application_id>/",
        SeekerRespondAgreementView.as_view()
    ),
    path(
        "provider/pay-agreement/<int:agreement_id>/",
        ProviderPayAgreementView.as_view()
    ),
    path(
        "seeker/submit-work/<int:application_id>/",
        SeekerSubmitWorkView.as_view()
    ),
    path(
        "provider/approve-work/<int:agreement_id>/",
        ProviderApproveWorkView.as_view()
    ),
    path(
        "seeker/completed-works/",
        UserCompletedWorksView.as_view()
    ),
]