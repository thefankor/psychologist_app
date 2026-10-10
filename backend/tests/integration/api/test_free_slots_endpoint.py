def test_list_psy_free_slots(authed_psy, psy_id):
    # psy creates a free slot
    authed_psy.post(
        "/psychologists/slots/",
        json={"starts_at": "2026-06-01T09:00:00+00:00"},
    )
    # any authed user can list them
    resp = authed_psy.get(
        f"/psychologists/{psy_id}/free-slots/"
        "?from_dt=2026-06-01T00:00:00%2B00:00"
        "&to_dt=2026-06-02T00:00:00%2B00:00"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 1
    assert body[0]["status"] == "FREE"


def test_free_slots_empty_for_unknown_psy(authed_psy):
    resp = authed_psy.get(
        "/psychologists/9999999/free-slots/"
        "?from_dt=2026-06-01T00:00:00%2B00:00"
        "&to_dt=2026-06-02T00:00:00%2B00:00"
    )
    assert resp.status_code == 200
    assert resp.json() == []
