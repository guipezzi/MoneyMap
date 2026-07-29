from rest_framework import serializers
from categories.models import Category
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            'id', 'description', 'amount', 'type',
            'date', 'category', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        category = attrs.get('category')
        transaction_type = attrs.get('type')

        # Em updates parciais (PATCH), o campo pode não vir no payload;
        # nesse caso, usamos o valor já existente na instância.
        if category is None and self.instance:
            category = self.instance.category
        if transaction_type is None and self.instance:
            transaction_type = self.instance.type

        if category and transaction_type and category.type != transaction_type:
            raise serializers.ValidationError(
                {'type': 'O tipo da transação deve ser igual ao tipo da categoria.'}
            )
        return attrs

    def validate_category(self, value):
        # Garante que o usuário só possa vincular categorias que são dele.
        request = self.context.get('request')
        if request and value.user != request.user:
            raise serializers.ValidationError('Categoria inválida.')
        return value