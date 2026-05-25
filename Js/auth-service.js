/**
 * Публичный сервис авторизации для UI и оформления заказа.
 */
(function (global) {
    if (!global.AuthApi) return;

    let cachedProfile = null;
    const listeners = new Set();

    function notify() {
        listeners.forEach((fn) => {
            try {
                fn();
            } catch (_) {}
        });
    }

    function formatAddress(addr) {
        if (!addr || typeof addr !== "object") return "—";
        const parts = [];
        if (addr.city) parts.push(addr.city);
        if (addr.street) parts.push(addr.street);
        if (addr.house) parts.push("д. " + addr.house);
        if (addr.apartment) parts.push("кв. " + addr.apartment);
        return parts.length ? parts.join(", ") : "—";
    }

    const AuthService = {
        ACCOUNT_URL: "./account.html",

        isLoggedIn() {
            return Boolean(AuthApi.getSession());
        },

        getSessionUser() {
            const s = AuthApi.getSession();
            if (!s) return null;
            return {
                id: s.userId,
                fullName: s.fullName,
                email: s.email,
            };
        },

        getProfile() {
            return cachedProfile;
        },

        async loadProfile() {
            if (!AuthService.isLoggedIn()) {
                cachedProfile = null;
                return null;
            }
            cachedProfile = await AuthApi.client.getProfile();
            notify();
            return cachedProfile;
        },

        async register({ fullName, email, password }) {
            const result = await AuthApi.client.register({ fullName, email, password });
            const loginResult = await AuthApi.client.login({
                email,
                password,
                remember: true,
            });
            cachedProfile = loginResult.profile;
            notify();
            return loginResult;
        },

        async login({ email, password, remember }) {
            const result = await AuthApi.client.login({ email, password, remember });
            cachedProfile = result.profile;
            notify();
            return result;
        },

        logout() {
            AuthApi.client.logout();
            cachedProfile = null;
            notify();
        },

        async updateProfile(patch) {
            cachedProfile = await AuthApi.client.updateProfile(patch);
            notify();
            return cachedProfile;
        },

        async saveDeliveryAddress(address) {
            return AuthService.updateProfile({ deliveryAddress: address });
        },

        async addOrder(order) {
            const entry = await AuthApi.client.addOrder(order);
            if (cachedProfile) {
                cachedProfile.orders = [entry, ...(cachedProfile.orders || [])];
                notify();
            }
            if (global.ShopOrders) {
                ShopOrders.append(entry, AuthService.getSessionUser());
            }
            return entry;
        },

        async addReview(review) {
            const entry = await AuthApi.client.addReview(review);
            if (cachedProfile) {
                cachedProfile.reviews = [entry, ...(cachedProfile.reviews || [])];
                notify();
            }
            return entry;
        },

        formatAddress,

        onChange(fn) {
            if (typeof fn === "function") listeners.add(fn);
            return () => listeners.delete(fn);
        },

        goToAccount() {
            global.location.href = AuthService.ACCOUNT_URL;
        },

        requireAccount() {
            if (!AuthService.isLoggedIn()) {
                global.location.href = "./index.html?auth=login";
                return false;
            }
            return true;
        },
    };

    AuthService.loadProfile().catch(() => {});

    global.AuthService = AuthService;
})(typeof window !== "undefined" ? window : globalThis);
