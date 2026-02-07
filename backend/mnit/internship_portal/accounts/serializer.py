import random
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser

CustomUser = get_user_model()

class DataSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ('first_name', 'email', 'username', 'password', 'otp_verification')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):

        user = CustomUser.objects.create_user(
            first_name=validated_data['first_name'],
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            otp_verification = random.randint(100000,999999)
            # phone_number=validated_data.get('phone_number', '')
        )
        user.is_active = False
        user.save()
        return user
    
from rest_framework import serializers
from .models import CustomUser  # Import your CustomUser model

class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_verification = serializers.CharField()  # Accept OTP as a string

    def validate(self, data):
        email = data.get('email')
        otp_verification = data.get('otp_verification')

        try:
            # Attempt to convert otp_verification to an integer
            otp_verification = int(otp_verification)
        except ValueError:
            raise serializers.ValidationError("OTP must be a numeric value.")

        try:
            # Retrieve the user by email
            user = CustomUser.objects.get(email=email)

            # Check if the OTP matches
            if user.otp_verification != otp_verification:
                raise serializers.ValidationError("The provided OTP is incorrect.")

            # If needed, update the user's status (e.g., mark as verified)
            user.is_active = True
            user.save()

        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

        return data

    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'is_active', 'is_staff', 'is_superuser']
