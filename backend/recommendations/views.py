from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import recommend_jobs_for_user

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_jobs_view(request):
    """
    API endpoint that returns a list of recommended jobs for the authenticated seeker.
    """
    user_id = request.user.id
    
    # Check if the user is a seeker
    if request.user.user_type != 'seeker':
        return Response({"detail": "Only job seekers can receive recommendations."}, status=403)
        
    recommendations = recommend_jobs_for_user(user_id, request)
    
    return Response({
        "count": len(recommendations),
        "results": recommendations
    })
