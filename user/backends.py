from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.hashers import check_password
from .models import Kullanici

class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = Kullanici.objects.get(email=email)
        except Kullanici.DoesNotExist:
            return None

        if check_password(password, user.password):
            return user
        return None
