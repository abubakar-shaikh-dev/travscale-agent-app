# Travscale API — Onboarding

Reference for the frontend developer. Covers every endpoint under `/onboarding` and the
sequence of calls that takes a brand new account to a usable dashboard. The agency,
location and storage endpoints it orchestrates live in
[agency-api.md](./agency-api.md) and [storage-api.md](./storage-api.md).

- **Base URL (dev):** `http://localhost:8000`
- **Content type:** `application/json` for every request and response in this document.
- **All timestamps:** ISO 8601 UTC strings, e.g. `"2026-10-04T05:30:50.123Z"`.
- **All ids:** UUID v7 strings, e.g. `"0198b0f2-1c3d-7a4b-9e10-2f5c6d7e8a90"`.
- **Rate limit:** 100 requests per minute per IP, shared across the whole API. A breach
  returns `429 RATE_LIMIT_EXCEEDED`.

| Endpoint                                   | Method | Auth | Purpose                                     |
| ------------------------------------------ | ------ | ---- | ------------------------------------------- |
| [`/onboarding/status`](#41-get-the-status) | `GET`  | yes  | which steps are done, what to render next   |
| [`/onboarding/complete`](#42-complete)     | `POST` | yes  | stamp onboarding done, unlock the dashboard |

---

## 1. Authentication

Every endpoint in this document requires an access token.

```
Authorization: Bearer <access_token>
```

Onboarding routes sit behind the **verified email** gate, so a token whose account is still
on the OTP step is refused:

| Status | `error.code`         | `message`                             |
| ------ | -------------------- | ------------------------------------- |
| 401    | `UNAUTHORIZED`       | Missing or invalid Bearer token       |
| 403    | `EMAIL_NOT_VERIFIED` | Verify your email address to continue |
| 403    | `ACCOUNT_SUSPENDED`  | This account has been suspended       |

`EMAIL_NOT_VERIFIED` is a normal in-progress state, not an error to log out on — route to
the OTP screen instead. See [auth-api.md §3](./auth-api.md#3-the-account-lifecycle).

---

## 2. Response envelopes

Never read the payload directly. It is always nested under `data`.

### Success

```json
{
  "success": true,
  "message": "Onboarding status fetched successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-10-04T05:30:50.123Z",
    "request_id": "req-8fA2"
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Finish the onboarding steps to continue",
  "error": {
    "code": "ONBOARDING_INCOMPLETE",
    "details": null
  },
  "meta": {
    "timestamp": "2026-10-04T05:31:02.004Z",
    "request_id": "req-9Bc3",
    "path": "/onboarding/complete"
  }
}
```

- `message` is human readable, show it directly.
- `error.code` is the stable machine value, branch on it.
- `error.details` is always `null` for onboarding errors — neither endpoint takes a body.

---

## 3. The onboarding flow

```
POST /auth/register              → tokens + OTP, onboarding_completed: false
POST /auth/verify-otp            → email verified, account ACTIVE
       ↓
GET  /onboarding/status          → next_step: "agency"
POST /agency                     → agency created
       ↓
POST /storage/upload-url         → logo, OPTIONAL — skip the whole block any time
PUT  <upload_url>                → bytes go straight to the bucket
POST /storage/confirm            → upload becomes usable
PATCH /agency/me                 → { "logo_key": "<key>" }
       ↓
GET  /onboarding/status          → next_step: "location"
POST /agency/me/locations        → first location
       ↓
POST /onboarding/complete        → onboarding_completed: true, dashboard unlocked
```

**The status endpoint drives the wizard.** Call `GET /onboarding/status` after every step
and render the screen its `next_step` names. Do not hardcode the order client-side.

**Progress is resumable.** Each step is its own request and is saved the moment it
succeeds, so the user can close the tab anywhere and land back on the right screen. There
is no transaction spanning the whole flow and no "restart onboarding" endpoint.

**The logo step has an ordering constraint.** Storage endpoints are scoped to the agency,
so they return `404 AGENCY_NOT_FOUND` until `POST /agency` has succeeded. The agency
screen always comes before the logo screen.

**The logo step never blocks.** `next_step` goes straight from `agency` to `location` —
`steps.logo_uploaded` only exists so the wizard can show an uploaded logo and offer a
replace control.

**Completion is explicit.** Nothing stamps onboarding done until the client calls
`POST /onboarding/complete`. That call validates the steps server-side, so it is the one
place the rules live.

---

## 4. Data shapes

### OnboardingStatus

Returned by both endpoints.

```json
{
  "steps": {
    "agency_created": true,
    "location_added": false,
    "logo_uploaded": false
  },
  "next_step": "location",
  "onboarding_completed": false
}
```

| Field                  | Type    | Notes                                                                                 |
| ---------------------- | ------- | ------------------------------------------------------------------------------------- |
| `steps.agency_created` | boolean | an active agency exists for the account                                               |
| `steps.location_added` | boolean | the agency has at least one **active** location, soft deleted ones do not count       |
| `steps.logo_uploaded`  | boolean | `agency.logo_key` is set. Informational only, see [storage-api.md](./storage-api.md). |
| `next_step`            | enum    | `"agency"` \| `"location"` \| `"done"` — the screen to render                         |
| `onboarding_completed` | boolean | the account stamp, the same value `authenticateOnboarded` gates dashboard routes on   |

Rules worth knowing:

- `next_step` is `"done"` once an agency **and** a location exist, even before
  `/onboarding/complete` has been called — that call is what flips `onboarding_completed`.
- `onboarding_completed` is a **permanent stamp**. Deleting every location afterwards does
  not re-lock the dashboard, it only makes `steps.location_added` read `false`.
- `logo_uploaded` can be stale: `logo_key` survives deleting the object in storage. Treat
  a failed `GET /storage/url` as "no logo".

---

## 5. Onboarding API

Base path `/onboarding`. Every route needs the bearer token and a verified email.

### 5.1 Get the status

```
GET /onboarding/status
```

No body, no query. Call this on app boot (after the OTP screen), after every step, and on
any route guard failure.

**Response** — `200`, `data` is an [OnboardingStatus](#onboardingstatus).

```json
{
  "success": true,
  "message": "Onboarding status fetched successfully",
  "data": {
    "steps": {
      "agency_created": false,
      "location_added": false,
      "logo_uploaded": false
    },
    "next_step": "agency",
    "onboarding_completed": false
  },
  "meta": { "timestamp": "2026-10-04T05:30:50.123Z", "request_id": "req-1" }
}
```

**Errors**

| Status | `error.code`         | Cause                                         |
| ------ | -------------------- | --------------------------------------------- |
| 401    | `UNAUTHORIZED`       | missing/expired token                         |
| 403    | `EMAIL_NOT_VERIFIED` | the account is still on the OTP step          |
| 403    | `ACCOUNT_SUSPENDED`  | the account is `SUSPENDED` or `DEACTIVATED`   |
| 404    | `USER_NOT_FOUND`     | the account behind the token was soft deleted |

### 5.2 Complete

```
POST /onboarding/complete
```

No body. Validates that the agency and first location exist, then stamps onboarding done.

Call it from the last wizard screen, after `POST /agency/me/locations` has returned `201`.
It is **idempotent**: a repeated call re-validates and returns the same status, it does not
error.

**Response** — `200`, `data` is the [OnboardingStatus](#onboardingstatus) with
`onboarding_completed: true` and `next_step: "done"`.

```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "steps": {
      "agency_created": true,
      "location_added": true,
      "logo_uploaded": true
    },
    "next_step": "done",
    "onboarding_completed": true
  },
  "meta": { "timestamp": "2026-10-04T05:42:11.000Z", "request_id": "req-9" }
}
```

**Errors**

| Status | `error.code`            | Cause                                         |
| ------ | ----------------------- | --------------------------------------------- |
| 401    | `UNAUTHORIZED`          | missing/expired token                         |
| 403    | `EMAIL_NOT_VERIFIED`    | the account is still on the OTP step          |
| 403    | `ACCOUNT_SUSPENDED`     | the account is `SUSPENDED` or `DEACTIVATED`   |
| 403    | `ONBOARDING_INCOMPLETE` | no location exists for the agency yet         |
| 404    | `AGENCY_NOT_FOUND`      | no agency exists, the agency step was skipped |
| 404    | `USER_NOT_FOUND`        | the account behind the token was soft deleted |

`AGENCY_NOT_FOUND` and `ONBOARDING_INCOMPLETE` both mean "a step is missing". Show the
screen for `next_step` from the last status — or fetch the status again, it is one call.

### 5.3 Onboarding errors

| Status | `error.code`            | `message`                               |
| ------ | ----------------------- | --------------------------------------- |
| 401    | `UNAUTHORIZED`          | Missing or invalid Bearer token         |
| 403    | `EMAIL_NOT_VERIFIED`    | Verify your email address to continue   |
| 403    | `ACCOUNT_SUSPENDED`     | This account has been suspended         |
| 403    | `ONBOARDING_INCOMPLETE` | Finish the onboarding steps to continue |
| 404    | `AGENCY_NOT_FOUND`      | Agency not found                        |
| 404    | `USER_NOT_FOUND`        | User not found                          |

---

## 6. Frontend integration notes

**Routing on boot.** `POST /auth/register` and `POST /auth/login` return
`user.onboarding_completed` — read it to decide between the onboarding wizard and the
dashboard before the first protected request. It is a boolean, not a timestamp. The only
source of truth after that is `GET /onboarding/status`.

**The dashboard gate.** Business routes sit behind a stricter guard that returns:

```json
{
  "success": false,
  "message": "Finish the onboarding steps to continue",
  "error": { "code": "ONBOARDING_INCOMPLETE", "details": null },
  "meta": { "timestamp": "...", "request_id": "...", "path": "/bookings" }
}
```

Treat `403 ONBOARDING_INCOMPLETE` like `403 EMAIL_NOT_VERIFIED`: the session is fine, the
user just has steps left. Route to the wizard at the `next_step` screen and do not sign
anyone out.

**Guard ordering matters.** `401` → refresh, then retry once. `403 EMAIL_NOT_VERIFIED` →
OTP screen. `403 ONBOARDING_INCOMPLETE` → onboarding wizard. Anything else → error state.
Check in that order, since a single request can only fail one of them.

**Agency first, logo second.** `POST /agency` must succeed before any storage call, they
all resolve the agency from the token and answer `404 AGENCY_NOT_FOUND` without one. Send
`logo_key` to the agency either at creation or with `PATCH /agency/me` after confirming the
upload.

**Editing after the fact.** Everything created during onboarding stays editable through
the regular agency and location endpoints — onboarding is only the first pass. The wizard
is not re-enterable as a flow, there is no onboarding-scoped update endpoint.

**Suggested api-client surface.**

```ts
onboardingApi = {
  status: () => get("/onboarding/status"),
  complete: () => post("/onboarding/complete"),
};
```

