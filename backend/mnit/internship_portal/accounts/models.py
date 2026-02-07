from django.db import models
from django.contrib.auth.models import AbstractUser 

# # Create your models here.
# class Data(models.Model):
#     FirstName = models.CharField(max_length = 20)
#     LastName = models.CharField(max_length = 20)
#     College = models.CharField(max_length = 50)
#     Course = models.CharField(max_length = 50)
#     Department = models.CharField(max_length = 20)
#     Phone = models.CharField(max_length = 10)
#     RollNo = models.CharField(max_length = 20)
#     Adress = models.CharField(max_length = 200)
#     Email = models.EmailField(max_length = 20)
#     UserName = models.CharField(max_length = 20)
#     Password = models.CharField(('password'), max_length=128)

class CustomUser(AbstractUser):

    # phone_number = models.CharField(max_length=15, blank=True, null=True)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',  # Example related_name for groups
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',  # Example related_name for user_permissions
        blank=True,
    )
    otp_verification = models.IntegerField(max_length=999999, null=True)

    def __str__(self):
        return self.username
    
