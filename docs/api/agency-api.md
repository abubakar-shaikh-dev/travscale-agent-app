# Travscale API — Agency

Reference for the frontend agent. Covers every endpoint under `/agency` and
`/agency/me/locations`. File uploads are a separate module, see
[storage-api.md](./storage-api.md).

- **Base URL (dev):** `http://localhost:8000`
- **Content type:** `application/json` for every request and response in this document.
- **All timestamps:** ISO 8601 UTC strings, e.g. `"2026-10-04T05:30:50.123Z"`.
- **All ids:** UUID v7 strings, e.g. `"0198b0f2-1c3d-7a4b-9e10-2f5c6d7e8a90"`.
- **Rate limit:** 100 requests per minute per IP, shared across the whole API. A breach
  returns `429 RATE_LIMIT_EXCEEDED`.

---

## 1. Authentication

Every endpoint in this document requires an access token.

```
Authorization: Bearer <access_token>
```

Get it from `POST /auth/login`. The token lives at `data.access_token` in the response
envelope. It expires in **15 minutes**; refresh it with `POST /auth/refresh-token` using
`data.refresh_token` from login. A missing or invalid token returns:

| Status | `error.code`         | `message`                             |
| ------ | -------------------- | ------------------------------------- |
| 401    | `UNAUTHORIZED`       | Missing or invalid Bearer token       |
| 403    | `EMAIL_NOT_VERIFIED` | Verify your email address to continue |
| 403    | `ACCOUNT_SUSPENDED`  | This account has been suspended       |

`EMAIL_NOT_VERIFIED` means the account is still on the OTP step. The token from
`POST /auth/login` is valid, but it only reaches `/auth/verify-otp` and
`/auth/resend-otp` until the emailed code is submitted. `ACCOUNT_SUSPENDED` means
the account is `SUSPENDED` or `DEACTIVATED` and no endpoint will accept it.

The token identifies the **user**. The agency is not passed as a parameter anywhere —
every endpoint in this document operates on _the agency of the authenticated user_.
A user can own at most one agency, and an id belonging to another agency simply reads as
not found.

---

## 2. Response envelopes

Never read the payload directly. It is always nested under `data`.

### Success

```json
{
  "success": true,
  "message": "Agency fetched successfully",
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
  "message": "Agency not found",
  "error": {
    "code": "AGENCY_NOT_FOUND",
    "details": null
  },
  "meta": {
    "timestamp": "2026-10-04T05:31:02.004Z",
    "request_id": "req-9Bc3",
    "path": "/agency/me"
  }
}
```

- `message` is human readable, show it directly.
- `error.code` is the stable machine value, branch on it.
- `error.details` is `null` for business errors. On a `400` validation failure it is an
  array of `{ "field": "body.code", "message": "..." }` — use it for inline field errors.
- `error.details[].field` is a dot path, e.g. `body.entity_id` or `querystring.sort_by`.

### Frontend handling rules

1. Branch on the HTTP status first, then on `error.code`.
2. `401` → refresh or re-login, then retry the request once.
3. `400` with `VALIDATION_ERROR` → map `error.details` onto form fields.
4. `404` on `GET /agency/me` → the user has no agency yet, render the agency setup screen.
5. `5xx` → generic error state. Log `meta.request_id`, it is the only trace the backend keeps.

---

## 3. Pagination

Any endpoint that returns a list nests `items` and `pagination` inside `data`.

**Query parameters**

| Param        | Type            | Default | Rules                                   |
| ------------ | --------------- | ------- | --------------------------------------- |
| `page`       | number          | `1`     | integer ≥ 1                             |
| `limit`      | number          | `20`    | integer 1–100                           |
| `search`     | string          | —       | trimmed, case-insensitive partial match |
| `sort_order` | `asc` \| `desc` | `desc`  | —                                       |

`sort_by` is per endpoint, documented with that endpoint.

**Shape**

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

Drive "load more" from `pagination.has_next`, then request `page + 1`. Ordering is stable
across pages (a unique tiebreaker is always applied), so appending pages cannot duplicate or
drop a row.

---

## 4. Data shapes

### Agency

