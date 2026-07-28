import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestRegister:
    def test_register_success(self):
        client = APIClient()
        response = client.post(
            "/api/auth/register/",
            {
                "username": "testuser",
                "email": "test@example.com",
                "password": "SenhaForte123!",
                "password_confirm": "SenhaForte123!",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username="testuser").exists()

    def test_register_password_mismatch(self):
        client = APIClient()
        response = client.post(
            "/api/auth/register/",
            {
                "username": "testuser",
                "email": "test@example.com",
                "password": "SenhaForte123!",
                "password_confirm": "SenhaDiferente!",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(username="testuser").exists()


@pytest.mark.django_db
class TestLogin:
    def setup_method(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="SenhaForte123!",
        )

    def test_login_success(self):
        client = APIClient()
        response = client.post(
            "/api/auth/login/",
            {
                "username": "testuser",
                "password": "SenhaForte123!",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password(self):
        client = APIClient()
        response = client.post(
            "/api/auth/login/",
            {
                "username": "testuser",
                "password": "senhaerrada",
            },
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
