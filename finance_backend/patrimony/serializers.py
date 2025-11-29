from rest_framework import serializers


class EvolutionSerializer(serializers.Serializer):
    """
    Um ponto de evolução de saldo:
    - date: data (YYYY-MM-DD)
    - value: valor numérico do saldo naquele mês
    """
    date = serializers.DateField(help_text="Data no formato YYYY-MM-DD (use o primeiro dia do mês, por exemplo).")
    value = serializers.FloatField()


class AssetSerializer(serializers.Serializer):
    """
    Representa um 'ativo' em uma plataforma:
    - location: onde está (ex: 'Nubank caixinhas')
    - type: tipo (ex: 'Renda passiva', 'Ações', etc)
    - evolutions: lista de pontos de saldo ao longo do tempo
    """
    id = serializers.CharField(read_only=True)
    location = serializers.CharField(max_length=255)
    type = serializers.CharField(max_length=100)
    evolutions = EvolutionSerializer(many=True, required=False)


class AddEvolutionSerializer(serializers.Serializer):
    """
    Serializer para adicionar uma nova evolução a um asset.
    """
    date = serializers.DateField()
    value = serializers.FloatField()
