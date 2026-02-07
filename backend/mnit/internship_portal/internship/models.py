from django.db import models

# Create your models here.
class Internship(models.Model):
    user_id = models.CharField(max_length = 500)
    username = models.CharField(max_length = 400)
    Title = models.CharField(max_length = 100)
    Mentor = models.CharField(max_length = 50)
    Duration = models.CharField(max_length = 20)
    Stipend = models.CharField(max_length = 50)
    Description = models.CharField(max_length = 50)
    Status = models.CharField(max_length = 20)
    Skills = models.CharField(max_length=500)
    

    def __str__(self):
        return f"{self.Title} - {self.Mentor}"
