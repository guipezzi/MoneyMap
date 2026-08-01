from datetime import date
from dateutil.relativedelta import relativedelta
from django.db.models import Sum, Q
from transactions.models import Transaction


def get_month_range(month_str):
    """Recebe 'YYYY-MM' e retorna (primeiro_dia, ultimo_dia) do mês."""
    year, month = map(int, month_str.split("-"))
    start = date(year, month, 1)
    end = start + relativedelta(months=1) - relativedelta(days=1)
    return start, end


def get_summary(user, month_str):
    start, end = get_month_range(month_str)
    qs = Transaction.objects.filter(user=user, date__gte=start, date__lte=end)

    totals = qs.aggregate(
        total_income=Sum("amount", filter=Q(type="income")),
        total_expense=Sum("amount", filter=Q(type="expense")),
    )
    total_income = totals["total_income"] or 0
    total_expense = totals["total_expense"] or 0

    by_category = list(
        qs.filter(type="expense")
        .values("category_id", "category__name", "category__color")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    by_category = [
        {
            "category_id": item["category_id"],
            "category_name": item["category__name"],
            "category_color": item["category__color"],
            "total": item["total"],
        }
        for item in by_category
    ]

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "by_category": by_category,
    }


def get_monthly_evolution(user, months_count=6):
    """Retorna a evolução dos últimos N meses (incluindo o atual)."""
    today = date.today()
    evolution = []

    for i in range(months_count - 1, -1, -1):
        month_date = today - relativedelta(months=i)
        month_str = month_date.strftime("%Y-%m")
        start, end = get_month_range(month_str)

        totals = Transaction.objects.filter(
            user=user, date__gte=start, date__lte=end
        ).aggregate(
            income=Sum("amount", filter=Q(type="income")),
            expense=Sum("amount", filter=Q(type="expense")),
        )

        evolution.append(
            {
                "month": month_str,
                "income": totals["income"] or 0,
                "expense": totals["expense"] or 0,
            }
        )

    return evolution


def get_transactions_for_export(user, month_str):
    """
    Retorna as transações do período (mesmo intervalo usado em get_summary),
    já com a categoria pré-carregada via select_related (evita N+1 query
    ao montar o relatório em PDF, que precisa de nome/cor de cada categoria).
    Ordenado por data (mais antiga primeiro), igual ao formato de extrato.
    """
    start, end = get_month_range(month_str)
    return (
        Transaction.objects.filter(user=user, date__gte=start, date__lte=end)
        .select_related("category")
        .order_by("date")
    )