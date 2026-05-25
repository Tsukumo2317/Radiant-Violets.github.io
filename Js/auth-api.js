/**
 * HTTP-слой для авторизации и профиля.
 * При подключении Laravel: установите USE_MOCK = false и BASE_URL на ваш API.
 */
(function (global) {
    const CONFIG = {
        USE_MOCK: true,
        BASE_URL: "http://127.0.0.1:8000/api",
        STORAGE_USERS: "rv_users_v1",
        STORAGE_SESSION: "rv_auth_session_v1",
        STORAGE_PROFILE_PREFIX: "rv_profile_v1_",
    };

    const ENDPOINTS = {
        register: "/auth/register",
        login: "/auth/login",
        logout: "/auth/logout",
        me: "/auth/me",
        profile: "/user/profile",
        orders: "/user/orders",
        reviews: "/user/reviews",
    };

    function getSessionStorage(remember) {
        return remember ? localStorage : sessionStorage;
    }

    function readSession() {
        try {
            const raw =
                localStorage.getItem(CONFIG.STORAGE_SESSION) ||
                sessionStorage.getItem(CONFIG.STORAGE_SESSION);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function writeSession(session, remember) {
        localStorage.removeItem(CONFIG.STORAGE_SESSION);
        sessionStorage.removeItem(CONFIG.STORAGE_SESSION);
        const store = getSessionStorage(remember);
        store.setItem(CONFIG.STORAGE_SESSION, JSON.stringify(session));
    }

    function clearSession() {
        localStorage.removeItem(CONFIG.STORAGE_SESSION);
        sessionStorage.removeItem(CONFIG.STORAGE_SESSION);
    }

    function readUsers() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_USERS);
            if (!raw) return {};
            const data = JSON.parse(raw);
            return data && typeof data === "object" ? data : {};
        } catch {
            return {};
        }
    }

    function writeUsers(users) {
        localStorage.setItem(CONFIG.STORAGE_USERS, JSON.stringify(users));
    }

    function profileKey(userId) {
        return CONFIG.STORAGE_PROFILE_PREFIX + userId;
    }

    function readProfile(userId) {
        try {
            const raw = localStorage.getItem(profileKey(userId));
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function writeProfile(userId, profile) {
        localStorage.setItem(profileKey(userId), JSON.stringify(profile));
    }

    function createId(prefix) {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    }

    function defaultProfile(user) {
        return {
            id: user.id,
            fullName: user.fullName || "",
            email: user.email || "",
            deliveryAddress: {
                phone: "",
                city: "",
                street: "",
                house: "",
                apartment: "",
                comment: "",
            },
            orders: [],
            reviews: [],
        };
    }

    function normalizeEmail(email) {
        return String(email || "").trim().toLowerCase();
    }

    async function request(method, path, body, token) {
        const headers = { Accept: "application/json", "Content-Type": "application/json" };
        if (token) headers.Authorization = "Bearer " + token;

        const res = await fetch(CONFIG.BASE_URL + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = data.message || data.error || "Ошибка запроса (" + res.status + ")";
            throw new Error(msg);
        }
        return data;
    }

    const mock = {
        async register({ fullName, email, password }) {
            const mail = normalizeEmail(email);
            const users = readUsers();
            if (users[mail]) throw new Error("Пользователь с таким email уже зарегистрирован");

            const user = {
                id: createId("user"),
                fullName: String(fullName || "").trim(),
                email: mail,
                password: String(password || ""),
                createdAt: new Date().toISOString(),
            };
            users[mail] = user;
            writeUsers(users);

            const profile = defaultProfile(user);
            writeProfile(user.id, profile);

            return { user: { id: user.id, fullName: user.fullName, email: user.email }, profile };
        },

        async login({ email, password, remember }) {
            const mail = normalizeEmail(email);
            const users = readUsers();
            const user = users[mail];
            if (!user || user.password !== String(password || "")) {
                throw new Error("Неверный email или пароль");
            }

            let profile = readProfile(user.id);
            if (!profile) {
                profile = defaultProfile(user);
                writeProfile(user.id, profile);
            }
            profile.fullName = user.fullName;
            profile.email = user.email;

            const token = createId("tok");
            const session = {
                token,
                userId: user.id,
                email: user.email,
                fullName: user.fullName,
                remember: Boolean(remember),
                createdAt: new Date().toISOString(),
            };
            writeSession(session, remember);
            writeProfile(user.id, profile);

            return {
                token,
                user: { id: user.id, fullName: user.fullName, email: user.email },
                profile,
            };
        },

        logout() {
            clearSession();
        },

        getSession() {
            return readSession();
        },

        async getProfile() {
            const session = readSession();
            if (!session) return null;
            let profile = readProfile(session.userId);
            if (!profile) {
                profile = defaultProfile({
                    id: session.userId,
                    fullName: session.fullName,
                    email: session.email,
                });
                writeProfile(session.userId, profile);
            }
            return profile;
        },

        async updateProfile(patch) {
            const session = readSession();
            if (!session) throw new Error("Необходимо войти в аккаунт");

            let profile = readProfile(session.userId) || defaultProfile(session);
            if (patch.fullName != null) {
                profile.fullName = String(patch.fullName).trim();
                const users = readUsers();
                const u = users[session.email];
                if (u) {
                    u.fullName = profile.fullName;
                    writeUsers(users);
                }
                session.fullName = profile.fullName;
                writeSession(session, session.remember);
            }
            if (patch.email != null) profile.email = String(patch.email).trim();
            if (patch.deliveryAddress != null) {
                profile.deliveryAddress = {
                    ...profile.deliveryAddress,
                    ...patch.deliveryAddress,
                };
            }
            writeProfile(session.userId, profile);
            return profile;
        },

        async addOrder(order) {
            const session = readSession();
            if (!session) throw new Error("Необходимо войти в аккаунт");
            const profile = (await mock.getProfile()) || defaultProfile(session);
            const entry = {
                id: order.id || createId("order"),
                createdAt: order.createdAt || new Date().toISOString(),
                status: order.status || "completed",
                total: order.total ?? 0,
                items: Array.isArray(order.items) ? order.items : [],
                address: order.address || {},
            };
            profile.orders = [entry, ...(profile.orders || [])];
            writeProfile(session.userId, profile);
            return entry;
        },

        async addReview(review) {
            const session = readSession();
            if (!session) throw new Error("Необходимо войти в аккаунт");
            const profile = (await mock.getProfile()) || defaultProfile(session);
            const entry = {
                id: review.id || createId("review"),
                createdAt: review.createdAt || new Date().toISOString(),
                productName: review.productName || "Товар",
                text: review.text || "",
                stars: Math.min(5, Math.max(1, Number(review.stars) || 5)),
            };
            profile.reviews = [entry, ...(profile.reviews || [])];
            writeProfile(session.userId, profile);
            return entry;
        },
    };

    const remote = {
        register(payload) {
            return request("POST", ENDPOINTS.register, payload).then((d) => ({
                user: d.user,
                profile: d.profile || d.data,
            }));
        },
        login(payload) {
            return request("POST", ENDPOINTS.login, payload).then((d) => {
                const session = {
                    token: d.token,
                    userId: d.user.id,
                    email: d.user.email,
                    fullName: d.user.fullName || d.user.name,
                    remember: Boolean(payload.remember),
                };
                writeSession(session, payload.remember);
                return { token: d.token, user: d.user, profile: d.profile };
            });
        },
        logout() {
            const session = readSession();
            const p = session
                ? request("POST", ENDPOINTS.logout, null, session.token).catch(() => {})
                : Promise.resolve();
            return p.finally(() => clearSession());
        },
        getSession: () => readSession(),
        getProfile() {
            const session = readSession();
            if (!session) return Promise.resolve(null);
            return request("GET", ENDPOINTS.me, null, session.token).then((d) => d.profile || d.user);
        },
        updateProfile(patch) {
            const session = readSession();
            if (!session) return Promise.reject(new Error("Необходимо войти в аккаунт"));
            return request("PUT", ENDPOINTS.profile, patch, session.token);
        },
        addOrder(order) {
            const session = readSession();
            if (!session) return Promise.reject(new Error("Необходимо войти в аккаунт"));
            return request("POST", ENDPOINTS.orders, order, session.token);
        },
        addReview(review) {
            const session = readSession();
            if (!session) return Promise.reject(new Error("Необходимо войти в аккаунт"));
            return request("POST", ENDPOINTS.reviews, review, session.token);
        },
    };

    global.AuthApi = {
        CONFIG,
        ENDPOINTS,
        useMock: () => CONFIG.USE_MOCK,
        setUseMock(value) {
            CONFIG.USE_MOCK = Boolean(value);
        },
        setBaseUrl(url) {
            CONFIG.BASE_URL = String(url || "").replace(/\/$/, "");
        },
        get client() {
            return CONFIG.USE_MOCK ? mock : remote;
        },
        getSession: () => readSession(),
        clearSession,
    };
})(typeof window !== "undefined" ? window : globalThis);
