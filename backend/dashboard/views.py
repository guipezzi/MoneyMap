from datetime import date
from io import BytesIO

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)

from .services import get_summary, get_monthly_evolution, get_transactions_for_export


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


def _format_currency(value):
    """Formata Decimal/float/int como 'R$ 1.234,56' (padrão BR)."""
    formatted = f"{float(value):,.2f}"
    # troca separadores: 1,234.56 -> 1.234,56
    formatted = formatted.replace(",", "#").replace(".", ",").replace("#", ".")
    return f"R$ {formatted}"


TRANSACTION_TYPE_LABELS = {"income": "Receita", "expense": "Despesa"}


class DashboardExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month_str = request.query_params.get("month")
        if not month_str:
            month_str = date.today().strftime("%Y-%m")

        try:
            summary = get_summary(request.user, month_str)
            transactions = get_transactions_for_export(request.user, month_str)
        except ValueError:
            return Response(
                {"detail": "Formato de mês inválido. Use YYYY-MM."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pdf_buffer = self._build_pdf(request.user, month_str, summary, transactions)

        response = HttpResponse(pdf_buffer.getvalue(), content_type="application/pdf")
        filename = f"relatorio-moneymap-{month_str}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    def _build_pdf(self, user, month_str, summary, transactions):
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Title"],
            alignment=TA_CENTER,
            fontSize=18,
        )
        subtitle_style = ParagraphStyle(
            "ReportSubtitle",
            parent=styles["Normal"],
            alignment=TA_CENTER,
            fontSize=11,
            textColor=colors.grey,
        )
        section_style = ParagraphStyle(
            "SectionTitle",
            parent=styles["Heading2"],
            spaceBefore=16,
            spaceAfter=8,
        )

        elements = []

        elements.append(Paragraph("Relatório Financeiro", title_style))
        elements.append(
            Paragraph(
                f"{user.username} &nbsp;|&nbsp; Período: {month_str}",
                subtitle_style,
            )
        )
        elements.append(Spacer(1, 0.8 * cm))

        # --- Resumo do mês ---
        elements.append(Paragraph("Resumo do mês", section_style))
        summary_data = [
            ["Receitas", _format_currency(summary["total_income"])],
            ["Despesas", _format_currency(summary["total_expense"])],
            ["Saldo", _format_currency(summary["balance"])],
        ]
        summary_table = Table(summary_data, colWidths=[8 * cm, 8 * cm])
        summary_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.lightgrey),
                    ("LINEABOVE", (0, 2), (-1, 2), 1, colors.black),
                ]
            )
        )
        elements.append(summary_table)

        # --- Despesas por categoria ---
        if summary["by_category"]:
            elements.append(Paragraph("Despesas por categoria", section_style))
            category_data = [["Categoria", "Total"]]
            for item in summary["by_category"]:
                category_data.append(
                    [item["category_name"], _format_currency(item["total"])]
                )
            category_table = Table(category_data, colWidths=[8 * cm, 8 * cm])
            category_table.setStyle(
                TableStyle(
                    [
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ]
                )
            )
            elements.append(category_table)

        # --- Extrato de transações ---
        elements.append(Paragraph("Transações do período", section_style))
        transactions_data = [["Data", "Descrição", "Categoria", "Tipo", "Valor"]]
        for t in transactions:
            transactions_data.append(
                [
                    t.date.strftime("%d/%m/%Y"),
                    t.description,
                    t.category.name,
                    TRANSACTION_TYPE_LABELS.get(t.type, t.type),
                    _format_currency(t.amount),
                ]
            )

        if len(transactions_data) == 1:
            elements.append(Paragraph("Nenhuma transação neste período.", styles["Normal"]))
        else:
            transactions_table = Table(
                transactions_data,
                colWidths=[2.3 * cm, 5.7 * cm, 3.5 * cm, 2.5 * cm, 2.5 * cm],
                repeatRows=1,
            )
            transactions_table.setStyle(
                TableStyle(
                    [
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                        ("ALIGN", (4, 0), (4, -1), "RIGHT"),
                    ]
                )
            )
            elements.append(transactions_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer