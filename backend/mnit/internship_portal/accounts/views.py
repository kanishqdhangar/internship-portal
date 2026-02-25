import os
import requests
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser
from .serializer import (
    DataSerializer,
    LoginSerializer,
    CustomUserSerializer,
    OTPVerificationSerializer,
    AdminUserUpdateSerializer
)

from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
# =========================================================
# Helpers
# =========================================================

def verify_recaptcha(token):
    """Verify Google reCAPTCHA token"""
    if not token:
        return False

    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": settings.RECAPTCHA_SECRET_KEY,
                "response": token,
            },
            timeout=5,
        )
        return response.json().get("success", False)
    except requests.RequestException:
        return False


def send_email_via_gas(to_email, subject, message):
    """Send email via Google Apps Script"""
    gas_url = os.getenv("GAS_EMAIL_URL")
    gas_secret = os.getenv("GAS_SECRET")

    if not gas_url or not gas_secret:
        raise ValueError("Email service not configured")

    payload = {
        "email": to_email,
        "subject": subject,
        "message": message,
        "secret": gas_secret,
    }

    response = requests.post(gas_url, json=payload, timeout=10)
    response.raise_for_status()
    return response.json()


# =========================================================
# OTP Verification
# =========================================================

class VerifyOTPView(APIView):
    """
    Verifies OTP linked to a user.
    OTP should be time-bound and cleared after success.
    """

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp = int(serializer.validated_data["otp"])

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=400)

        if user.otp_verification != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if user.otp_expires_at and timezone.now() > user.otp_expires_at:
            return Response({"error": "OTP expired"}, status=400)

        user.is_verified = True
        user.is_active = True
        user.otp_verification = None
        user.otp_expires_at = None
        user.save(update_fields=["is_verified", "is_active", "otp_verification", "otp_expires_at"])

        return Response({"message": "OTP verified successfully"}, status=200)


# =========================================================
# Send Email (utility endpoint)
# =========================================================

class SendEmailView(APIView):
    def post(self, request):
        email = request.data.get("email")
        subject = request.data.get("subject")
        message = request.data.get("message")

        if not all([email, subject, message]):
            return Response(
                {"error": "Missing email, subject, or message"},
                status=400,
            )

        try:
            send_email_via_gas(email, subject, message)
            return Response({"message": "Email sent successfully"}, status=200)
        except Exception:
            return Response(
                {"error": "Failed to send email"},
                status=500,
            )


# =========================================================
# Me Profile (secure)
# =========================================================

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)


# =========================================================
# Registration
# =========================================================

class RegisterView(generics.CreateAPIView):
    """
    User registration with reCAPTCHA and email OTP.
    """
    queryset = CustomUser.objects.all()
    serializer_class = DataSerializer

    def create(self, request, *args, **kwargs):
        if not verify_recaptcha(request.data.get("recaptchaToken")):
            return Response({"error": "Invalid reCAPTCHA"}, status=400)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            send_email_via_gas(
                user.email,
                "Verify your account",
                f"Your OTP is: {user.otp_verification}. It expires in 10 minutes.",
            )
        except Exception as e:
            print("Email sending failed:", e)

        return Response(
            {"message": "User registered. OTP sent to email."},
            status=201
        )


# =========================================================
# Login
# =========================================================

class LoginView(generics.GenericAPIView):
    """
    Secure login with reCAPTCHA, JWT, and rate limiting.
    """
    serializer_class = LoginSerializer
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        if not verify_recaptcha(request.data.get("recaptchaToken")):
            return Response({"error": "Invalid reCAPTCHA"}, status=400)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        refresh = RefreshToken.for_user(user)

        user_status = (
            "superuser" if user.is_superuser
            else "staff" if user.is_staff
            else "user"
        )

        response = Response(
            {
                "user_id": user.id,
                "username": user.username,
                "status": user_status,
            },
            status=200,
        )

        # ✅ Recommended: HttpOnly cookies
        response.set_cookie(
            "access",
            str(refresh.access_token),
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
            max_age=60 * 15,
        )
        response.set_cookie(
            "refresh",
            str(refresh),
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
            max_age=60 * 60 * 24 * 7,
        )

        return response

# =========================================================
# Logout
# =========================================================

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=200)

        response.delete_cookie("access")
        response.delete_cookie("refresh")

        return response

# =========================================================
# Admin - List All Users
# =========================================================

class UserListView(ListAPIView):
    """
    Superuser/Staff can view all users.
    """
    queryset = CustomUser.objects.all().order_by("-date_joined")
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminUser]


# =========================================================
# Admin - Update User (activate / block)
# =========================================================

class UserManageView(RetrieveUpdateAPIView):
    """
    Superuser/Staff can activate or deactivate users.
    """
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserUpdateSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "pk"
    def patch(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
# =========================================================
# Refreshing access token
# =========================================================

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh")

        if not refresh_token:
            return Response({"detail": "No refresh token"}, status=401)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]

        response = Response({"message": "Token refreshed"})
        response.set_cookie(
            "access",
            access_token,
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
            max_age=60 * 15,
        )

        return response
