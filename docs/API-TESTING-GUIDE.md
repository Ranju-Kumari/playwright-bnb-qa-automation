# API Tests & API Setup — Interview Guide

> Playwright + TypeScript framework for **automationintesting.online** (Shady Meadows B&B).
> API layer added on top of an existing UI framework (POM + fixtures).

---

## 1. The idea in one line

**Use the API for what the user doesn't see (login, test data, verification, clean-up) and the UI only for what the user does see.**
This makes tests faster, more stable, and independent of each other.

---

## 2. Build order (what to create first, and why)

| # | Step | File | Why this order |
|---|------|------|----------------|
| 0 | **Explore the API** | *(curl / DevTools Network tab)* | Know endpoints, auth type (cookie `token`), status codes, error formats *before* coding. |
| 1 | **API client** | `src/api/BookerApi.ts` | Everything else depends on it. One place for all endpoints. |
| 2 | **Auth setup** | `tests/setup/auth.setup.ts` + `src/config/paths.ts` | Log in **once** via API, save cookie to `playwright/.auth/admin.json`. |
| 3 | **Config projects** | `playwright.config.ts` | `setup` runs first → `api` and `chromium` depend on it. |
| 4 | **Fixtures** | `src/fixtures/fixtures.ts` | Expose `api`, `adminApi`, `cleanup` to tests by name. |
| 5 | **Test data** | `src/data/testData.ts` | `createBookingRequest()` — unique data, random future dates. |
| 6 | **API tests** | `tests/api/*.api.spec.ts` | Auth, rooms, booking, messages: positive + negative. |
| 7 | **Use API in UI tests** | `tests/ui/*.spec.ts` | Seed data, verify the back end, clean up. |

---

## 3. Key flows

### Flow A — Auth setup (log in once, reuse everywhere)
```
setup project ──POST /api/auth/login──> token
       └── addCookies({ name: 'token' }) → storageState → admin.json
                          ├── api tests:  adminApi fixture loads admin.json
                          └── UI tests:   test.use({ storageState: admin.json })
```
- **Why:** UI login takes ~3s per test; API login takes ~0.3s, once per run.
- Login **form** tests still start logged out, because the form is what they test.

### Flow B — Pure API test
```ts
const response = await api.createBooking(createBookingRequest(2));
expect(response.status()).toBe(201);
expect(await response.json()).toMatchObject({ roomid: 2, bookingid: expect.any(Number) });
```
Check: **status code → response body → side effect** (admin can see it).

### Flow C — API setup + UI check (hybrid)
```
Arrange (API)  → api.sendMessage(msg)
Act     (UI)   → open /admin/message as logged-in admin
Assert  (UI)   → row with msg.subject is visible
Clean   (API)  → adminApi.deleteMessage(id)
```

### Flow D — UI action + API check
The contact form only says "Thanks". **The API proves the message was actually saved.**
In the reservation test, `page.waitForResponse('/api/booking')` captures the `bookingid` so the test can delete it afterwards.

---

## 4. Important design decisions (interview talking points)

| Decision | Reason |
|----------|--------|
| API client returns **raw `APIResponse`** | Tests can check error codes (401, 409, 400), not just success. |
| **Two clients:** `api` (visitor) vs `adminApi` (logged in) | Same class, different request context. Makes auth testing explicit. |
| `adminApi` builds its own `request.newContext({ storageState })` and **disposes** it | No leaked connections. Auth is isolated from the default `request`. |
| **`cleanup` fixture** (runs newest first, best effort) | Clean-up failure is noted (`testInfo.annotations`) but **doesn't fail the test**; clean-up isn't what's being tested. |
| **Unique data + random future dates** | Shared demo site: fixed data causes 409 conflicts and parallel-run collisions. |
| Credentials from **`.env` / CI secrets** | Never hard-coded. Read lazily, so a missing value fails with a clear message. |
| Folders: `tests/api`, `tests/ui`, `tests/setup` | Run layers separately: `npm run test:api` (~2s) vs `npm run test:e2e`. |

---

## 5. What API tests cover

| Area | Positive | Negative |
|------|----------|----------|
| **Auth** | Login → token → validate | Wrong password `401`, bad token `403`, admin endpoint without login `401` |
| **Rooms** | Response shape (`toMatchObject`), room types | — |
| **Booking** | Create `201` + visible to admin | Double booking `409`, missing name `400`, checkout before check-in |
| **Message** | Send `200` + in admin inbox | Invalid email `400`, empty body `400` with all field errors |

**Rule:** for each endpoint, test the happy path, validation, auth, and business rules.

---

## 6. Existing code that had to change

| File | Change |
|------|--------|
| `playwright.config.ts` | One project → `setup` + `api` + `chromium` with `dependencies` |
| Test folder | `tests/*.spec.ts` → `tests/ui/`; imports `../src` → `../../src` |
| `fixtures.ts` | Added `api`, `adminApi`, `cleanup`, `adminMessagesPage` |
| `testData.ts` | Added `createBookingRequest()` |
| `contact.spec.ts` / `reservation.spec.ts` | Added API check + clean-up |
| `package.json` | Added `test:api`, `test:e2e` |
| **Unchanged** | Page objects, `.env`, CI workflow (new projects run automatically) |

---

## 7. Bugs found through the API

1. `GET/DELETE /api/{booking|message|room}/{id}` → **500** (breaks the room page and clean-up).
2. **Security:** `GET /api/message` exposes visitor names and subjects **without auth**.
3. Inconsistent error formats: `{"errors":[...]}` vs a bare `[...]`; invalid dates return `409` instead of `400`.

---

## 8. Likely interview questions — short answers

- **Why API setup instead of UI login?** It's faster, it's less flaky, and a login-page bug only breaks the login tests.
- **How do you share auth?** A `setup` project + `storageState` + project `dependencies`.
- **API test vs UI test?** API: business rules and validation, fast. UI: user journeys, wiring between front end and API.
- **How do you handle test data?** Factories with unique values, then delete through the API in a fixture teardown.
- **How do you avoid flaky shared-environment tests?** Unique data, random dates, no dependence on existing records, clean-up.
- **Where do assertions live?** In tests, never in page objects or the API client.
- **How do you run only the API tests in CI?** `npx playwright test --project=api`.

---

## 9. Commands

```bash
npm test               # everything (setup → api + ui)
npm run test:api       # API only
npm run test:e2e       # UI only
npm run typecheck      # TypeScript check
npm run report         # HTML report
```
