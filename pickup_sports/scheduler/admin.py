from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Sport, Game, Participant

# Register your CustomUser model with the Django admin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Optionally customize the admin fields, list display, etc.
    pass

# Register other models
admin.site.register(Sport)
admin.site.register(Game)
admin.site.register(Participant)
