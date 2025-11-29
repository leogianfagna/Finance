from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    Endpoint para registrar um novo usuário.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """
    Retorna os dados do usuário autenticado.
    """
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
