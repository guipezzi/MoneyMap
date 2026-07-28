from django.conf import settings
from django.db import models


class Category(models.Model):
    class Type(models.TextChoices):
        INCOME = "income", "Receita"
        EXPENSE = "expense", "Despesa"

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=Type.choices)
    color = models.CharField(max_length=7, default="#6366F1")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name", "type"],
                name="unique_category_per_user",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
