from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
    verbose_name = "Accounts & Authentication"

    def ready(self):
        """
        Hook for app initialization.
        Useful for signals (e.g. post_save user hooks).
        """
        pass
