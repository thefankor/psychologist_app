def test_book_slot_via_api(authed_psy, authed_client, psy_id):
    create_slot = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create_slot.json()["id"]
    resp = authed_client.post("/user/appointments/", json={"slot_id": slot_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["slot_id"] == slot_id
    assert "2026-06-01T09:00" in data["start_at"]


def test_double_book_returns_409(authed_psy, authed_client):
    create = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create.json()["id"]
    r1 = authed_client.post("/user/appointments/", json={"slot_id": slot_id})
    assert r1.status_code == 200
    r2 = authed_client.post("/user/appointments/", json={"slot_id": slot_id})
    assert r2.status_code == 409


def test_book_missing_slot_returns_404(authed_client):
    import uuid

    resp = authed_client.post(
        "/user/appointments/", json={"slot_id": str(uuid.uuid4())}
    )
    assert resp.status_code == 404
