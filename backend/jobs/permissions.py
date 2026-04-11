from rest_framework.permissions import BasePermission

class IsCompanyUser(BasePermission):
    """
    Allows access only to users with user_type='company'
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            getattr(request.user, 'user_type', '').lower() == 'company'
        )
