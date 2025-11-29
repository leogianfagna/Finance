import os
import firebase_admin
from firebase_admin import credentials, firestore
from django.conf import settings

# Inicializa o app do Firebase uma única vez
if not firebase_admin._apps:
    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if not cred_path:
        raise RuntimeError(
            "FIREBASE_CREDENTIALS_PATH não configurado no .env"
        )

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(
        cred,
        {
            "projectId": settings.FIREBASE_PROJECT_ID,
        },
    )

db = firestore.client()


def user_assets_collection(user_id: int):
    """
    Retorna a referência para a coleção de assets do usuário:
    users/{user_id}/assets
    """
    return (
        db.collection("users")
        .document(str(user_id))
        .collection("assets")
    )
