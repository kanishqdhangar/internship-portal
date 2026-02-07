from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Internship
from .serializer import InternshipSerializer

class InternshipViewSet(viewsets.ModelViewSet):
    queryset = Internship.objects.all()
    serializer_class = InternshipSerializer

    def update(self, request, pk=None):
        try:
            internship = self.get_object()
            serializer = self.get_serializer(internship, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Internship.DoesNotExist:
            return Response({'message': 'Internship not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            internship = self.get_object()
            serializer = self.get_serializer(internship)
            return Response(serializer.data)
        except Internship.DoesNotExist:
            return Response({'message': 'Internship not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
