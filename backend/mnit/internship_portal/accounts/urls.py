from django.urls import path
from .views import RegisterView, LoginView, UserListView, SendEmailView, VerifyOTPView


urlpatterns = [
    path('signup/', RegisterView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserListView.as_view(), name='user-detail'),
    path('send-email/', SendEmailView.as_view(), name='send_email'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    # path('signup/', views.postData),
]