```json
{
  "id": "0198b0f2-1c3d-7a4b-9e10-2f5c6d7e8a90",
  "owner_id": "0198b0f1-0000-7000-8000-000000000001",
  "legal_name": "TRAVELSPEED HOLIDAYS PRIVATE LIMITED",
  "display_name": "TravelSpeed",
  "email": "hello@travelspeed.in",
  "phone": "+919876543210",
  "website_url": "https://travelspeed.in",
  "logo_key": "agencies/0198b0f2-.../branding/logo/0198b0f3-....png",
  "created_at": "2026-10-01T09:00:00.000Z",
  "updated_at": "2026-10-02T11:20:00.000Z",
  "deleted_at": null
}
```

| Field          | Type           | Notes                                                                                   |
| -------------- | -------------- | --------------------------------------------------------------------------------------- |
| `legal_name`   | string         | Uppercased by the server. Registered name.                                              |
| `display_name` | string         | What the UI shows.                                                                      |
| `email`        | string \| null | —                                                                                       |
| `phone`        | string \| null | Stored as sent, validated as a real number.                                             |
| `website_url`  | string \| null | Must be a full URL with scheme.                                                         |
| `logo_key`     | string \| null | **Object key, not a URL.** See [storage-api.md](./storage-api.md). `null` when no logo. |
| `deleted_at`   | string \| null | Always `null` on data you receive.                                                      |

### AgencyLocation

```json
{
  "id": "0198b0f4-2d4e-8b5c-af21-3a6b7c8d9e01",
  "agency_id": "0198b0f2-1c3d-7a4b-9e10-2f5c6d7e8a90",
  "name": "MUMBAI HEAD OFFICE",
  "code": "BOM",
  "address_line1": "12 MUMBAI SUBURBAN",
  "address_line2": "ANDHERI EAST",
  "city": "Mumbai",
  "state_code": "MH",
  "postal_code": "400059",
  "country_code": "IN",
  "currency": "INR",
  "created_at": "2026-10-01T09:10:00.000Z",
  "updated_at": null,
  "deleted_at": null
}
```

| Field          | Type   | Notes                                                            |
| -------------- | ------ | ---------------------------------------------------------------- |
| `name`         | string | Uppercased by the server.                                        |
| `code`         | string | Uppercase, **unique within the agency**, used as a short handle. |
| `country_code` | string | Exactly 2 chars, ISO country.                                    |
| `currency`     | string | Exactly 3 chars, ISO currency. Defaults to `INR`.                |

`GET /agency/me/locations/:id` returns this shape **plus** a nested parent:

```json
{
  "...location fields": "...",
  "agency": { "id": "...", "display_name": "TravelSpeed" }
}
```

The list endpoint does **not** include `agency`. Write your types to tolerate the optional
field, or normalise it away in the api client.

---

## 5. Agency API

Base path `/agency`. Every route needs the bearer token.

### 5.1 Create agency

```
POST /agency
```

A user may own only one agency, so this is called once. It is the **first step of
onboarding** — the full sequence lives in
[onboarding-api.md](./onboarding-api.md).

