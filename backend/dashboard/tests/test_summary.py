import pytest
from datetime import date
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from categories.models import Category
from transactions.models import Transaction

User = get_user_model()


@pytest.fixture
def user():
    return User.objects.create_user(username="testuser", password="SenhaForte123!")


@pytest.fixture
def category_expense(user):
    return Category.objects.create(name="Alimentação", type="expense", user=user)


@pytest.fixture
def category_income(user):
    return Category.objects.create(name="Salário", type="income", user=user)


def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
class TestDashboardSummary:
    def test_summary_with_known_values(self, user, category_expense, category_income):
        Transaction.objects.create(
            description="Salário",
            amount=5000,
            type="income",
            date=date(2026, 7, 5),
            category=category_income,
            user=user,
        )
        Transaction.objects.create(
            description="Mercado",
            amount=300,
            type="expense",
            date=date(2026, 7, 10),
            category=category_expense,
            user=user,
        )
        Transaction.objects.create(
            description="Restaurante",
            amount=150,
            type="expense",
            date=date(2026, 7, 15),
            category=category_expense,
            user=user,
        )

        client = authenticated_client(user)
        response = client.get("/api/dashboard/summary/?month=2026-07")

        assert response.status_code == status.HTTP_200_OK
        assert float(response.data["total_income"]) == 5000
        assert float(response.data["total_expense"]) == 450
        assert float(response.data["balance"]) == 4550

    def test_summary_groups_by_category_correctly(self, user, category_expense):
        Transaction.objects.create(
            description="Mercado",
            amount=300,
            type="expense",
            date=date(2026, 7, 10),
            category=category_expense,
            user=user,
        )
        Transaction.objects.create(
            description="Restaurante",
            amount=150,
            type="expense",
            date=date(2026, 7, 15),
            category=category_expense,
            user=user,
        )

        client = authenticated_client(user)
        response = client.get("/api/dashboard/summary/?month=2026-07")

        assert len(response.data["by_category"]) == 1
        assert float(response.data["by_category"][0]["total"]) == 450

    def test_summary_ignores_transactions_from_other_months(
        self, user, category_expense
    ):
        Transaction.objects.create(
            description="Compra em junho",
            amount=999,
            type="expense",
            date=date(2026, 6, 15),
            category=category_expense,
            user=user,
        )

        client = authenticated_client(user)
        response = client.get("/api/dashboard/summary/?month=2026-07")

        assert float(response.data["total_expense"]) == 0

    def test_summary_defaults_to_current_month_when_not_specified(self, user):
        client = authenticated_client(user)
        response = client.get("/api/dashboard/summary/")

        assert response.status_code == status.HTTP_200_OK

    def test_summary_rejects_invalid_month_format(self, user):
        client = authenticated_client(user)
        response = client.get("/api/dashboard/summary/?month=invalido")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_monthly_evolution_has_six_months(self, user):
        client = authenticated_client(user)
        response = client.get("/api/dashboard/summary/?month=2026-07")

        assert len(response.data["monthly_evolution"]) == 6
