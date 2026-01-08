from .models import Expense, Income, Category, Budget
from .serializers import ExpenseSerializer, IncomeSerializer, CategorySerializer, BudgetSerializer
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.db.models import Sum, Q
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.utils.timezone import now
from rest_framework.views import APIView



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

        monthly_data = (
            Expense.objects.filter(user=user).annotate(month=TruncMonth('date')).values('date__month').annotate(total=Sum('amount')).order_by('month')
        )


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


class BudgetViewset(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
    
    def perform_create(self,serializer):
        existing = Budget.objects.filter(user=self.request.user, category_id=self.request.data.get("category")).first()

        if existing:
            serializer.instance = existing
        serializer.save(user=self.request.user)




class BudgetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]


    def get(self,request):
        user=request.user
        today= now().date()

        expenses = (Expense.objects.filter(user=user, date__year=today.year, date__month=today.month).values("category_id").annotate(spent=Sum("amount")))


        spent_map = {e["category_id"]:e["spent"] for e in expenses}

        budgets = Budget.objects.filter(user=user).select_related("category")



        data = []

        for b in budgets:
            spent = spent_map.get(b.category_id,0) or 0
            percent = (float(spent)/float(b.amount)) * 100 if b.amount >0 else 0
            data.append({
                "id":b.id,
                "category":b.category.name,
                "budget_limit":str(b.amount),
                "actual_limit":str(spent),
                "remaining":str(b.amount - spent),
                "percent":round(percent,1)
            })

        return Response(data)
