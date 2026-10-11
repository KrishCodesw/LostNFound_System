# API Reference

Base URL for local development: `http://localhost:8080/api`.

This document gives a route-group overview based on the repository's controllers and frontend API client. The controller source is the final reference for exact methods, request schemas, response schemas, and authorization rules. Update this document when a controller changes.

## Authentication

Base path: `/auth`

| Operation | Method and path | Access |
|---|---|---|
| Register | `POST /auth/register` | Public |
| Login | `POST /auth/login` | Public |
| Refresh access token | `POST /auth/refresh` | Refresh token required |
| Logout / revoke refresh token | `POST /auth/logout` | Refresh token required |
| Get Google sign-in URL | `GET /auth/google/url` | Public |
| Complete Google callback | `POST /auth/google/callback` | Public |

The frontend client sends the refresh token in a JSON body for refresh and logout. Confirm the DTOs and controller code before relying on exact response field names.

## Items

Base path: `/items`

| Operation | Method and path | Access |
|---|---|---|
| List reports | `GET /items` | Confirm current security rules |
| Read one report | `GET /items/{id}` | Confirm current security rules |
| Create a report | `POST /items` | Authenticated user |
| Update a report | `PUT /items/{id}` | Authenticated user; ownership rules apply |
| Delete a report | `DELETE /items/{id}` | Authenticated user or admin, as enforced by backend |

Frontend request types use `LOST` or `FOUND` for the item type. Use category IDs and field names from `ItemRequest` and the current report form.

## Categories

| Operation | Method and path | Access |
|---|---|---|
| List categories | `GET /categories` | Confirm current security rules |

## Claims

Base path: `/claims`

| Operation | Method and path | Access |
|---|---|---|
| Submit a claim | `POST /claims` | Authenticated user |
| List all claims | `GET /claims` | Admin in the current frontend workflow |
| List current user's claims | `GET /claims/my` | Authenticated user |
| Change claim status | `PUT /claims/{id}/status` | Admin |

Claim statuses displayed by the frontend include `PENDING`, `APPROVED`, and `REJECTED`. The backend must enforce valid state changes and ownership.

## Users and administration

| Resource | Base path | Purpose |
|---|---|---|
| User endpoints | `/users` | User-related operations |
| Admin user management | `/admin/users` | Admin-only user management |
| Admin inventory | `/admin/inventory` | Admin-only stock records and bulk operations |
| Admin export | `/admin/export` | Admin-only data export |

The admin UI also contains dashboard, item, claim, inventory, and user pages. Use the controller classes to confirm each individual admin endpoint before writing integration code.

## Request conventions

- Send JSON with `Content-Type: application/json` for JSON request bodies.
- Send `Authorization: Bearer <access-token>` for protected requests.
- Use the backend DTO classes as the source for request field names and validation rules.
- Do not send a caller's user ID as proof of identity. The backend should derive identity from the authenticated principal.
- Treat error status codes and response bodies as part of the API contract.

## Error handling

The frontend wrapper throws an error using the response's `message` field when available. Otherwise, it uses `HTTP <status>`. The backend has centralized exception handling. Check the actual response body in browser developer tools or backend tests when diagnosing a failure.

## Maintaining this reference

When you change an endpoint:
1. Update the relevant controller and DTO tests.
2. Update this table with the exact HTTP method and path.
3. Document authentication and role requirements.
4. Include a request and response example from a verified test.
5. Do not add secrets, real user data, or production tokens to examples.
