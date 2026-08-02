import random
from datetime import date
from decimal import Decimal

from dateutil.relativedelta import relativedelta
from decouple import config
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from categories.models import Category
from transactions.models import Transaction


class Command(BaseCommand):
    help = "Cria o usuário visitante (demo) com dados de exemplo, se ainda não existir. Idempotente."

    def handle(self, *args, **options):
        User = get_user_model()
        username = config("DJANGO_DEMO_USERNAME", default=None)
        password = config("DJANGO_DEMO_PASSWORD", default=None)

        if not all([username, password]):
            self.stdout.write("Variáveis do usuário demo não definidas, pulando.")
            return

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": f"{username}@demo.moneymap.local"},
        )

        if not created:
            self.stdout.write(f"Usuário demo '{username}' já existe, pulando.")
            return

        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Usuário demo '{username}' criado."))

        self._seed_data(user)
        self.stdout.write(self.style.SUCCESS("Dados de exemplo criados para o usuário demo."))

    def _seed_data(self, user):
        expense_defs = [
            ("Alimentação", "#F97316"),
            ("Transporte", "#3B82F6"),
            ("Moradia", "#8B5CF6"),
            ("Lazer", "#EC4899"),
            ("Saúde", "#10B981"),
        ]
        income_defs = [
            ("Salário", "#22C55E"),
            ("Freelance", "#06B6D4"),
        ]

        expense_categories = [
            Category.objects.create(user=user, name=name, type="expense", color=color)
            for name, color in expense_defs
        ]
        income_categories = [
            Category.objects.create(user=user, name=name, type="income", color=color)
            for name, color in income_defs
        ]

        expense_descriptions = [
            "Supermercado", "Restaurante", "Uber", "Combustível", "Aluguel",
            "Cinema", "Academia", "Farmácia", "Streaming", "Conta de luz",
        ]

        today = date.today()

        for months_ago in range(5, -1, -1):  # últimos 6 meses, do mais antigo ao mais recente
            month_date = today - relativedelta(months=months_ago)

            # Receita fixa do mês
            Transaction.objects.create(
                user=user,
                description="Salário mensal",
                amount=Decimal("4500.00"),
                type="income",
                category=income_categories[0],
                date=month_date.replace(day=5),
            )

            # Receita extra, só em alguns meses (aleatório)
            if random.random() > 0.5:
                Transaction.objects.create(
                    user=user,
                    description="Projeto freelance",
                    amount=Decimal(random.randint(300, 1200)),
                    type="income",
                    category=income_categories[1],
                    date=month_date.replace(day=random.randint(10, 20)),
                )

            # Entre 6 e 10 despesas espalhadas pelo mês
            for _ in range(random.randint(6, 10)):
                category = random.choice(expense_categories)
                day = random.randint(1, 28)
                Transaction.objects.create(
                    user=user,
                    description=random.choice(expense_descriptions),
                    amount=Decimal(random.randint(20, 600)),
                    type="expense",
                    category=category,
                    date=month_date.replace(day=day),
                )