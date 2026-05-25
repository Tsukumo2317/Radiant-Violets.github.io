/**
 * Общий журнал заказов магазина (для админ-панели и будущего backend).
 */
(function (global) {
    const KEY = "rv_shop_orders_v1";
    const PROFILE_PREFIX = "rv_profile_v1_";

    function readList() {
        try {
            const raw = localStorage.getItem(KEY);
            const list = JSON.parse(raw || "[]");
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    function writeList(list) {
        localStorage.setItem(KEY, JSON.stringify(list));
    }

    function isSameDay(iso, refDate) {
        if (!iso) return false;
        const d = new Date(iso);
        const r = refDate || new Date();
        return (
            d.getFullYear() === r.getFullYear() &&
            d.getMonth() === r.getMonth() &&
            d.getDate() === r.getDate()
        );
    }

    function collectFromProfiles() {
        const found = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(PROFILE_PREFIX)) continue;
            try {
                const profile = JSON.parse(localStorage.getItem(key));
                if (!profile || !Array.isArray(profile.orders)) continue;
                profile.orders.forEach((o) => {
                    found.push({
                        ...o,
                        customerName: profile.fullName || "—",
                        customerEmail: profile.email || "—",
                    });
                });
            } catch (_) {}
        }
        return found;
    }

    global.ShopOrders = {
        append(order, customer) {
            const entry = {
                id: order.id || "order_" + Date.now(),
                createdAt: order.createdAt || new Date().toISOString(),
                status: order.status || "completed",
                total: order.total ?? 0,
                items: Array.isArray(order.items) ? order.items : [],
                address: order.address || {},
                customerName: customer?.fullName || customer?.name || "Гость",
                customerEmail: customer?.email || "—",
            };
            const list = readList();
            list.unshift(entry);
            writeList(list);
            return entry;
        },

        getAll() {
            const fromStore = readList();
            const fromProfiles = collectFromProfiles();
            const byId = new Map();
            [...fromStore, ...fromProfiles].forEach((o) => {
                if (o && o.id) byId.set(o.id, o);
            });
            return Array.from(byId.values()).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        },

        getToday(refDate) {
            return ShopOrders.getAll().filter((o) => isSameDay(o.createdAt, refDate));
        },

        formatPrice(n) {
            return Number(n || 0).toLocaleString("ru-RU") + " ₽";
        },
    };
})(typeof window !== "undefined" ? window : globalThis);
