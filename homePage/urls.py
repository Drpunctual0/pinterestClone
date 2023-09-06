from django.urls import path
from . import views
from homePage.views import *

urlpatterns = [
    path('', index, name='index'),
]