"""Cedar Hearth — accounts admin"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Cedar Hearth Info', {'fields': ('role', 'phone', 'avatar')}),
    )
    list_display = ['username', 'email', 'role', 'is_active']
    list_filter = ['role', 'is_active']
