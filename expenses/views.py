from .models import Expense, Income, Category
from .serializers import ExpenseSerializer, IncomeSerializer, CategorySerializer
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.db.models import Sum, Q
from rest_framework.response import Response
from django.db.models.functions import TruncMonth



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
    
    @action(detail=False,methods=['get'])
    def analytics(self,request):
        user = self.request.user

        category_data =(
            Expense.objects.filter(user=user).values('category__name').annotate(total=Sum('amount')).order_by('-total')
        )

        monthly_data = ({
            Expense.objects.filter(user=user).annotate(month=TruncMonth('date')).values('date__month').annotate(total=Sum('amount')).order_by('month')
        })


        return Response({
            'by_category':category_data,
            'by_month':monthly_data
        })


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = self.request.user
        total_income = Income.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = Expense.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum'] or 0

        return Response({
            'total_income':total_income,
            'total_expense':total_expenses,
            'net_income':total_income-total_expenses
        })
    
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.filter(Q(user=self.request.user) | Q(user__isnull = True))

        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type.upper())
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)