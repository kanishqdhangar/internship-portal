from django.contrib import admin
from .models import CustomUser

# Register your models here.
admin.site.register(CustomUser)

class DataAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'email', 'username', 'password')
    search_fields = ('username', 'email')