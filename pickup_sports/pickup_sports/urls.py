"""
URL configuration for pickup_sports project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/games/', views.game_list, name='game_list'),
    path('api/games/create/', views.game_create, name='game_create'),
    path('api/games/<int:pk>/', views.game_detail, name='game_detail'),
    path('api/games/<int:pk>/update/', views.game_update, name='game_update'),
    path('api/games/<int:pk>/delete/', views.game_delete, name='game_delete'),
]
