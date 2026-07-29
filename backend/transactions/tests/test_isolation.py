import pytest
from datetime import date
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from categories.models import Category
from transactions.models import Transaction

User = get_user_model()


@pytest.fixture
def user_a():
    return User.objects.create_user(username='user_a', password='SenhaForte123!')


@pytest.fixture
def user_b():
    return User.objects.create_user(username='user_b', password='SenhaForte123!')


@pytest.fixture
def category_a(user_a):
    return Category.objects.create(name='Alimentação', type='expense', user=user_a)


@pytest.fixture
def transaction_a(user_a, category_a):
    return Transaction.objects.create(
        description='Almoço',
        amount=45.90,
        type='expense',
        date=date(2026, 7, 29),
        category=category_a,
        user=user_a,
    )


def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
class TestTransactionIsolation:
    def test_user_cannot_list_other_users_transactions(self, user_a, user_b, transaction_a):
        client_b = authenticated_client(user_b)
        response = client_b.get('/api/transactions/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0

    def test_user_cannot_retrieve_other_users_transaction(self, user_b, transaction_a):
        client_b = authenticated_client(user_b)
        response = client_b.get(f'/api/transactions/{transaction_a.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_cannot_delete_other_users_transaction(self, user_b, transaction_a):
        client_b = authenticated_client(user_b)
        response = client_b.delete(f'/api/transactions/{transaction_a.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Transaction.objects.filter(id=transaction_a.id).exists()

    def test_user_cannot_create_transaction_with_other_users_category(self, user_b, category_a):
        client_b = authenticated_client(user_b)
        response = client_b.post('/api/transactions/', {
            'description': 'Tentativa maliciosa',
            'amount': '10.00',
            'type': 'expense',
            'date': '2026-07-29',
            'category': category_a.id,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_can_access_own_transaction(self, user_a, transaction_a):
        client_a = authenticated_client(user_a)
        response = client_a.get(f'/api/transactions/{transaction_a.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['description'] == 'Almoço'


@pytest.mark.django_db
class TestCategoryIsolation:
    def test_user_cannot_list_other_users_categories(self, user_b, category_a):
        client_b = authenticated_client(user_b)
        response = client_b.get('/api/categories/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0

    def test_user_cannot_retrieve_other_users_category(self, user_b, category_a):
        client_b = authenticated_client(user_b)
        response = client_b.get(f'/api/categories/{category_a.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND