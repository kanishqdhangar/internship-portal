from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for CustomUser.
    """

    model = CustomUser

    # Safe & useful columns
    list_display = (
        "username",
        "email",
        "first_name",
        "is_active",
        "is_verified",
        "is_staff",
        "is_superuser",
    )

    # Filters in right sidebar
    list_filter = (
        "is_active",
        "is_verified",
        "is_staff",
        "is_superuser",
    )

    # Search bar
    search_fields = ("username", "email", "first_name")

    # Default ordering
    ordering = ("username",)

    # Field layout in edit page
    fieldsets = UserAdmin.fieldsets + (
        (
            "Verification",
            {
                "fields": (
                    "is_verified",
                    "otp_verification",
                    "otp_expires_at",
                )
            },
        ),
    )

    # Prevent accidental OTP edits
    readonly_fields = (
        "otp_verification",
        "otp_expires_at",
    )
