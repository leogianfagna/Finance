from datetime import datetime
from typing import Any, Dict, List

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .firebase_client import user_assets_collection
from .serializers import AssetSerializer, AddEvolutionSerializer
from .utils import (
    get_latest_value_per_asset,
    group_totals_by_type,
    group_totals_by_month,
    group_totals_by_type_and_month,
    compute_percentage_evolution,
)


def _serialize_asset_doc(doc) -> Dict[str, Any]:
    data = doc.to_dict() or {}
    data["id"] = doc.id
    # Normalizar evolutions: garantir que date seja string ISO
    evolutions = data.get("evolutions", [])
    normalized_evos: List[Dict[str, Any]] = []
    for evo in evolutions:
        date_val = evo.get("date")
        if isinstance(date_val, str):
            date_str = date_val
        else:
            # Se for Timestamp ou datetime, converte para isoformat
            date_str = date_val.isoformat()
        normalized_evos.append(
            {
                "date": date_str,
                "value": float(evo.get("value", 0.0)),
            }
        )
    data["evolutions"] = normalized_evos
    return data


class AssetListCreateView(APIView):
    """
    GET: lista todos os assets do usuário.
    POST: cria um novo asset (com ou sem evoluções iniciais).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        col = user_assets_collection(request.user.id)
        docs = col.stream()
        assets = [_serialize_asset_doc(d) for d in docs]
        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AssetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        col = user_assets_collection(request.user.id)

        # Converte evoluções para formato adequado pro Firestore
        data = serializer.validated_data
        evolutions = data.get("evolutions", [])
        for evo in evolutions:
            # Transformar DateField (obj datetime.date) em string ISO
            if not isinstance(evo["date"], str):
                evo["date"] = evo["date"].isoformat()

        doc_ref = col.document()
        doc_ref.set(
            {
                "location": data["location"],
                "type": data["type"],
                "evolutions": evolutions,
                "created_at": datetime.utcnow().isoformat(),
            }
        )

        created_doc = doc_ref.get()
        asset_data = _serialize_asset_doc(created_doc)
        return Response(asset_data, status=status.HTTP_201_CREATED)


class AssetEvolutionListCreateView(APIView):
    """
    GET: lista evoluções de um asset específico.
    POST: adiciona uma nova evolução (data + valor).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, asset_id: str):
        col = user_assets_collection(request.user.id)
        doc = col.document(asset_id).get()
        if not doc.exists:
            return Response(
                {"detail": "Asset não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        asset = _serialize_asset_doc(doc)
        return Response(asset["evolutions"])

    def post(self, request, asset_id: str):
        serializer = AddEvolutionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        col = user_assets_collection(request.user.id)
        doc_ref = col.document(asset_id)
        doc = doc_ref.get()
        if not doc.exists:
            return Response(
                {"detail": "Asset não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        asset = _serialize_asset_doc(doc)
        evolutions = asset.get("evolutions", [])

        new_evo = serializer.validated_data
        if not isinstance(new_evo["date"], str):
            new_evo["date"] = new_evo["date"].isoformat()
        evolutions.append(
            {
                "date": new_evo["date"],
                "value": float(new_evo["value"]),
            }
        )

        doc_ref.update({"evolutions": evolutions})

        return Response(
            {"detail": "Evolução adicionada com sucesso."},
            status=status.HTTP_201_CREATED,
        )


class TotalBalanceView(APIView):
    """
    Resgatar saldo total (somatório do último valor de cada asset).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        col = user_assets_collection(request.user.id)
        docs = col.stream()
        assets = [_serialize_asset_doc(d) for d in docs]

        total = sum(get_latest_value_per_asset(a) for a in assets)
        return Response({"total_balance": total})


class BalanceByTypeView(APIView):
    """
    Resgatar saldo por tipo.
    Se for passado ?month=YYYY-MM, considera aquele mês
    (somando os valores registrados para aquele mês).
    Caso contrário, considera o último valor de cada asset.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")

        col = user_assets_collection(request.user.id)
        docs = col.stream()
        assets = [_serialize_asset_doc(d) for d in docs]

        if not month:
            # Usa último valor de cada asset
            by_type = group_totals_by_type(assets)
            return Response({"month": None, "balances_by_type": by_type})

        # Se há mês, calculamos usando os valores daquele mês
        from .utils import group_totals_by_type_and_month
        by_type_by_month = group_totals_by_type_and_month(assets)
        balances = by_type_by_month.get(month, {})
        return Response({"month": month, "balances_by_type": balances})


class TotalByMonthView(APIView):
    """
    Resgatar saldo total por mês.
    Retorna um dicionário: { 'YYYY-MM': total }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        col = user_assets_collection(request.user.id)
        docs = col.stream()
        assets = [_serialize_asset_doc(d) for d in docs]

        totals = group_totals_by_month(assets)
        return Response({"totals_by_month": totals})


class ByTypeByMonthView(APIView):
    """
    Resgatar saldo por tipo por mês.
    Retorna: { 'YYYY-MM': { 'Renda passiva': valor, 'Ações': valor, ... } }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        col = user_assets_collection(request.user.id)
        docs = col.stream()
        assets = [_serialize_asset_doc(d) for d in docs]

        totals = group_totals_by_type_and_month(assets)
        return Response({"totals_by_type_by_month": totals})


class PercentageEvolutionView(APIView):
    """
    Resgatar evoluções em porcentagens dentro de um intervalo de meses.

    Params:
      - start=YYYY-MM
      - end=YYYY-MM

    Exemplo:
      /api/patrimony/summary/percentage-evolution/?start=2025-10&end=2025-11
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        if not start or not end:
            return Response(
                {
                    "detail": "Parâmetros 'start' e 'end' (YYYY-MM) são obrigatórios."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        col = user_assets_collection(request.user.id)
        docs = col.stream()
        assets = [_serialize_asset_doc(d) for d in docs]

        result = compute_percentage_evolution(assets, start, end)
        return Response(result)
