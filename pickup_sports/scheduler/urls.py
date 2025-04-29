from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.profile_detail, name='profile_detail'),
    path('profile/update/', views.profile_update, name='profile_update'),
    path('profile/<int:id>/', views.public_profile, name='public_profile'),
    path('games/', views.game_list, name='game_list'),
    path('games/create/', views.game_create, name='game_create'),
    path('games/<int:pk>/', views.game_detail, name='game_detail'),
    path('games/<int:pk>/cancel/', views.cancel_game, name='cancel_game'),
    path('games/<int:pk>/update/', views.game_update, name='game_update'),
    path('games/<int:pk>/delete/', views.game_delete, name='game_delete'),
    path('games/<int:pk>/join/', views.join_game, name='join_game'),
    path('sports/', views.sport_list, name='sport_list'),
    path('my-archived-games/', views.my_archived_games, name='my_archived_games'),
    path('games/<int:pk>/leave/', views.leave_game, name='leave-game'),
    path(
      'games/<int:game_pk>/comments/', views.game_comments,name='game-comments'
    ),
]
