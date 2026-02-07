# students/serializers.py
from rest_framework import serializers
from .models import Student
from django.conf import settings

class StudentSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField(read_only=True)
    id_card_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = "__all__"
        read_only_fields = ("resume_url", "id_card_url")

    def get_resume_url(self, obj):
        if not obj.resume:
            return None
        return obj.resume.url   

    def get_id_card_url(self, obj):
        if not obj.id_card:
            return None
        return obj.id_card.url  

class StudentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['status']
