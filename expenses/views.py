from .models import Expense, Income, Category, Budget
from .serializers import ExpenseSerializer, IncomeSerializer, CategorySerializer, BudgetSerializer
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.db.models import Sum, Q
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.utils.timezone import now
from rest_framework.views import APIView
import csv
from django.http import HttpResponse
from datetime import datetime, timedelta


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user).select_related("category")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(date__gte = start_date)
        if end_date:
            queryset = queryset.filter(date__lte = end_date)

        return queryset.order_by("-date")
    
    @action(detail=False,methods=["get"])
    def export_csv(self,request):
        expenses = self.get_queryset()
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="expenses.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Title','Category', 'Amount'])


        # write data
        for e in expenses:
            writer.writerow([
                e.date.strftime('%Y-%m-%d'),
                e.title,
                e.category.name if e.category else 'N/A',
                str(e.amount)
            ])
        return response
    


    @action(detail=False,methods=["get"])
    def summary_stats(self,request):
        expenses = self.get_queryset()

        total = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        count = expenses.count()
        avg = total/count if count > 0 else 0



        by_category = expenses.values("category__name").annotate(
            total=Sum("amount")
        ).order_by("-total")

        return Response({
            'total':float(total),
            'count':count,
            'average':float(avg),
            'by_category':list(by_category)
        })

    
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user == self.request.user:
            instance.delete()

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
        category = serializer.validated_data['category']
        amount = serializer.validated_data['amount']

        budget, created = Budget.objects.update_or_create(
            user=self.request.user,
            category=category,
            defaults={"amount":amount}
        )

        serializer.instance = budget




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
