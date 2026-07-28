from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'type', 'category', 'user', 'date')
    list_filter = ('type', 'category')
    search_fields = ('description',)
    date_hierarchy = 'date'