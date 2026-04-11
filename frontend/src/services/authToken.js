/**
 * getValidToken - Always returns a valid JWT access token.
 * If the access token is expired, it silently refreshes it using
 * the refresh token and stores both new tokens in localStorage.
 *
 * @returns {Promise<string|null>} A valid access token, or null if refresh failed (user must re-login).
 */
export async function getValidToken() {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
        console.error("[Auth] No refresh token found. User must log in again.");
        return null;
    }

    // Try using the access token first - if there's no token at all, refresh immediately
    if (!access) {
        return await refreshAccessToken(refresh);
    }

    // Decode the access token to check expiry (JWT payload is base64 encoded)
    try {
        const payload = JSON.parse(atob(access.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to ms
        const now = Date.now();
        const bufferMs = 60 * 1000; // Refresh 60 seconds BEFORE expiry

        if (now >= expiryTime - bufferMs) {
            console.log("[Auth] Access token expired or expiring soon, refreshing...");
            return await refreshAccessToken(refresh);
        }

        return access; // Token is still valid
    } catch (e) {
        // If we can't decode the token, it's malformed. Try to refresh anyway.
        console.warn("[Auth] Could not decode access token, attempting refresh:", e);
        return await refreshAccessToken(refresh);
    }
}

async function refreshAccessToken(refresh) {
    try {
        const res = await fetch("http://localhost:8000/api/accounts/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (!res.ok) {
            console.error("[Auth] Token refresh failed. User must log in again.");
            // Clear stale tokens
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            return null;
        }

        const data = await res.json();
        localStorage.setItem("access", data.access);
        // SimpleJWT may return a new refresh token (ROTATE_REFRESH_TOKENS setting)
        if (data.refresh) {
            localStorage.setItem("refresh", data.refresh);
        }
        console.log("[Auth] Token refreshed successfully.");
        return data.access;
    } catch (e) {
        console.error("[Auth] Network error during token refresh:", e);
        return null;
    }
}
