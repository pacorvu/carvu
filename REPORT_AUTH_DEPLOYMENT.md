
# Authentication & Deployment Report

## 1. Issue Summary & Fixes

### A. Build Failure (Render)
- **Issue**: `sh: 1: vite: not found` during deployment.
- **Cause**: `vite` was listed in `devDependencies` in `frontend/package.json`. Production builds on Render often skip installing dev dependencies to save time/space.
- **Fix**: Moved `vite` and `@vitejs/plugin-react` to `dependencies`. This ensures they are always installed for the build process.

### B. Production Start Failure
- **Issue**: Potential failure if `nodemon` is not installed in production.
- **Fix**: Updated `backend/package.json` start script from `nodemon server.js` to `node server.js`. Added `npm run dev` for local development using nodemon.

### C. Refresh Token Error
- **Issue**: `FOR UPDATE cannot be applied to the nullable side of an outer join` in production logs.
- **Cause**: The PostgreSQL query for refreshing tokens locked all joined rows, including those from a `LEFT JOIN` (nullable).
- **Fix**: Updated the query in `authController.js` to use `FOR UPDATE OF art`. This explicitly tells Postgres to only lock the `auth_refresh_tokens` table rows, resolving the error.

### D. Unauthorized / Token Issues
- **Issue**: Users getting logged out on refresh; "User=undefined" in logs.
- **Cause**: 
    1. The refresh token SQL error prevented token rotation, causing the refresh to fail.
    2. Secure cookies might have been rejected if `trust proxy` wasn't set (fixed in `server.js`).
- **Fix**: The SQL fix combined with `app.set('trust proxy', 1)` ensures the refresh flow works reliably.

---

## 2. End-to-End Authentication Flow

### A. Storage Strategy
- **Access Token (Short-lived)**:
    - **Storage**: **In-Memory Variable** (JavaScript closure in `tokenService.js`).
    - **Security**: NOT stored in `localStorage` or `sessionStorage` (preventing XSS attacks from easily stealing it).
    - **Lifespan**: 15 minutes.
- **Refresh Token (Long-lived)**:
    - **Storage**: **HTTP-Only, Secure Cookie**.
    - **Security**: Inaccessible to JavaScript (prevents XSS theft). sent automatically by the browser to the `/auth` endpoints.
    - **Lifespan**: 30 days (sliding window).

### B. Login Flow
1. **User** submits email/password to `/auth/login`.
2. **Server** validates credentials.
3. **Server** generates:
    - `accessToken`: JWT signed with secret.
    - `refreshToken`: Random hash stored in DB.
4. **Response**:
    - JSON Body: `{ "access": "..." }` -> Client saves to memory.
    - Cookie: `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax`.

### C. Authenticated Request Flow
1. **Client** (Frontend) calls an API (e.g., `/student/profile`).
2. **Interceptor** adds header: `Authorization: Bearer <accessToken>`.
3. **Server** validates JWT.
    - If valid: Request proceeds.
    - If expired: Returns `401 Unauthorized`.

### D. Token Refresh Flow (Automatic)
1. **Client** receives `401`.
2. **Client** (Axios interceptor) pauses requests and calls `POST /auth/refresh`.
3. **Browser** automatically sends the `refresh_token` cookie.
4. **Server**:
    - Verifies cookie hash against DB.
    - Checks if revoked or expired.
    - **Token Rotation**: Revokes the used refresh token and issues a NEW one.
5. **Server Response**:
    - New `accessToken` in body.
    - New `refresh_token` in cookie.
6. **Client**:
    - Updates memory with new `accessToken`.
    - Retries the original failed request.

### E. Logout
1. **Client** calls `/auth/logout`.
2. **Server** revokes the refresh token in DB.
3. **Server** clears the cookie.
4. **Client** clears the in-memory access token.

---

## 3. Next Steps
1. **Deploy**: Push the changes (especially `package.json` updates).
2. **Verify**: Once deployed, the build should pass, and the refresh flow should work without SQL errors.