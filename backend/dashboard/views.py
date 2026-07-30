from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .services import get_summary, get_monthly_evolution


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month_str = request.query_params.get("month")
        if not month_str:
            month_str = date.today().strftime("%Y-%m")

        try:
            summary = get_summary(request.user, month_str)
        except ValueError:
            return Response(
                {"detail": "Formato de mês inválido. Use YYYY-MM."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        monthly_evolution = get_monthly_evolution(request.user)

        return Response(
            {
                **summary,
                "monthly_evolution": monthly_evolution,
            }
        )
