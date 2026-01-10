from rest_framework import serializers
from .models import Expense, Income, Category, Budget
from django.db import models
from django.db.models import Q


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
         model = Expense
         fields = ['id','title','category','amount','date','category_name']

    def __init__(self,  *args,**kwargs):
         super().__init__(*args, **kwargs)

         request = self.context.get('request')
         if request and request.user:
              self.fields['category'].queryset = Category.objects.filter(
                   transaction_type='EXPENSE',
                   user__in = [request.user,None]
              )


class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    class Meta:
        model = Income
        fields = ['id','title','category', 'amount', 'date','category_name']

    def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            request = self.context.get('request')
            if request and request.user:
                self.fields['category'].queryset = Category.objects.filter(
                    transaction_type='INCOME',
                    user__in = [request.user,None]
                )

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name', 'transaction_type']





class BudgetSerializer(serializers.ModelSerializer):
     category_name = serializers.CharField(source="category.name", read_only=True)

     class Meta:
          model = Budget
          fields = ["id", "category","category_name", "amount"]