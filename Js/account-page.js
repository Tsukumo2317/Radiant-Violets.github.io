(function () {
    if (!window.AuthService || !AuthService.requireAccount()) return;

    const el = (id) => document.getElementById(id);

    function formatPrice(n) {
        return Number(n || 0).toLocaleString("ru-RU") + " ₽";
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

    function starsLine(n) {
        const s = Math.min(5, Math.max(0, Number(n) || 0));
        return "★".repeat(s) + "☆".repeat(5 - s);
    }

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

    function renderOrderItem(it) {
        const img = it.imageUrl || "./icon/Logo.png";
        const qty = it.qty || 1;
        const lineTotal = formatPrice((it.price || 0) * qty);
        const sizeLine =
            it.size != null && it.size !== ""
                ? `<div class="account-order-item-sub">Размер: ${escapeHtml(String(it.size))}</div>`
                : "";
        return `
            <div class="account-order-line">
                <img class="account-order-line-img" src="${escapeAttr(img)}" alt="${escapeAttr(it.name || "Товар")}">
                <div class="account-order-line-meta">
                    <div class="account-order-line-name">${escapeHtml(it.name || "Товар")}</div>
                    ${sizeLine}
                    <div class="account-order-line-price">${qty} × ${formatPrice(it.price)} = ${lineTotal}</div>
                </div>
            </div>
        `;
    }

    function fillProfileForm(profile) {
        const p = profile || {};
        const addr = p.deliveryAddress || {};
        if (el("accFullName")) el("accFullName").value = p.fullName || "";
        if (el("accEmail")) el("accEmail").value = p.email || "";
        if (el("accPhone")) el("accPhone").value = addr.phone || "";
        if (el("accCity")) el("accCity").value = addr.city || "";
        if (el("accStreet")) el("accStreet").value = addr.street || "";
        if (el("accHouse")) el("accHouse").value = addr.house || "";
        if (el("accApartment")) el("accApartment").value = addr.apartment || "";
        if (el("accComment")) el("accComment").value = addr.comment || "";

        const greet = el("accountGreeting");
        if (greet && p.fullName) {
            greet.textContent = "Здравствуйте, " + p.fullName + "!";
        }
    }

    function renderOrders(orders) {
        const box = el("accountOrdersList");
        if (!box) return;
        if (!orders || !orders.length) {
            box.innerHTML = '<p class="account-empty">Заказов пока нет. Оформите первый заказ в каталоге.</p>';
            return;
        }
        box.innerHTML = orders
            .map((o) => {
                const itemsHtml = (o.items || []).length
                    ? (o.items || []).map(renderOrderItem).join("")
                    : '<p class="account-empty">Нет позиций</p>';
                const addr = AuthService.formatAddress(o.address);
                return `
                    <article class="account-order">
                        <div class="account-order-head">
                            <span class="account-order-id">Заказ ${escapeHtml(o.id || "")}</span>
                            <span class="account-order-date">${formatDate(o.createdAt)}</span>
                        </div>
                        <div class="account-order-total">Итого: ${formatPrice(o.total)}</div>
                        <div class="account-order-lines">${itemsHtml}</div>
                        <div class="account-order-delivery"><strong>Доставка:</strong> ${escapeHtml(addr)}</div>
                    </article>
                `;
            })
            .join("");
    }

    function renderReviews(reviews) {
        const box = el("accountReviewsList");
        if (!box) return;
        if (!reviews || !reviews.length) {
            box.innerHTML = '<p class="account-empty">Отзывов пока нет.</p>';
            return;
        }
        box.innerHTML = reviews
            .map(
                (r) => `
            <article class="account-review">
                <div class="account-review-meta">
                    <span class="account-review-product">${escapeHtml(r.productName || "Товар")}</span>
                    <span>${formatDate(r.createdAt)}</span>
                </div>
                <div class="account-review-stars" aria-label="Оценка ${r.stars} из 5">${starsLine(r.stars)}</div>
                <p class="account-review-text">${escapeHtml(r.text || "")}</p>
            </article>
        `
            )
            .join("");
    }

    function renderAll(profile) {
        fillProfileForm(profile);
        renderOrders(profile?.orders);
        renderReviews(profile?.reviews);
    }

    const TAB_IDS = {
        profile: { tab: "tab-profile", panel: "panel-profile" },
        address: { tab: "tab-address", panel: "panel-address" },
        orders: { tab: "tab-orders", panel: "panel-orders" },
        reviews: { tab: "tab-reviews", panel: "panel-reviews" },
    };

    function switchTab(name) {
        if (!TAB_IDS[name]) return;

        document.querySelectorAll(".account-tab").forEach((btn) => {
            const on = btn.dataset.tab === name;
            btn.classList.toggle("is-active", on);
            btn.setAttribute("aria-selected", on ? "true" : "false");
        });

        document.querySelectorAll(".account-panel").forEach((panel) => {
            const on = panel.id === TAB_IDS[name].panel;
            panel.classList.toggle("is-active", on);
            if (on) panel.removeAttribute("hidden");
            else panel.setAttribute("hidden", "");
        });

        if (history.replaceState) {
            history.replaceState(null, "", "#" + name);
        }
    }

    function initTabs() {
        document.querySelectorAll(".account-tab").forEach((btn) => {
            btn.addEventListener("click", () => switchTab(btn.dataset.tab));
        });

        const hash = window.location.hash.replace("#", "");
        if (TAB_IDS[hash]) switchTab(hash);
    }

    function showSaveMsg(id, text, isError) {
        const msg = el(id);
        if (!msg) return;
        msg.textContent = text;
        msg.style.color = isError ? "#b91c1c" : "#047857";
        if (!isError) {
            setTimeout(() => {
                msg.textContent = "";
            }, 3000);
        }
    }

    async function init() {
        initTabs();

        let profile = AuthService.getProfile();
        if (!profile) profile = await AuthService.loadProfile();
        renderAll(profile);

        AuthService.onChange(async () => {
            const p = await AuthService.loadProfile();
            renderAll(p);
        });
    }

    el("accountProfileForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const profile = await AuthService.updateProfile({
                fullName: el("accFullName")?.value?.trim() || "",
            });
            const greet = el("accountGreeting");
            if (greet && profile?.fullName) {
                greet.textContent = "Здравствуйте, " + profile.fullName + "!";
            }
            showSaveMsg("profileSaveMsg", "Личные данные сохранены", false);
        } catch (err) {
            showSaveMsg("profileSaveMsg", err.message || "Не удалось сохранить", true);
        }
    });

    el("accountAddressForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            await AuthService.saveDeliveryAddress({
                phone: el("accPhone")?.value?.trim() || "",
                city: el("accCity")?.value?.trim() || "",
                street: el("accStreet")?.value?.trim() || "",
                house: el("accHouse")?.value?.trim() || "",
                apartment: el("accApartment")?.value?.trim() || "",
                comment: el("accComment")?.value?.trim() || "",
            });
            showSaveMsg("addressSaveMsg", "Адрес сохранён", false);
        } catch (err) {
            showSaveMsg("addressSaveMsg", err.message || "Не удалось сохранить", true);
        }
    });

    el("accountLogoutBtn")?.addEventListener("click", () => {
        AuthService.logout();
        window.location.href = "./index.html";
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
