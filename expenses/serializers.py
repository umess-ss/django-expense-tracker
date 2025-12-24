from rest_framework import serializers
from .models import Expense, Income, Category

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [ 'id' , 'title','category', 'amount', 'date']

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id','title','category', 'amount', 'date']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name', 'transaction_type']