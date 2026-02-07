from rest_framework import serializers
from .models import Internship

class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = '__all__'

    def update(self, instance, validated_data):
        # Override the default update method to customize how updates are handled
        instance.Title = validated_data.get('Title', instance.Title)
        instance.Mentor = validated_data.get('Mentor', instance.Mentor)
        instance.Duration = validated_data.get('Duration', instance.Duration)
        instance.Status = validated_data.get('Status', instance.Status)
        instance.Skills = validated_data.get('Skills', instance.Skills)
        instance.save()
        return instance
