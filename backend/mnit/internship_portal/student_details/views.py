from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Student
from .serializer import StudentSerializer, StudentStatusSerializer
from accounts.views import send_email_via_gas

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = serializer.save()

        # ✅ Send email via Google Apps Script
        try:
            send_email_via_gas(
                to_email=student.email,
                subject="Internship Application Submitted Successfully",
                message=f"""
Hi {student.first_name},

Your internship application has been successfully submitted.

Application Details:
Name: {student.first_name} {student.last_name}
College: {student.college_name}
Course: {student.course}
Year: {student.year_of_study}

We will review your profile and get back to you soon.

Best regards,
Internship Team
"""
            )
        except Exception as e:
            # Do NOT fail application if email fails
            print("Email sending failed:", str(e))

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['put'])
    def update_status(self, request, pk=None):
        student = self.get_object()
        serializer = StudentStatusSerializer(student, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            try:
                send_email_via_gas(
                    to_email=student.email,
                    subject="Application Status Updated",
                    message=f"""
    Hi {student.first_name},

    Your application status has been updated to: {student.status}

    Please check your dashboard for more details.

    Best regards,
    Internship Team
    """
                )
            except Exception as e:
                print("Status email failed:", str(e))

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
