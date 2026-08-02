from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from decouple import config

class Command(BaseCommand):
    help = "Cria o superusuário padrão se ele ainda não existir (idempotente)."

    def handle(self, *args, **options):
        User = get_user_model()
        username = config("DJANGO_SUPERUSER_USERNAME", default=None)
        email = config("DJANGO_SUPERUSER_EMAIL", default=None)
        password = config("DJANGO_SUPERUSER_PASSWORD", default=None)

        if not all([username, email, password]):
            self.stdout.write("Variáveis de superusuário não definidas, pulando.")
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f"Superusuário '{username}' já existe, nada a fazer.")
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Superusuário '{username}' criado."))