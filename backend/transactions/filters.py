import django_filters
from .models import Transaction


class TransactionFilter(django_filters.FilterSet):
    date_after = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Transaction
        fields = {
            'category': ['exact'],
            'type': ['exact'],
        }