# Authentication Logic and Refresh Token Report

## Summary
You reported a `401 (Unauthorized)` error when the frontend attempts to refresh the access token via `POST /auth/refresh`. This report details the authentication logic, the specific API request being made, and the improvements implemented to diagnose and fix the issue.

## 1. Refresh Token Logic

The application uses a **Dual Token System**:
1.  **Access Token (JWT)**: Short-lived (e.g., 15 minutes). Stored in memory (and `localStorage` in `tokenService.js`). Used to authenticate API requests via the `Authorization: Bearer <token>` header.
2.  **Refresh Token**: Long-lived (e.g., 30 days). Stored in an **HttpOnly Cookie** (`refresh_token`). Used to obtain a new access token when the old one expires.

### The Refresh Flow
1.  **Frontend**: When the app loads or an API returns 401, `tokenService.js` calls `refreshAccessToken()`.
2.  **Request**: Sends a `POST` request to `http://localhost:5000/auth/refresh`.
    *   **Credentials**: `include` (This is crucial; it tells the browser to send the `refresh_token` cookie).
    *   **Headers**: `Content-Type: application/json`.
3.  **Backend**:
    *   Extracts the `refresh_token` from the **Cookies**.
    *   Hashes the token and searches for it in the `auth_refresh_tokens` database table.
    *   **Validation**: Checks if the token exists, is not revoked, and is not expired.
    *   **Rotation**: If valid, it **revokes the old refresh token** and **issues a new one** (Rotation).
    *   **Response**: Returns a new Access Token in the JSON body and sets a new `refresh_token` cookie.

## 2. API Call Details

Here is the exact request being sent by your frontend (`tokenService.js`):

**Endpoint:** `POST /auth/refresh`
**URL:** `http://localhost:5000/auth/refresh` (assuming backend is on port 5000)

**Request Headers:**
- `Content-Type`: `application/json`
- `Cookie`: `refresh_token=...` (Sent automatically by browser if present)

**Request Body:**
- Empty (The backend does not read the body for refresh; it relies solely on the cookie).

**Response (Success):**
- **Status:** `200 OK`
- **Body:** `{ "access": "eyJhbGciOi..." }`
- **Set-Cookie:** `refresh_token=...; Path=/; HttpOnly; SameSite=Lax`

**Response (Failure - 401):**
- **Status:** `401 Unauthorized`
- **Body:** `{ "error": "no refresh cookie" }` OR `{ "error": "invalid or expired refresh token" }`

## 3. Diagnosis of the 401 Error

The `401` error means the backend **rejected the refresh attempt**. This happens for one of two reasons:

1.  **Missing Cookie**: The browser did not send the `refresh_token` cookie.
    *   *Cause:* User was never logged in, or manually cleared cookies, or `SameSite`/`Secure` cookie attribute mismatch (e.g., running on HTTP but cookie requires Secure).
    *   *Current Config:* The backend is configured to use `SameSite: Lax` and `Secure: false` (in development), which is correct for `localhost`.
2.  **Invalid Token**: The cookie was sent, but the database rejected it.
    *   *Cause:* The database was reset (seeded) but the browser still holds an old cookie. The token hash in the cookie no longer matches any record in `auth_refresh_tokens`.

## 4. Work Done & Fixes

I have analyzed the `backend/controllers/authController.js` and applied the following fixes to help resolve and debug the issue:

### 1. Enhanced Error Logging
I modified the `refresh` function in `authController.js` to provide specific logs and error messages. Instead of a generic `401`, you will now see:

*   **Console Warning:** `[Auth] Refresh failed: No refresh_token cookie present in request`
    *   *Response:* `{ "error": "no refresh cookie" }`
    *   *Meaning:* The browser didn't send the cookie. You need to log in again.

*   **Console Warning:** `[Auth] Refresh failed: Token not found, revoked, or expired in DB`
    *   *Response:* `{ "error": "invalid or expired refresh token" }`
    *   *Meaning:* Your cookie is stale (old database). You need to log in again.

### 2. Verification of Frontend Code
checked `frontend/src/services/tokenService.js`. It correctly uses `credentials: 'include'`, which is required for the cookie to be sent.

### 3. Recommendation
If you are seeing this error in your development console:
1.  **Clear your browser cookies** for `localhost`.
2.  **Log in again**. This will set a fresh, valid cookie.
3.  The 401 error should disappear for subsequent refreshes.

The code logic is sound. The 401 is likely due to a state mismatch between your browser (old cookie) and the server (restarted/different DB), which is common in development. The new logging will confirm this.
