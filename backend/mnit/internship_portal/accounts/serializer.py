import random
from django.utils import timezone
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

CustomUser = get_user_model()

# =========================================================
# Registration Serializer
# =========================================================

class DataSerializer(serializers.ModelSerializer):
    """
    Handles user registration and OTP generation.
    """

    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "email",
            "username",
            "password",
        )
        extra_kwargs = {
            "password": {"write_only": True},
        }

    # ✅ Prevent duplicate emails
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        otp = random.randint(100000, 999999)

        user = CustomUser.objects.create_user(
            first_name=validated_data["first_name"],
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            otp_verification=otp,
        )

        # Make inactive until verified
        user.is_active = False

        # Set OTP expiry (10 minutes)
        user.otp_expires_at = timezone.now() + timezone.timedelta(minutes=10)

        user.save()
        return user


# =========================================================
# OTP Verification Serializer
# =========================================================

class OTPVerificationSerializer(serializers.Serializer):
    """
    Validates OTP safely.
    Database state changes should be done in the view.
    """
    email = serializers.EmailField()
    otp = serializers.CharField()

    def validate(self, data):
        email = data["email"]
        otp = data["otp"]

        if not otp.isdigit():
            raise serializers.ValidationError("OTP must be numeric")

        # ✅ Use filter().first() to prevent MultipleObjectsReturned crash
        user = CustomUser.objects.filter(email=email).first()

        if not user:
            raise serializers.ValidationError("Invalid OTP")

        if user.otp_verification != int(otp):
            raise serializers.ValidationError("Invalid OTP")

        if user.otp_expires_at and timezone.now() > user.otp_expires_at:
            raise serializers.ValidationError("OTP expired")

        data["user"] = user
        return data


# =========================================================
# Login Serializer
# =========================================================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get("username"),
            password=data.get("password"),
        )

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_active:
            raise serializers.ValidationError("Account not verified")

        data["user"] = user
        return data


# =========================================================
# User Profile Serializer
# =========================================================

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = ["is_staff", "is_superuser", "is_active"]


# =========================================================
# Admin Update Serializer
# =========================================================

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["is_active", "is_staff"]