/**
 * Авторизация администратора (mock; позже — отдельный API /auth/admin/login).
 */
(function (global) {
    const STORAGE_KEY = "rv_admin_session_v1";
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    function normalizeEmail(email) {
        return String(email || "").trim().toLowerCase();
    }

    function readSession() {
        try {
            const raw =
                localStorage.getItem(STORAGE_KEY) ||
                sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const s = JSON.parse(raw);
            return s && s.role === "admin" ? s : null;
        } catch {
            return null;
        }
    }

    function writeSession(remember) {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        const store = remember ? localStorage : sessionStorage;
        store.setItem(
            STORAGE_KEY,
            JSON.stringify({
                role: "admin",
                email: ADMIN_EMAIL,
                remember: Boolean(remember),
                createdAt: new Date().toISOString(),
            })
        );
    }

    function clearSession() {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
    }

    global.AdminAuth = {
        ADMIN_URL: "./admin.html",

        isAdminCredentials(email, password) {
            return (
                normalizeEmail(email) === ADMIN_EMAIL &&
                String(password || "") === ADMIN_PASSWORD
            );
        },

        login({ remember }) {
            writeSession(remember);
        },

        logout() {
            clearSession();
        },

        isLoggedIn() {
            return Boolean(readSession());
        },

        goToAdmin() {
            global.location.href = AdminAuth.ADMIN_URL;
        },

        requireAdmin() {
            if (!AdminAuth.isLoggedIn()) {
                global.location.href = "./index.html?auth=login";
                return false;
            }
            return true;
        },
    };
})(typeof window !== "undefined" ? window : globalThis);
