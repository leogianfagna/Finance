from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any, Tuple


def _month_key_from_date_str(date_str: str) -> str:
    """
    Converte 'YYYY-MM-DD' para 'YYYY-MM'.
    """
    dt = datetime.fromisoformat(date_str)
    return f"{dt.year:04d}-{dt.month:02d}"


def get_latest_value_per_asset(asset: Dict[str, Any]) -> float:
    """
    Retorna o último valor de evolução de um asset (pelo campo date).
    """
    evolutions = asset.get("evolutions", [])
    if not evolutions:
        return 0.0
    ordered = sorted(evolutions, key=lambda e: e["date"])
    return float(ordered[-1]["value"])


def group_totals_by_type(assets: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Soma o último valor de cada asset por tipo.
    """
    result = defaultdict(float)
    for asset in assets:
        latest = get_latest_value_per_asset(asset)
        asset_type = asset.get("type", "desconhecido")
        result[asset_type] += latest
    return dict(result)


def group_totals_by_month(assets: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Soma os valores por mês (considerando cada evolução como valor daquele mês).
    Não faz carry-over (não leva o valor para meses sem registro).
    """
    totals = defaultdict(float)
    for asset in assets:
        for evo in asset.get("evolutions", []):
            month_key = _month_key_from_date_str(evo["date"])
            totals[month_key] += float(evo["value"])
    # Ordenar pelo mês
    return dict(sorted(totals.items(), key=lambda kv: kv[0]))


def group_totals_by_type_and_month(
    assets: List[Dict[str, Any]]
) -> Dict[str, Dict[str, float]]:
    """
    Resultado: { 'YYYY-MM': { 'Renda passiva': valor, 'Ações': valor, ... } }
    """
    totals: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for asset in assets:
        asset_type = asset.get("type", "desconhecido")
        for evo in asset.get("evolutions", []):
            month_key = _month_key_from_date_str(evo["date"])
            totals[month_key][asset_type] += float(evo["value"])
    # Converter nested default dicts para dict normal
    ordered: Dict[str, Dict[str, float]] = {}
    for month in sorted(totals.keys()):
        ordered[month] = dict(totals[month])
    return ordered


def get_totals_for_month(
    totals_by_month: Dict[str, float],
    month: str,
) -> float:
    """
    Pega o total para um mês específico (YYYY-MM).
    Caso não exista, retorna 0.0.
    """
    return float(totals_by_month.get(month, 0.0))


def get_totals_by_type_for_month(
    totals_by_type_by_month: Dict[str, Dict[str, float]],
    month: str,
) -> Dict[str, float]:
    """
    Pega os totais por tipo para um mês específico (YYYY-MM).
    """
    return dict(totals_by_type_by_month.get(month, {}))


def compute_percentage_change(
    initial: float,
    final: float,
) -> float | None:
    """
    Calcula a variação percentual entre initial e final.
    Se initial for 0, retorna None (não faz sentido percentual).
    """
    if initial == 0:
        return None
    return (final - initial) / initial * 100.0


def compute_percentage_evolution(
    assets: List[Dict[str, Any]],
    start_month: str,
    end_month: str,
) -> Dict[str, Any]:
    """
    Calcula a evolução percentual total e por tipo entre dois meses (YYYY-MM).
    Usa os valores consolidados por mês (não faz carry-over).
    """
    totals_by_month = group_totals_by_month(assets)
    totals_by_type_by_month = group_totals_by_type_and_month(assets)

    initial_total = get_totals_for_month(totals_by_month, start_month)
    final_total = get_totals_for_month(totals_by_month, end_month)
    total_change = compute_percentage_change(initial_total, final_total)

    initial_by_type = get_totals_by_type_for_month(
        totals_by_type_by_month, start_month
    )
    final_by_type = get_totals_by_type_for_month(
        totals_by_type_by_month, end_month
    )

    all_types = set(initial_by_type.keys()) | set(final_by_type.keys())
    by_type_change: Dict[str, float | None] = {}
    for t in all_types:
        init = float(initial_by_type.get(t, 0.0))
        fin = float(final_by_type.get(t, 0.0))
        by_type_change[t] = compute_percentage_change(init, fin)

    return {
        "start_month": start_month,
        "end_month": end_month,
        "initial_total": initial_total,
        "final_total": final_total,
        "total_change_percent": total_change,
        "by_type_change_percent": by_type_change,
    }
