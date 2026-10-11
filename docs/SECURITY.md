# Security Notes

This guide describes current security-related behavior and required precautions. It is not a security audit.

## Current mechanisms

- Spring Security protects backend routes.
- A JWT authentication filter processes bearer tokens.
- Access-token and refresh-token lifetimes are configurable.
- Admin controllers use role checks. Some admin endpoints enforce access both in central security rules and method annotations.
- Request validation is provided by Spring Boot Validation where DTOs declare constraints.
- The frontend clears locally stored tokens during logout and can attempt a refresh after an eligible `401` response.

## Required deployment controls

### Secrets
- Keep `JWT_SECRET`, `DB_PASSWORD`, `GOOGLE_CLIENT_SECRET`, and any admin seed password outside source control.
- Generate a long, random JWT signing secret. Rotate it under a planned process.
- Never place server secrets in frontend `VITE_*` variables.
- Do not publish real access tokens, refresh tokens, database dumps, or personal data in issues or logs.

### Authentication and authorization
- Enforce authentication and role checks on the backend, not only in React.
- Check object ownership before allowing a user to edit or delete a report.
- Derive the caller's identity from the authenticated principal. Do not trust a client-supplied `claimantId` or other identity field.
- Confirm that refresh tokens expire, can be revoked, and cannot be used after logout.
- Protect admin bootstrap credentials. Do not enable predictable default passwords.

### Browser and transport
- Use HTTPS in deployed environments.
- Restrict CORS to exact trusted origins.
- Browser local storage is readable by JavaScript. A cross-site scripting vulnerability can expose stored tokens. Consider secure, HttpOnly, SameSite cookies or another reviewed token-storage design.
- Add suitable Content Security Policy and other browser security headers at the deployment layer.

### Database
- Use a dedicated database account with only the privileges the app needs.
- Back up data before schema changes.
- Replace Hibernate `ddl-auto=update` with versioned migrations before production deployment.
- Do not expose MySQL directly to the public internet.

### Input and file handling
- Validate all request data on the server.
- Use parameterized database access through JPA/repositories.
- For spreadsheet uploads, limit file size and row count, validate each row, and reject unexpected content.
- Limit export access to authorized administrators. Avoid exporting fields that are not needed.

### Operations
- Keep Java, Spring Boot, Node.js, npm dependencies, and MySQL patched.
- Do not return stack traces or internal configuration in public API errors.
- Keep logs useful but avoid logging passwords, tokens, proof documents, or unnecessary personal data.
- Use separate secrets and databases for development, testing, and production.

## Security review checklist

- [ ] JWT secret is strong and not committed.
- [ ] Database and Google OAuth credentials are stored outside source control.
- [ ] No admin account uses a known or shared password.
- [ ] Admin API requests fail for non-admin users.
- [ ] Users cannot edit or delete other users' records.
- [ ] Refresh-token rotation, expiry, and revocation are tested.
- [ ] CORS allows only intended origins.
- [ ] HTTPS is enabled in production.
- [ ] Uploads and exports have size and authorization checks.
- [ ] Production schema changes use migrations.
- [ ] Logs and error responses do not disclose secrets or personal data.

Report suspected vulnerabilities privately to the project maintainer. Do not include exploitable details or real user data in public issues.
