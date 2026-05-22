def test_get_template_empty(authed_psy):
    resp = authed_psy.get("/psychologists/template/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_put_template_creates_ranges(authed_psy):
    body = {
        "ranges": [
            {
                "day_of_week": "MONDAY",
                "start_time": "09:00:00",
                "end_time": "12:00:00",
                "is_active": True,
            },
            {
                "day_of_week": "MONDAY",
                "start_time": "14:00:00",
                "end_time": "18:00:00",
                "is_active": True,
            },
        ]
    }
    resp = authed_psy.put("/psychologists/template/", json=body)
    assert resp.status_code == 200, resp.text  # show body on failure
    data = resp.json()
    assert len(data) == 2


def test_put_template_rejects_overlap(authed_psy):
    body = {
        "ranges": [
            {
                "day_of_week": "MONDAY",
                "start_time": "09:00:00",
                "end_time": "13:00:00",
                "is_active": True,
            },
            {
                "day_of_week": "MONDAY",
                "start_time": "12:00:00",
                "end_time": "14:00:00",
                "is_active": True,
            },
        ]
    }
    resp = authed_psy.put("/psychologists/template/", json=body)
    assert resp.status_code == 422


def test_put_template_replaces_atomically(authed_psy):
    # First set Monday
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
    # Replace with Tuesday
    authed_psy.put(
        "/psychologists/template/",
        json={
            "ranges": [
                {
                    "day_of_week": "TUESDAY",
                    "start_time": "10:00:00",
                    "end_time": "11:00:00",
                    "is_active": True,
                }
            ]
        },
    )
    resp = authed_psy.get("/psychologists/template/")
    data = resp.json()
    assert len(data) == 1
    assert data[0]["day_of_week"] == "TUESDAY"
