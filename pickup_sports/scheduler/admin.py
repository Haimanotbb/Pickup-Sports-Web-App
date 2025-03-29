from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Sport, Game, Participant

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    pass

# Register other models
admin.site.register(Sport)
admin.site.register(Game)
admin.site.register(Participant)
