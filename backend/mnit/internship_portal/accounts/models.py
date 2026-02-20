from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class CustomUser(AbstractUser):
    """
    Custom user model with OTP-based email verification.
    """
    email = models.EmailField(unique=True)

    otp_verification = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="6-digit OTP for email verification",
    )

    otp_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="OTP expiration time",
    )

    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the user's email is verified",
    )

    def otp_is_valid(self, otp: int) -> bool:
        """
        Check if OTP matches and is not expired.
        """
        if not self.otp_verification or not self.otp_expires_at:
            return False

        if timezone.now() > self.otp_expires_at:
            return False

        return self.otp_verification == otp

    def clear_otp(self):
        """
        Clear OTP after successful verification.
        """
        self.otp_verification = None
        self.otp_expires_at = None
        self.save(update_fields=["otp_verification", "otp_expires_at"])

    def __str__(self):
        return self.username
