/**
 * Публичные отзывы на главной (добавляет админ; позже — API).
 */
(function (global) {
    const KEY = "rv_public_reviews_v1";

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

    function createId() {
        return "rev_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
    }

    global.SiteReviews = {
        getAll() {
            return readList();
        },

        add(review) {
            const entry = {
                id: review.id || createId(),
                productId: review.productId ?? null,
                productName: String(review.productName || "Товар").trim(),
                name: String(review.name || "Покупатель").trim(),
                text: String(review.text || "").trim(),
                stars: Math.min(5, Math.max(1, Number(review.stars) || 5)),
                avatar: review.avatar || "icon/reviews-user.png",
                createdAt: review.createdAt || new Date().toISOString(),
            };
            const list = readList();
            list.unshift(entry);
            writeList(list);
            return entry;
        },

        remove(id) {
            writeList(readList().filter((r) => r.id !== id));
        },
    };
})(typeof window !== "undefined" ? window : globalThis);
