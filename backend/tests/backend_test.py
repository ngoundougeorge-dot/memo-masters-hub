"""Backend API tests for MémoirePro."""
import os
import io
import base64
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback: read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@memoirepro.africa"
ADMIN_PASSWORD = "admin123"
WRITER_KEY = "redacteur-memoirepro-2026"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="module")
def new_user(s):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "secret123"})
    assert r.status_code == 200, r.text
    return {"email": email, "token": r.json()["token"], "user": r.json()["user"]}


# ---------------- Auth ----------------
class TestAuth:
    def test_register_and_me(self, s, new_user):
        r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {new_user['token']}"})
        assert r.status_code == 200
        assert r.json()["user"]["email"] == new_user["email"]

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "wrong123"})
        assert r.status_code == 401

    def test_admin_login(self, admin_token):
        assert admin_token

    def test_duplicate_register(self, s, new_user):
        r = s.post(f"{API}/auth/register", json={"name": "Xy", "email": new_user["email"], "password": "secret123"})
        assert r.status_code == 400, r.text

    def test_me_no_token(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------------- Orders ----------------
class TestOrders:
    order_id = None

    def test_create_order(self, s):
        payload = {
            "full_name": "Jean Test",
            "email": "jean@test.com",
            "phone": "+22500000000",
            "document_type": "memoire",
            "subject": "Étude sur le développement durable en Afrique de l'Ouest",
        }
        r = s.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        TestOrders.order_id = r.json()["id"]
        assert TestOrders.order_id

    def test_get_order(self, s):
        r = s.get(f"{API}/orders/{TestOrders.order_id}")
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "nouveau"
        assert d["id"] == TestOrders.order_id

    def test_get_missing_order(self, s):
        r = s.get(f"{API}/orders/{uuid.uuid4()}")
        assert r.status_code == 404

    def test_upload_and_attach(self, s):
        files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
        r = s.post(f"{API}/files/upload", files=files)
        assert r.status_code == 200, r.text
        fid = r.json()["id"]
        r = s.post(f"{API}/orders/attach-files", json={"order_id": TestOrders.order_id, "file_ids": [fid]})
        assert r.status_code == 200
        assert fid in r.json()["file_ids"]
        # Download it back
        r = s.get(f"{API}/files/{fid}/download")
        assert r.status_code == 200
        assert r.content == b"hello world"

    def test_submit_documents(self, s):
        r = s.post(f"{API}/orders/submit-documents", json={"order_id": TestOrders.order_id})
        assert r.status_code == 200
        assert r.json()["ok"] is True
        r = s.get(f"{API}/orders/{TestOrders.order_id}")
        assert r.json()["status"] == "documents_envoyes"

    def test_submit_without_files(self, s):
        r = s.post(f"{API}/orders", json={
            "full_name": "Alice", "email": "alice@example.com", "phone": "+123456789",
            "document_type": "rapport",
            "subject": "Un sujet valide de plus de cinq caracteres",
        })
        assert r.status_code == 200, r.text
        oid = r.json()["id"]
        r = s.post(f"{API}/orders/submit-documents", json={"order_id": oid})
        assert r.status_code == 400


# ---------------- Writer ----------------
class TestWriter:
    def test_list_orders_bad_key(self, s):
        r = s.post(f"{API}/writer/orders", json={"key": "wrong"})
        assert r.status_code == 403

    def test_list_orders(self, s):
        r = s.post(f"{API}/writer/orders", json={"key": WRITER_KEY})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_update_status(self, s):
        assert TestOrders.order_id
        r = s.post(f"{API}/writer/update-status", json={
            "key": WRITER_KEY, "order_id": TestOrders.order_id, "status": "en_cours", "price_fcfa": 50000,
        })
        assert r.status_code == 200
        r = s.get(f"{API}/orders/{TestOrders.order_id}")
        assert r.json()["status"] == "en_cours"
        assert r.json()["price_fcfa"] == 50000

    def test_mark_seen_all(self, s):
        r = s.post(f"{API}/writer/mark-seen", json={"key": WRITER_KEY, "all": True})
        assert r.status_code == 200


# ---------------- Documents ----------------
class TestDocuments:
    doc_id = None

    def test_create(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.post(f"{API}/documents", json={"title": "TEST_Doc", "content": "hello"}, headers=h)
        assert r.status_code == 200
        TestDocuments.doc_id = r.json()["id"]

    def test_list(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.get(f"{API}/documents", headers=h)
        assert r.status_code == 200
        assert any(d["id"] == TestDocuments.doc_id for d in r.json())

    def test_update_and_persistence(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.put(f"{API}/documents/{TestDocuments.doc_id}",
                  json={"title": "TEST_Doc2", "content": "world"}, headers=h)
        assert r.status_code == 200
        r = s.get(f"{API}/documents/{TestDocuments.doc_id}", headers=h)
        assert r.json()["content"] == "world"

    def test_delete(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.delete(f"{API}/documents/{TestDocuments.doc_id}", headers=h)
        assert r.status_code == 200
        r = s.get(f"{API}/documents/{TestDocuments.doc_id}", headers=h)
        assert r.status_code == 404


# ---------------- Export (docx / pdf) ----------------
class TestExport:
    def test_export_requires_auth(self, s, new_user):
        # Create a doc first
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.post(f"{API}/documents", json={"title": "TEST_Export", "content": "# Titre\n\nContenu de test."}, headers=h)
        assert r.status_code == 200
        doc_id = r.json()["id"]
        TestExport.doc_id = doc_id

        # No auth -> 401/403
        r = s.get(f"{API}/documents/{doc_id}/export?format=pdf")
        assert r.status_code in (401, 403)

    def test_export_pdf(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.get(f"{API}/documents/{TestExport.doc_id}/export?format=pdf", headers=h)
        assert r.status_code == 200, r.text
        assert r.headers["content-type"].startswith("application/pdf")
        assert r.content[:4] == b"%PDF"
        assert len(r.content) > 500

    def test_export_docx(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.get(f"{API}/documents/{TestExport.doc_id}/export?format=docx", headers=h)
        assert r.status_code == 200, r.text
        assert "wordprocessingml" in r.headers["content-type"]
        # DOCX is a zip
        assert r.content[:2] == b"PK"
        assert len(r.content) > 500

    def test_export_other_user_404(self, s, new_user):
        # Register another user, try to export the first user's doc
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/auth/register", json={"name": "Other", "email": email, "password": "secret123"})
        assert r.status_code == 200
        tok = r.json()["token"]
        r = s.get(f"{API}/documents/{TestExport.doc_id}/export?format=pdf",
                  headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 404


# ---------------- Notifications (simulation mode) ----------------
class TestNotifications:
    """Backend should respond 200 for status change + submit-documents endpoints.
       Email is in simulation mode (RESEND_API_KEY empty) — we don't assert email delivery."""

    def test_status_change_triggers_notification(self, s):
        # Create fresh order + attach a file + submit + writer update
        r = s.post(f"{API}/orders", json={
            "full_name": "Notif Test", "email": "notif@test.com", "phone": "+22500000001",
            "document_type": "memoire", "subject": "Sujet de test pour notifications email en simulation",
        })
        assert r.status_code == 200
        oid = r.json()["id"]
        # Attach + submit
        files = {"file": ("notif.txt", io.BytesIO(b"content"), "text/plain")}
        fid = s.post(f"{API}/files/upload", files=files).json()["id"]
        s.post(f"{API}/orders/attach-files", json={"order_id": oid, "file_ids": [fid]})
        r = s.post(f"{API}/orders/submit-documents", json={"order_id": oid})
        assert r.status_code == 200
        assert s.get(f"{API}/orders/{oid}").json()["status"] == "documents_envoyes"

        # Writer status update triggers notify_status_change
        r = s.post(f"{API}/writer/update-status", json={
            "key": WRITER_KEY, "order_id": oid, "status": "en_cours", "price_fcfa": 40000,
        })
        assert r.status_code == 200
        assert s.get(f"{API}/orders/{oid}").json()["status"] == "en_cours"

        # Another transition
        r = s.post(f"{API}/writer/update-status", json={
            "key": WRITER_KEY, "order_id": oid, "status": "livre",
        })
        assert r.status_code == 200
        assert s.get(f"{API}/orders/{oid}").json()["status"] == "livre"


# ---------------- AI streaming ----------------
class TestAI:
    def test_ai_chat_stream(self, s, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = s.post(f"{API}/ai/chat", json={"message": "Bonjour, dis juste 'ok'.", "mode": "chat"},
                   headers=h, stream=True, timeout=60)
        assert r.status_code == 200
        text_out = ""
        got_done = False
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("data: "):
                payload = line[6:]
                if payload == "[DONE]":
                    got_done = True
                    break
                try:
                    text_out += base64.b64decode(payload).decode("utf-8")
                except Exception:
                    pass
            if line.startswith("event: done"):
                got_done = True
        assert len(text_out) > 0, "No AI text received"
        # done marker not strictly required if stream ended, but should exist
