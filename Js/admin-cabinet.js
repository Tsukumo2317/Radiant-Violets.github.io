(function () {
    if (!window.AdminAuth || !AdminAuth.requireAdmin()) return;

    const el = (id) => document.getElementById(id);

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/'/g, "&#39;");
    }

    function formatDate(iso) {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    }

    const TAB_IDS = {
        orders: { tab: "admin-tab-orders", panel: "admin-panel-orders" },
        reviews: { tab: "admin-tab-reviews", panel: "admin-panel-reviews" },
        products: { tab: "admin-tab-products", panel: "admin-panel-products" },
    };

    function switchTab(name) {
        if (!TAB_IDS[name]) return;
        document.querySelectorAll(".admin-tab").forEach((btn) => {
            const on = btn.dataset.tab === name;
            btn.classList.toggle("is-active", on);
            btn.setAttribute("aria-selected", on ? "true" : "false");
        });
        document.querySelectorAll(".admin-panel").forEach((panel) => {
            const on = panel.id === TAB_IDS[name].panel;
            panel.classList.toggle("is-active", on);
            if (on) panel.removeAttribute("hidden");
            else panel.setAttribute("hidden", "");
        });
        if (name === "orders") renderTodayOrders();
        if (name === "reviews") renderPublishedReviews();
    }

    function renderOrderItem(it) {
        const img = it.imageUrl || "./icon/Logo.png";
        const qty = it.qty || 1;
        return `
            <div class="admin-order-line">
                <img src="${escapeAttr(img)}" alt="">
                <div>
                    <div class="admin-order-line-name">${escapeHtml(it.name || "Товар")}</div>
                    <div class="admin-order-line-sub">${qty} × ${ShopOrders.formatPrice(it.price)}</div>
                </div>
            </div>
        `;
    }

    function renderTodayOrders() {
        const box = el("adminTodayOrders");
        const countEl = el("adminTodayCount");
        if (!box || !window.ShopOrders) return;

        const today = new Date();
        const orders = ShopOrders.getToday(today);
        const dateLabel = today.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        if (countEl) {
            countEl.textContent = `За ${dateLabel}: ${orders.length} заказ(ов)`;
        }

        if (!orders.length) {
            box.innerHTML = '<p class="admin-empty">Сегодня заказов пока нет.</p>';
            return;
        }

        box.innerHTML = orders
            .map((o) => {
                const itemsHtml = (o.items || []).map(renderOrderItem).join("");
                const addr = o.address || {};
                const addrParts = [addr.city, addr.street, addr.house && "д. " + addr.house, addr.apartment && "кв. " + addr.apartment]
                    .filter(Boolean)
                    .join(", ");
                return `
                    <article class="admin-order-card">
                        <div class="admin-order-card-head">
                            <span><strong>${escapeHtml(o.id || "")}</strong></span>
                            <span>${formatDate(o.createdAt)}</span>
                        </div>
                        <p class="admin-order-card-meta">Клиент: ${escapeHtml(o.customerName || "—")} · ${escapeHtml(o.customerEmail || "—")}</p>
                        <p class="admin-order-card-total">Итого: ${ShopOrders.formatPrice(o.total)}</p>
                        <div class="admin-order-lines">${itemsHtml}</div>
                        ${addrParts ? `<p class="admin-order-card-meta">Доставка: ${escapeHtml(addrParts)}</p>` : ""}
                    </article>
                `;
            })
            .join("");
    }

    function fillProductSelect() {
        const select = el("adminReviewProduct");
        if (!select || !Array.isArray(window.CATALOG_PRODUCTS)) return;
        const current = select.value;
        select.innerHTML =
            '<option value="">— Выберите товар —</option>' +
            window.CATALOG_PRODUCTS.map(
                (p) =>
                    `<option value="${escapeHtml(String(p.id))}">${escapeHtml(p.name || "Товар")}</option>`
            ).join("");
        if (current) select.value = current;
    }

    function renderPublishedReviews() {
        const box = el("adminReviewsList");
        if (!box || !window.SiteReviews) return;
        const items = SiteReviews.getAll();
        if (!items.length) {
            box.innerHTML = '<p class="admin-empty">Публичных отзывов пока нет.</p>';
            return;
        }
        box.innerHTML = items
            .map(
                (r) => `
            <article class="admin-review-item">
                <div class="admin-review-item-head">
                    <strong>${escapeHtml(r.productName || "Товар")}</strong>
                    <span>${formatDate(r.createdAt)}</span>
                </div>
                <p class="admin-review-item-meta">${escapeHtml(r.name || "")} · ${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</p>
                <p>${escapeHtml(r.text || "")}</p>
                <button type="button" class="admin-delete-btn" data-review-id="${escapeHtml(r.id)}">Удалить</button>
            </article>
        `
            )
            .join("");

        box.querySelectorAll("[data-review-id]").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (!confirm("Удалить отзыв с сайта?")) return;
                SiteReviews.remove(btn.getAttribute("data-review-id"));
                renderPublishedReviews();
            });
        });
    }

    function initTabs() {
        document.querySelectorAll(".admin-tab").forEach((btn) => {
            btn.addEventListener("click", () => switchTab(btn.dataset.tab));
        });
        switchTab("orders");
    }

    el("adminReviewForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const status = el("adminReviewStatus");
        const productId = el("adminReviewProduct")?.value;
        const product = window.CATALOG_PRODUCTS?.find((p) => String(p.id) === String(productId));
        const text = el("adminReviewText")?.value?.trim();
        const name = el("adminReviewAuthor")?.value?.trim() || "RADIANT VIOLETS";
        const stars = Number(el("adminReviewStars")?.value) || 5;

        if (!product) {
            if (status) status.textContent = "Выберите товар из списка.";
            status?.classList.add("is-error");
            return;
        }
        if (!text) {
            if (status) status.textContent = "Введите текст отзыва.";
            status?.classList.add("is-error");
            return;
        }

        SiteReviews.add({
            productId: product.id,
            productName: product.name,
            name,
            text,
            stars,
        });

        e.target.reset();
        if (status) {
            status.textContent = "Отзыв опубликован на главной странице.";
            status.classList.remove("is-error");
        }
        renderPublishedReviews();
    });

    el("adminLogoutBtn")?.addEventListener("click", () => {
        AdminAuth.logout();
        window.location.href = "./index.html";
    });

    el("adminRefreshOrders")?.addEventListener("click", renderTodayOrders);

    fillProductSelect();
    initTabs();
})();