A `409 AGENCY_ALREADY_EXISTS` is not an error state: the user resumed the wizard or already
finished it. Fetch the agency with [§5.2](#52-get-my-agency) and continue from
`GET /onboarding/status` rather than showing a failure screen.

**Body**

| Field          | Type   | Required | Rules                                                                      |
| -------------- | ------ | -------- | -------------------------------------------------------------------------- |
| `legal_name`   | string | yes      | non-empty after trim, uppercased by the server                             |
| `display_name` | string | yes      | non-empty after trim                                                       |
| `email`        | string | yes      | valid email                                                                |
| `phone`        | string | yes      | valid phone number, **include the country code**, e.g. `+919876543210`     |
| `website_url`  | string | no       | full URL with scheme                                                       |
| `logo_key`     | string | no       | object key from a confirmed upload, see [storage-api.md](./storage-api.md) |

```json
{
  "legal_name": "TravelSpeed Holidays Private Limited",
  "display_name": "TravelSpeed",
  "email": "hello@travelspeed.in",
  "phone": "+919876543210",
  "website_url": "https://travelspeed.in"
}
```

**Response** — `201`, `data` is the created [Agency](#agency).

```json
{
  "success": true,
  "message": "Agency created successfully",
  "data": { "id": "0198b0f2-...", "logo_key": null, "...": "..." },
  "meta": { "timestamp": "2026-10-04T05:30:50.123Z", "request_id": "req-1" }
}
```

**Errors**

| Status | `error.code`            | Cause                           |
| ------ | ----------------------- | ------------------------------- |
| 400    | `VALIDATION_ERROR`      | bad field, see `error.details`  |
| 401    | `UNAUTHORIZED`          | missing/expired token           |
| 409    | `AGENCY_ALREADY_EXISTS` | the user already owns an agency |

### 5.2 Get my agency

```
GET /agency/me
```

**Response** — `200`, `data` is the [Agency](#agency).

**Errors**

| Status | `error.code`       | Cause                      |
| ------ | ------------------ | -------------------------- |
| 401    | `UNAUTHORIZED`     | missing/expired token      |
| 404    | `AGENCY_NOT_FOUND` | the user has no agency yet |

### 5.3 Update my agency

```
PATCH /agency/me
```

Every field is optional but **at least one must be sent**, otherwise
`400 VALIDATION_ERROR` with field `body`. Send only the fields that changed.

```json
{ "display_name": "TravelSpeed Holidays", "phone": "+919876543211" }
```

**Response** — `200`, `data` is the updated [Agency](#agency).

**Errors** — `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 AGENCY_NOT_FOUND`.

> **Clearing an optional field:** send `null` and you will get a validation error — the
> update schema only accepts strings. There is currently no way to unset `website_url` or
> `logo_key` through this endpoint. Removing a logo means deleting the object
> ([storage-api.md](./storage-api.md#34-delete-a-file)) and leaving `logo_key` as is.

### 5.4 Agency errors

| Status | `error.code`            | `message`                              |
| ------ | ----------------------- | -------------------------------------- |
| 400    | `VALIDATION_ERROR`      | Validation failed                      |
| 401    | `UNAUTHORIZED`          | Missing or invalid Bearer token        |
| 404    | `AGENCY_NOT_FOUND`      | Agency not found                       |
| 409    | `AGENCY_ALREADY_EXISTS` | An agency already exists for this user |

---

## 6. Agency locations API

Base path `/agency/me/locations`. Every route needs the bearer token and an existing
agency — otherwise `404 AGENCY_NOT_FOUND`.

Locations are **soft deleted**: `DELETE` sets `deleted_at`, the row then disappears from
`GET /agency/me/locations` and every `GET/PATCH/DELETE /:id` returns
`404 AGENCY_LOCATION_NOT_FOUND`. There is no restore endpoint.

### 6.1 Create location

```
POST /agency/me/locations
```

**Body**

| Field           | Type   | Required | Rules                                                            |
| --------------- | ------ | -------- | ---------------------------------------------------------------- |
| `name`          | string | yes      | non-empty, uppercased by the server                              |
| `code`          | string | yes      | 2–10 chars, uppercased, only `A-Z 0-9 - _`, unique in the agency |
| `address_line1` | string | no       | uppercased                                                       |
| `address_line2` | string | no       | uppercased                                                       |
| `city`          | string | no       | —                                                                |
| `state_code`    | string | no       | uppercased                                                       |
| `postal_code`   | string | no       | —                                                                |
| `country_code`  | string | yes      | exactly 2 chars, e.g. `IN`                                       |
| `currency`      | string | no       | exactly 3 chars, defaults to `INR`                               |

```json
{
  "name": "Mumbai Head Office",
  "code": "BOM",
  "address_line1": "12 Mumbai Suburban",
  "city": "Mumbai",
  "state_code": "MH",
  "postal_code": "400059",
  "country_code": "IN",
  "currency": "INR"
}
```

**Response** — `201`, `data` is the created [AgencyLocation](#agencylocation).

**Errors**

| Status | `error.code`                  | Cause                                     |
| ------ | ----------------------------- | ----------------------------------------- |
| 400    | `VALIDATION_ERROR`            | bad field                                 |
| 401    | `UNAUTHORIZED`                | missing/expired token                     |
| 404    | `AGENCY_NOT_FOUND`            | the user has no agency                    |
| 409    | `AGENCY_LOCATION_CODE_EXISTS` | another location already uses this `code` |

### 6.2 List locations

```
GET /agency/me/locations
```

**Query** — the standard [pagination](#3-pagination) params plus:

| Param     | Type | Default      | Values                               |
| --------- | ---- | ------------ | ------------------------------------ |
| `sort_by` | enum | `created_at` | `created_at`, `name`, `code`, `city` |

`search` matches against `name`, `code` and `city`, case-insensitively.

```
GET /agency/me/locations?page=1&limit=20&search=mum&sort_by=name&sort_order=asc
```

**Response** — `200`, `data` is `{ items, pagination }`. `items` holds
[AgencyLocation](#agencylocation) rows **without** the nested `agency` object.

```json
{
  "success": true,
  "message": "Agency locations fetched successfully",
  "data": {
    "items": [
      {
        "id": "0198b0f4-...",
        "name": "MUMBAI HEAD OFFICE",
        "code": "BOM",
        "city": "Mumbai",
        "country_code": "IN",
        "currency": "INR",
        "created_at": "2026-10-01T09:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "meta": { "timestamp": "2026-10-04T05:30:50.123Z", "request_id": "req-2" }
}
```

**Errors** — `401 UNAUTHORIZED`, `404 AGENCY_NOT_FOUND`, `400 VALIDATION_ERROR`.

### 6.3 Get one location

```
GET /agency/me/locations/:id
```

`:id` must be a UUID. A location belonging to another agency is indistinguishable from a
missing one — both are `404 AGENCY_LOCATION_NOT_FOUND`.

**Response** — `200`, `data` is the [AgencyLocation](#agencylocation) **with** the nested
`agency: { id, display_name }`.

**Errors**

| Status | `error.code`                | Cause                            |
| ------ | --------------------------- | -------------------------------- |
| 400    | `VALIDATION_ERROR`          | `:id` is not a UUID              |
| 401    | `UNAUTHORIZED`              | missing/expired token            |
| 404    | `AGENCY_NOT_FOUND`          | the user has no agency           |
| 404    | `AGENCY_LOCATION_NOT_FOUND` | no such location for this agency |

### 6.4 Update location

```
PATCH /agency/me/locations/:id
```

Same body as create, all fields optional, **at least one required**. `code` is unique-checked
again when it changes. `currency` is not defaulted here — omit it to keep the current value.

```json
{ "city": "Mumbai", "postal_code": "400050" }
```

**Response** — `200`, `data` is the updated [AgencyLocation](#agencylocation) (no nested
`agency`).

**Errors** — `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 AGENCY_NOT_FOUND`,
`404 AGENCY_LOCATION_NOT_FOUND`, `409 AGENCY_LOCATION_CODE_EXISTS`.

### 6.5 Delete location

```
DELETE /agency/me/locations/:id
```

**Response** — `200`, `data` is the location row as it now stands, with `deleted_at` set.
Nothing is removed from the database.

```json
{
  "success": true,
  "message": "Agency location deleted successfully",
  "data": { "id": "0198b0f4-...", "deleted_at": "2026-10-04T05:35:00.000Z" },
  "meta": { "timestamp": "2026-10-04T05:35:00.000Z", "request_id": "req-5" }
}
```

**Errors** — `401 UNAUTHORIZED`, `404 AGENCY_NOT_FOUND`,
`404 AGENCY_LOCATION_NOT_FOUND`.

### 6.6 Location errors

| Status | `error.code`                  | `message`                                               |
| ------ | ----------------------------- | ------------------------------------------------------- |
| 400    | `VALIDATION_ERROR`            | Validation failed                                       |
| 401    | `UNAUTHORIZED`                | Missing or invalid Bearer token                         |
| 404    | `AGENCY_NOT_FOUND`            | Agency not found                                        |
| 404    | `AGENCY_LOCATION_NOT_FOUND`   | Agency location not found                               |
| 409    | `AGENCY_LOCATION_CODE_EXISTS` | A location with this code already exists for the agency |

---

## 7. Frontend integration notes

**Ordering.** Create the agency before anything that hangs off it — storage included,
every `/storage` route answers `404 AGENCY_NOT_FOUND` without one. A `404 AGENCY_NOT_FOUND`
on any endpoint below means the user has not finished agency setup yet.

**Onboarding.** Agency creation is step one of the setup wizard. Afterwards the client
drives the flow off `GET /onboarding/status`, see
[onboarding-api.md](./onboarding-api.md).

**Suggested api-client surface.**

```ts
agencyApi = {
  create: (body) => post("/agency", body), // 201
  me: () => get("/agency/me"),
  update: (body) => patch("/agency/me", body),
  listLocations: (query) => get("/agency/me/locations", { query }),
  createLocation: (body) => post("/agency/me/locations", body), // 201
  getLocation: (id) => get(`/agency/me/locations/${id}`),
  updateLocation: (id, body) => patch(`/agency/me/locations/${id}`, body),
  deleteLocation: (id) => del(`/agency/me/locations/${id}`),
};
```

