# students/models.py
from django.db import models
from cloudinary.models import CloudinaryField

class Student(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    adddress = models.CharField(max_length=200)
    email = models.EmailField(unique=False)
    phone_number = models.CharField(max_length=15)
    college_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20)
    course = models.CharField(max_length=100)
    year_of_study = models.IntegerField()
    resume = CloudinaryField(resource_type="raw", folder="resumes")
    id_card = CloudinaryField(resource_type="raw", folder="id_card")
    i_id = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default="Applied")
    user_id= models.CharField(max_length=50)
    skills = models.CharField(max_length=400)
    addskills = models.CharField(max_length=400)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
