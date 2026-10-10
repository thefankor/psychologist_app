def test_patch_profile_rejects_bogus_timezone(authed_psy):
    resp = authed_psy.patch(
        "/psychologists/profile/",
        json={"timezone": "Moscow"},
    )
    assert resp.status_code == 422


def test_patch_profile_rejects_empty_timezone(authed_psy):
    resp = authed_psy.patch(
        "/psychologists/profile/",
        json={"timezone": ""},
    )
    assert resp.status_code == 422


def test_patch_profile_accepts_valid_iana_zone(authed_psy):
    resp = authed_psy.patch(
        "/psychologists/profile/",
        json={"timezone": "Asia/Yekaterinburg"},
    )
    assert resp.status_code == 200


def test_patch_profile_accepts_utc(authed_psy):
    resp = authed_psy.patch(
        "/psychologists/profile/",
        json={"timezone": "UTC"},
    )
    assert resp.status_code == 200
