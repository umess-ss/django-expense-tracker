from .models import Expense
from .serializers import ExpenseSerializer
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.db.models import Sum
from rest_framework.response import Response


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def total(self,request):
        total = self.get_queryset().aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({'total_expenses':total})

