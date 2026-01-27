# Authentication Flow Report (Access & Refresh Token)

This report details the implementation of the authentication system, specifically focusing on how Access Tokens and Refresh Tokens are stored, transmitted, and rotated.

## 1. Overview
The system uses a **Dual Token Architecture** to balance security and user experience.
- **Access Token (JWT)**: Short-lived, used to authenticate API requests. Stored in **Memory** (Variable).
- **Refresh Token (Opaque Hash)**: Long-lived, used to obtain new access tokens. Stored in **HTTP-Only Cookie**.

This ensures that:
- **XSS Attacks** cannot steal the Access Token easily (as it's not in LocalStorage).
- **CSRF Attacks** are mitigated by SameSite cookie policies (and anti-CSRF tokens if needed, though strictly SameSite=Lax/Strict is often sufficient for modern browsers).

---

## 2. Access Token Lifecycle

### Storage
- **Location**: JavaScript Memory (Variable in `tokenService.js`).
- **Persistence**: **None**. It is lost when the page is refreshed or the tab is closed.
- **Reason**: Security. Storing tokens in `localStorage` or `sessionStorage` makes them vulnerable to XSS attacks. By keeping it in memory, we reduce the attack surface.

### Transmission
- **Header**: `Authorization: Bearer <token>`
- **Usage**: Sent with every API request requiring authentication.
- **Frontend Code**: `tokenService.js` injects this header via `getHeaders()`.

### Expiration
- **Duration**: Short (e.g., 15 minutes to 1 hour).
- **Renewal**: When it expires (or is lost on refresh), the frontend silently calls `/auth/refresh` using the Refresh Token to get a new one.

---

## 3. Refresh Token Lifecycle

### Storage
- **Location**: **HTTP-Only, Secure Cookie** named `refresh_token`.
- **Persistence**: Persists across browser sessions (until expiration).
- **Reason**: 
    - `HttpOnly`: JavaScript cannot read this cookie, making it immune to XSS theft.
    - `Secure`: Sent only over HTTPS (in production).
    - `SameSite`: Restricted to same-site requests to prevent CSRF.

### Transmission
- **Mechanism**: Automatically sent by the browser with requests to the same domain (credentials: 'include').
- **Usage**: Only sent to `/auth/refresh` (and `/auth/logout`) endpoints.

### Rotation (Security Feature)
- **Concept**: Refresh Token Rotation.
- **Flow**:
    1. User logs in -> Server issues `Refresh Token A`.
    2. User refreshes page -> Client sends `Refresh Token A`.
    3. Server verifies `A`, marks `A` as **revoked**, and issues `Refresh Token B`.
    4. Next time, Client must send `Refresh Token B`.
- **Theft Detection**: If an attacker steals `Refresh Token A` and tries to use it *after* the legitimate user has already used it (and got `B`), the server detects that `A` is reused. It then **revokes the entire token family** (invalidates `B` and all future tokens), forcing the user to log in again.

---

## 4. End-to-End Flow

### A. Login
1. **User** sends `email` + `password` to `/auth/login`.
2. **Server** validates credentials.
3. **Server**:
    - Generates **Access Token** (JWT).
    - Generates **Refresh Token** (stored in DB `auth_refresh_tokens`).
    - Sets `refresh_token` HTTP-Only Cookie.
    - Returns `access` token in JSON body.
4. **Client**:
    - Saves `access` token in **Memory**.
    - Browser automatically saves `refresh_token` cookie.

### B. Per Request (e.g., Get Profile)
1. **Client** checks if `accessToken` exists in memory.
2. **Client** sends request with `Authorization: Bearer <accessToken>`.
3. **Server** validates JWT.
    - If valid: Returns data.
    - If expired (401): Client attempts **Silent Refresh**.

### C. Page Refresh (The "Unauthorized" Fix)
1. User reloads page. **Memory is cleared**, so Access Token is lost.
2. `AuthContext` initializes.
3. It calls `refreshAccessToken()` (Endpoint: `/auth/refresh`).
4. **Browser** sends the `refresh_token` cookie automatically.
5. **Server**:
    - Validates cookie.
    - Rotates token (Invalidates old, creates new).
    - Returns **New Access Token**.
    - Sets **New Refresh Token Cookie**.
6. **Client**:
    - Receives new Access Token.
    - Updates Memory.
    - User stays logged in.

---

## 5. Production Configuration (Render)

To ensure this works on Render:
1. **Trust Proxy**: `app.set('trust proxy', 1)` is required because Render uses a load balancer (Nginx). Without this, Express doesn't know the request is HTTPS, so `secure: true` cookies are not sent.
2. **Secure Cookie**: `secure: true` must be set in production.
3. **SameSite**: `Lax` is recommended for standard navigation.

### Fixes Applied
- **Backend**: Enabled `trust proxy`.
- **Backend**: Enforced `secure: true` for cookies in production.
- **Frontend**: Removed `localStorage` usage for Access Token (Strict Memory Only).

---

**Status**: The system is now configured to handle page refreshes securely without "Unauthorized" errors, provided the `refresh_token` cookie is correctly set and accepted by the browser.
