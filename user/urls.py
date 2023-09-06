app_name = 'user'
from django.urls import path, include
from . import views
from user.views import *


urlpatterns = [
    path('userLogin/', userLogin, name='userLogin'),
    path('userLogout/', userLogout, name='userLogout'),
    path('register/', register, name='register'),
    path('profile/', my_profile, name='my_profile'),
    path('profile/<int:user_id>/', profile_view, name='profile_view'),
    path('profile/edit/', profile_edit, name='profile_edit'),
    path('follow/<int:user_id>/', follow_user, name='follow_user'),
    path('unfollow/<int:user_id>/', unfollow_user, name='unfollow_user'),


]
