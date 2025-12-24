from django.db import models
from django.contrib.auth.models import User
from django.db.models import TextChoices
from django.utils import timezone


class Category(models.Model):
    class CategoryType(TextChoices):
        INCOME = 'INCOME', 'Income'
        EXPENSE = 'EXPENSE', 'Expense'

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=50)
    transaction_type = models.CharField(max_length=20, choices=CategoryType.choices)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        unique_together = ('user', 'name', 'transaction_type')
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name

class Transactions(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    class Meta:
        abstract = True


# Create your models here.
class Expense(Transactions):
    class Meta:
        verbose_name_plural = 'expenses'
    


class Income(Transactions):
    class Meta:
        verbose_name_plural = 'incomes'


