# Contributing

Thank you for helping improve Campus Lost & Found.

## Before you start

1. Check existing issues and pull requests.
2. For a large change, open an issue first to agree on the scope.
3. Keep changes focused. Avoid unrelated formatting or dependency changes.
4. Never commit secrets, database dumps, access tokens, or personal data.

## Development setup

Follow the root [README](../README.md) to configure MySQL, backend environment variables, and frontend dependencies.

Run backend tests:

```bash
cd backend
mvn test
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Change guidelines

### Backend
- Keep HTTP handling in controllers and business rules in services.
- Use DTOs for API input and output. Avoid exposing JPA entities directly unless the current API intentionally does so.
- Validate untrusted request data on the server.
- Enforce authorization in the backend for every protected operation.
- Use clear exceptions and stable HTTP status codes.
- Add tests for business rules, access checks, and error cases.

### Frontend
- Reuse the API client in `frontend/src/lib/api.js`.
- Keep loading, empty, success, and error states clear.
- Do not put secrets in frontend environment variables.
- Do not treat hidden navigation as authorization.
- Keep accessible labels and keyboard support for interactive controls.

### Database
- Document schema changes.
- Back up local data before destructive changes.
- For production-oriented schema changes, prefer versioned migrations over automatic schema updates.

## Pull request checklist

- [ ] The change solves one clear problem.
- [ ] Backend tests pass.
- [ ] Frontend production build passes.
- [ ] Manual test steps are listed.
- [ ] API documentation is updated if an endpoint changes.
- [ ] Security notes are updated if authentication or authorization changes.
- [ ] No secrets or personal data are included.
- [ ] The PR description states any known limitations.

## Commit messages

Use short, action-oriented messages, for example:

- `docs: expand setup and API guides`
- `fix: validate item ownership before update`
- `test: cover claim status transitions`

## Bug reports

Include:
- What you expected.
- What happened.
- Steps to reproduce.
- Relevant browser or backend error output with secrets and personal data removed.
- Your operating system and Java, Node.js, and MySQL versions when relevant.
