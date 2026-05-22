def test_create_one_off_slot(authed_psy):
    starts = "2026-06-01T09:00:00+00:00"
    resp = authed_psy.post("/psychologists/slots/", json={"starts_at": starts})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "FREE"
    assert data["source"] == "MANUAL"


def test_list_my_slots(authed_psy):
    authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T10:00:00+00:00"},
    )
    resp = authed_psy.get(
        "/psychologists/slots/"
        "?from_dt=2026-06-01T00:00:00%2B00:00"
        "&to_dt=2026-06-02T00:00:00%2B00:00"
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_list_my_slots_status_filter(authed_psy):
    authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    resp = authed_psy.get(
        "/psychologists/slots/"
        "?from_dt=2026-06-01T00:00:00%2B00:00"
        "&to_dt=2026-06-02T00:00:00%2B00:00"
        "&status=BOOKED"
    )
    assert resp.status_code == 200
    assert resp.json() == []


def test_generate_from_template(authed_psy):
    authed_psy.put(
        "/psychologists/template/",
        json={
            "ranges": [
                {
                    "day_of_week": "MONDAY",
                    "start_time": "09:00:00",
                    "end_time": "12:00:00",
                    "is_active": True,
                }
            ]
        },
    )
    resp = authed_psy.post(
        "/psychologists/slots/generate?from_date=2026-06-01&to_date=2026-06-01"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["created"] == 3
    assert body["skipped"] == 0


def test_generate_idempotent(authed_psy):
    authed_psy.put(
        "/psychologists/template/",
        json={
            "ranges": [
                {
                    "day_of_week": "MONDAY",
                    "start_time": "09:00:00",
                    "end_time": "12:00:00",
                    "is_active": True,
                }
            ]
        },
    )
    authed_psy.post(
        "/psychologists/slots/generate?from_date=2026-06-01&to_date=2026-06-01"
    )
    resp = authed_psy.post(
        "/psychologists/slots/generate?from_date=2026-06-01&to_date=2026-06-01"
    )
    body = resp.json()
    assert body["created"] == 0
    assert body["skipped"] == 3


def test_delete_free_slot(authed_psy):
    create = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create.json()["id"]
    resp = authed_psy.delete(f"/psychologists/slots/{slot_id}")
    assert resp.status_code == 204


def test_patch_slot_starts_at(authed_psy):
    create = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create.json()["id"]
    resp = authed_psy.patch(
        f"/psychologists/slots/{slot_id}",
        json={"starts_at": "2026-06-01T14:30:00+00:00"},
    )
    assert resp.status_code == 200
    assert "2026-06-01T14:30" in resp.json()["starts_at"]


def test_create_slot_collision_returns_409(authed_psy):
    starts = "2026-06-01T09:00:00+00:00"
    authed_psy.post("/psychologists/slots/", json={"starts_at": starts})
    resp = authed_psy.post("/psychologists/slots/", json={"starts_at": starts})
    assert resp.status_code == 409
