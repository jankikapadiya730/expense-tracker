from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import permissions
from groups.models import Group
from expenses.models import Expense
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import openpyxl
from io import BytesIO

class ExportPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)
        expenses = Expense.objects.filter(group=group, is_deleted=False).order_by('-date')
        
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, 750, f"SplitSphere Report: {group.name}")
        p.setFont("Helvetica", 12)
        p.drawString(100, 730, f"Category: {group.category}")
        p.drawString(100, 715, f"Date Range: {expenses.last().date if expenses.exists() else 'N/A'} to {expenses.first().date if expenses.exists() else 'N/A'}")
        
        y = 680
        p.setFont("Helvetica-Bold", 10)
        p.drawString(100, y, "Title")
        p.drawString(250, y, "Amount")
        p.drawString(350, y, "Paid By")
        p.drawString(450, y, "Date")
        
        p.setFont("Helvetica", 10)
        for expense in expenses:
            y -= 20
            if y < 100:
                p.showPage()
                y = 750
            p.drawString(100, y, expense.title[:25])
            p.drawString(250, y, f"{expense.currency} {expense.amount}")
            p.drawString(350, y, expense.paid_by.username)
            p.drawString(450, y, str(expense.date))
            
        p.showPage()
        p.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{group.name}_report.pdf"'
        return response

class ExportExcelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)
        expenses = Expense.objects.filter(group=group, is_deleted=False).order_by('-date')
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Expense Report"
        
        headers = ['Title', 'Amount', 'Currency', 'Category', 'Paid By', 'Date', 'Notes']
        ws.append(headers)
        
        for expense in expenses:
            ws.append([
                expense.title,
                expense.amount,
                expense.currency,
                expense.category,
                expense.paid_by.username,
                expense.date,
                expense.notes
            ])
            
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{group.name}_report.xlsx"'
        return response
