from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework import exceptions


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class to read JWT from HttpOnly cookie.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get("access")

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except InvalidToken:
            raise exceptions.AuthenticationFailed("Invalid token")
