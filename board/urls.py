app_name = 'board'

from django.urls import path
from . import views
from board.views import *

urlpatterns = [
    path('', board, name='board'),
    path('drag/', drag, name='drag'),
    path('create_board/', create_board, name='create_board'),
    path('upload_media/', upload_media, name='upload_media'),
    path('save/', save_pin, name='save_pin'),
    path('create_pin/', create_pin, name='create_pin'),
    path('add_reaction/<str:model_name>/<int:pin_id>/', add_reaction, name='add_reaction'),
    path('pin/<int:pin_id>/', pin_detail, name='pin_detail'),
    path('save_pin_to_board/', save_pin_to_board, name='save_pin_to_board'),
    path('pin_detail/<str:model_name>/<int:pin_id>/', pin_detail, name='pin_detail'),
    path('create_idea_pin/', create_idea_pin, name='create_idea_pin'),
    path('delete_pin/<int:pin_id>/', delete_pin, name='delete_pin'),
    path('add_comment/<str:model_name>/<int:pk>/', add_comment, name='add_comment'),
    path('delete_comment/<int:pk>/', delete_comment, name='delete_comment'),
    path('delete_board/<int:board_id>/', delete_board, name='delete_board'),
    path('feed/', home_feed, name='home_feed'),

]