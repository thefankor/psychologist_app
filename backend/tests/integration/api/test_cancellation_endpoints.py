def test_client_cancels_returns_slot_to_free(authed_psy, authed_client, psy_id):
    create_slot = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create_slot.json()["id"]
    book = authed_client.post("/user/appointments/", json={"slot_id": slot_id})
    appt_id = book.json()["id"]
    cancel = authed_client.delete(f"/user/appointments/{appt_id}")
    assert cancel.status_code == 204

    free = authed_client.get(
        f"/psychologists/{psy_id}/free-slots/"
        "?from_dt=2026-06-01T00:00:00%2B00:00"
        "&to_dt=2026-06-02T00:00:00%2B00:00"
    )
    assert len(free.json()) == 1


def test_psy_cancels_marks_slot_cancelled(authed_psy, authed_client, psy_id):
    create_slot = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create_slot.json()["id"]
    authed_client.post("/user/appointments/", json={"slot_id": slot_id})
    psy_cancel = authed_psy.post(
        f"/psychologists/slots/{slot_id}/cancel",
        json={"reason": "тест"},
    )
    assert psy_cancel.status_code == 204

    free = authed_client.get(
        f"/psychologists/{psy_id}/free-slots/"
        "?from_dt=2026-06-01T00:00:00%2B00:00"
        "&to_dt=2026-06-02T00:00:00%2B00:00"
    )
    assert len(free.json()) == 0


def test_double_cancel_returns_409(authed_psy, authed_client):
    create_slot = authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    slot_id = create_slot.json()["id"]
    book = authed_client.post("/user/appointments/", json={"slot_id": slot_id})
    appt_id = book.json()["id"]
    authed_client.delete(f"/user/appointments/{appt_id}")
    resp = authed_client.delete(f"/user/appointments/{appt_id}")
    assert resp.status_code == 409
