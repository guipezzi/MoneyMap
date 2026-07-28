from django.conf import settings
from django.db import models

from categories.models import Category


class Transaction(models.Model):
    class Type(models.TextChoices):
        INCOME = 'income', 'Receita'
        EXPENSE = 'expense', 'Despesa'

    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=Type.choices)
    date = models.DateField()
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='transactions',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'type']),
        ]

    def __str__(self):
        return f'{self.description} - R$ {self.amount}'