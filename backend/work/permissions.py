from rest_framework.permissions import BasePermission

class IsOwnerUser(BasePermission):
    """
    Permission to allow only the owner (logged-in user) to access/edit their own work posts
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
