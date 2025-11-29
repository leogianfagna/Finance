from django.urls import path
from .views import (
    AssetListCreateView,
    AssetEvolutionListCreateView,
    TotalBalanceView,
    BalanceByTypeView,
    TotalByMonthView,
    ByTypeByMonthView,
    PercentageEvolutionView,
)

urlpatterns = [
    # CRUD básico de assets
    path("assets/", AssetListCreateView.as_view(), name="assets-list-create"),
    path(
        "assets/<str:asset_id>/evolutions/",
        AssetEvolutionListCreateView.as_view(),
        name="asset-evolutions",
    ),

    # Rotas extras de agregação
    path("summary/total/", TotalBalanceView.as_view(), name="summary-total"),
    path(
        "summary/by-type/",
        BalanceByTypeView.as_view(),
        name="summary-by-type",
    ),
    path(
        "summary/total-by-month/",
        TotalByMonthView.as_view(),
        name="summary-total-by-month",
    ),
    path(
        "summary/by-type-by-month/",
        ByTypeByMonthView.as_view(),
        name="summary-by-type-by-month",
    ),
    path(
        "summary/percentage-evolution/",
        PercentageEvolutionView.as_view(),
        name="summary-percentage-evolution",
    ),
]
