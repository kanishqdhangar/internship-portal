from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    SendEmailView,
    VerifyOTPView,
    UserListView,
    UserManageView,
    CookieTokenRefreshView
)

urlpatterns = [
    # Authentication
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/verify-otp/", VerifyOTPView.as_view(), name="auth-verify-otp"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    # User profile (self only)
    path("auth/me/", MeView.as_view(), name="auth-me"),
    #Admin user list
    path("auth/admin/users/", UserListView.as_view(), name="admin-user-list"),
    path("auth/admin/users/<int:pk>/", UserManageView.as_view(), name="admin-user-manage"),
    # Utility
    path("utils/send-email/", SendEmailView.as_view(), name="send-email"),
]