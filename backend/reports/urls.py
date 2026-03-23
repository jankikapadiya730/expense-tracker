from django.urls import path
from .views import ExportPDFView, ExportExcelView

urlpatterns = [
    path('group/<uuid:group_id>/pdf/', ExportPDFView.as_view(), name='export_pdf'),
    path('group/<uuid:group_id>/excel/', ExportExcelView.as_view(), name='export_excel'),
]
