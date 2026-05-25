(function () {
    const DRAFT_KEY = "rv_checkout_draft_v1";

    if (!window.Cart || typeof window.Cart.getItems !== "function") {
        window.location.href = "./cart.html";
        return;
    }

    if (!window.Cart.getItems().length) {
        window.location.replace("./cart.html");
        return;
    }

    function formatPrice(n) {
        return typeof window.Cart.formatPrice === "function"
            ? window.Cart.formatPrice(n)
            : Number(n || 0).toLocaleString("ru-RU") + " ₽";
    }

    function isRing(cat) {
        return cat === "rings" || cat === "engagement";
    }

    function loadDraft() {
        try {
            const raw = sessionStorage.getItem(DRAFT_KEY);
            if (!raw) return { address: {}, payment: {} };
            const p = JSON.parse(raw);
            return {
                address: p.address && typeof p.address === "object" ? p.address : {},
                payment: p.payment && typeof p.payment === "object" ? p.payment : {},
            };
        } catch {
            return { address: {}, payment: {} };
        }
    }

    let draft = loadDraft();

    function saveDraft() {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }

    function clearDraft() {
        sessionStorage.removeItem(DRAFT_KEY);
    }

    /** Luhn (для номера карты без пробелов) */
    function luhnCheck(digits) {
        const s = String(digits).replace(/\D/g, "");
        if (s.length < 13 || s.length > 19) return false;
        let sum = 0;
        for (let i = s.length - 1; i >= 0; i--) {
            let n = parseInt(s.charAt(i), 10);
            const fromRight = s.length - 1 - i;
            if (fromRight % 2 === 1) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
        }
        return sum % 10 === 0;
    }

    /** MM/YY — не в прошлом */
    function validateExpiry(raw) {
        const t = String(raw || "").trim();
        const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(t);
        if (!m) return { ok: false, msg: "Укажите срок в формате MM/YY" };
        const mm = parseInt(m[1], 10);
        const yy = parseInt(m[2], 10);
        if (mm < 1 || mm > 12) return { ok: false, msg: "Некорректный месяц" };
        const fullY = yy <= 50 ? 2000 + yy : 1900 + yy;
        const now = new Date();
        const curY = now.getFullYear();
        const curM = now.getMonth() + 1;
        if (fullY < curY || (fullY === curY && mm < curM)) {
            return { ok: false, msg: "Срок действия карты истёк" };
        }
        return { ok: true, display: `${String(mm).padStart(2, "0")}/${String(yy).padStart(2, "0")}` };
    }

    function validatePhone(phone) {
        const d = String(phone || "").replace(/\D/g, "");
        if (d.length < 10 || d.length > 12) return false;
        return true;
    }

    function validateCardHolder(name) {
        const t = String(name || "").trim();
        if (t.length < 3) return false;
        return /^[A-Za-zА-Яа-яЁё\s'.-]+$/.test(t);
    }

    const el = (id) => document.getElementById(id);

    const stepPanels = [el("checkoutStep0"), el("checkoutStep1"), el("checkoutStep2")];
    const pills = document.querySelectorAll(".checkout-step-pill");

    let step = 0;

    function setStep(n) {
        step = Math.max(0, Math.min(2, n));
        stepPanels.forEach((p, i) => {
            if (!p) return;
            p.classList.toggle("is-active", i === step);
        });
        pills.forEach((pill, i) => {
            pill.classList.remove("is-active", "is-done");
            if (i < step) pill.classList.add("is-done");
            else if (i === step) pill.classList.add("is-active");
        });
        if (step === 2) renderReview();
    }

    function fieldErr(fieldId, msg) {
        const wrap = el(fieldId)?.closest(".checkout-field");
        const errEl = el(fieldId + "Err");
        if (wrap) wrap.classList.toggle("has-error", Boolean(msg));
        if (errEl) errEl.textContent = msg || "";
    }

    function clearAddrErrors() {
        ["fullName", "phone", "city", "street", "house"].forEach((id) => fieldErr(id, ""));
    }

    function clearPayErrors() {
        ["cardNumber", "cardHolder", "cardExpiry", "cardCvc"].forEach((id) => fieldErr(id, ""));
    }

    function readAddressFromForm() {
        return {
            fullName: el("fullName")?.value?.trim() || "",
            phone: el("phone")?.value?.trim() || "",
            city: el("city")?.value?.trim() || "",
            street: el("street")?.value?.trim() || "",
            house: el("house")?.value?.trim() || "",
            apartment: el("apartment")?.value?.trim() || "",
            comment: el("comment")?.value?.trim() || "",
        };
    }

    function fillAddressForm() {
        const a = draft.address || {};
        const profile =
            window.AuthService && AuthService.isLoggedIn()
                ? AuthService.getProfile()
                : null;
        const user = profile
            ? {
                  fullName: profile.fullName || "",
                  ...(profile.deliveryAddress || {}),
              }
            : null;

        if (el("fullName")) el("fullName").value = a.fullName || user?.fullName || "";
        if (el("phone")) el("phone").value = a.phone || user?.phone || "";
        if (el("city")) el("city").value = a.city || user?.city || "";
        if (el("street")) el("street").value = a.street || user?.street || "";
        if (el("house")) el("house").value = a.house || user?.house || "";
        if (el("apartment")) el("apartment").value = a.apartment || user?.apartment || "";
        if (el("comment")) el("comment").value = a.comment || user?.comment || "";
    }

    function validateAddressStep() {
        clearAddrErrors();
        const a = readAddressFromForm();
        let ok = true;
        if (a.fullName.length < 2) {
            fieldErr("fullName", "Укажите ФИО (не менее 2 символов)");
            ok = false;
        }
        if (!validatePhone(a.phone)) {
            fieldErr("phone", "Введите корректный номер телефона (от 10 цифр)");
            ok = false;
        }
        if (a.city.length < 2) {
            fieldErr("city", "Укажите город");
            ok = false;
        }
        if (a.street.length < 2) {
            fieldErr("street", "Укажите улицу");
            ok = false;
        }
        if (a.house.length < 1) {
            fieldErr("house", "Укажите дом");
            ok = false;
        }
        if (ok) {
            draft.address = a;
            saveDraft();
        }
        return ok;
    }

    function validatePaymentStep() {
        clearPayErrors();
        const numRaw = el("cardNumber")?.value || "";
        const digits = numRaw.replace(/\D/g, "");
        const holder = el("cardHolder")?.value?.trim() || "";
        const expRaw = el("cardExpiry")?.value?.trim() || "";
        const cvc = el("cardCvc")?.value?.trim() || "";

        let ok = true;
        if (!luhnCheck(digits)) {
            fieldErr("cardNumber", "Некорректный номер карты (проверьте цифры и контрольную сумму)");
            ok = false;
        }
        if (!validateCardHolder(holder)) {
            fieldErr("cardHolder", "Укажите имя как на карте (буквы, не менее 3 символов)");
            ok = false;
        }
        const exp = validateExpiry(expRaw);
        if (!exp.ok) {
            fieldErr("cardExpiry", exp.msg);
            ok = false;
        }
        if (!/^\d{3,4}$/.test(cvc)) {
            fieldErr("cardCvc", "CVC/CVV: 3 или 4 цифры");
            ok = false;
        }
        if (ok) {
            draft.payment = {
                cardLast4: digits.slice(-4),
                cardHolder: holder,
                expiry: exp.display,
            };
            saveDraft();
        }
        return ok;
    }

    function renderReview() {
        const a = draft.address || {};
        const p = draft.payment || {};
        const addrBox = el("reviewAddressBlock");
        if (addrBox) {
            addrBox.innerHTML = `
                <h3>Доставка</h3>
                <div class="checkout-review-line"><strong>Получатель:</strong> ${escapeHtml(a.fullName || "—")}</div>
                <div class="checkout-review-line"><strong>Телефон:</strong> ${escapeHtml(a.phone || "—")}</div>
                <div class="checkout-review-line"><strong>Адрес:</strong> ${escapeHtml(a.city || "")}, ${escapeHtml(a.street || "")}, д. ${escapeHtml(a.house || "")}${a.apartment ? ", кв. " + escapeHtml(a.apartment) : ""}</div>
                ${a.comment ? `<div class="checkout-review-line"><strong>Комментарий:</strong> ${escapeHtml(a.comment)}</div>` : ""}
            `;
        }

        const payBox = el("reviewPaymentBlock");
        if (payBox) {
            const masked = p.cardLast4 ? `•••• •••• •••• ${escapeHtml(p.cardLast4)}` : "—";
            payBox.innerHTML = `
                <h3>Оплата</h3>
                <div class="checkout-review-line"><strong>Карта:</strong> ${masked}</div>
                <div class="checkout-review-line"><strong>Держатель:</strong> ${escapeHtml(p.cardHolder || "—")}</div>
                <div class="checkout-review-line"><strong>Срок:</strong> ${escapeHtml(p.expiry || "—")}</div>
            `;
        }

        const itemsBox = el("reviewItemsBlock");
        if (itemsBox && window.Cart) {
            const items = window.Cart.getItems();
            const total = window.Cart.getTotal();
            let html = `<h3>Товары</h3>`;
            items.forEach((it) => {
                const sizeLine =
                    isRing(it.categoryId) && it.size
                        ? `<div class="checkout-review-item-sub">Размер: ${escapeHtml(String(it.size))}</div>`
                        : isRing(it.categoryId)
                          ? `<div class="checkout-review-item-sub">Размер: —</div>`
                          : "";
                html += `
                    <div class="checkout-review-item">
                        <img src="${escapeAttr(it.imageUrl || "./icon/Logo.png")}" alt="">
                        <div class="checkout-review-item-meta">
                            <div class="checkout-review-item-name">${escapeHtml(it.name)}</div>
                            ${sizeLine}
                            <div class="checkout-review-item-sub">${it.qty} × ${formatPrice(it.price)} = ${formatPrice(it.price * it.qty)}</div>
                        </div>
                    </div>
                `;
            });
            html += `<div class="checkout-review-line" style="margin-top:12px;font-weight:700;"><strong>Итого к оплате:</strong> ${formatPrice(total)}</div>`;
            itemsBox.innerHTML = html;
        }
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

    async function bind() {
        if (window.AuthService && AuthService.isLoggedIn() && !AuthService.getProfile()) {
            await AuthService.loadProfile().catch(() => {});
        }
        fillAddressForm();

        el("addrNext")?.addEventListener("click", () => {
            if (validateAddressStep()) setStep(1);
        });

        el("payBack")?.addEventListener("click", () => setStep(0));
        el("payNext")?.addEventListener("click", () => {
            if (validatePaymentStep()) setStep(2);
        });

        el("reviewBack")?.addEventListener("click", () => setStep(1));

        el("reviewConfirm")?.addEventListener("click", async () => {
            if (!window.Cart.getItems().length) {
                window.location.href = "./cart.html";
                return;
            }

            const items = window.Cart.getItems().map((it) => ({
                id: it.id,
                name: it.name,
                price: it.price,
                qty: it.qty,
                imageUrl: it.imageUrl,
                categoryId: it.categoryId,
                size: it.size,
            }));
            const total = window.Cart.getTotal();
            const address = { ...(draft.address || {}) };

            if (window.AuthService && AuthService.isLoggedIn()) {
                try {
                    await AuthService.addOrder({
                        total,
                        items,
                        address,
                        status: "completed",
                    });
                    await AuthService.saveDeliveryAddress({
                        phone: address.phone || "",
                        city: address.city || "",
                        street: address.street || "",
                        house: address.house || "",
                        apartment: address.apartment || "",
                        comment: address.comment || "",
                    });
                    if (address.fullName) {
                        await AuthService.updateProfile({ fullName: address.fullName });
                    }
                } catch (_) {}
            } else if (window.ShopOrders) {
                ShopOrders.append(
                    {
                        total,
                        items,
                        address,
                        status: "completed",
                    },
                    {
                        fullName: address.fullName || "Гость",
                        email: "—",
                    }
                );
            }

            window.Cart.clear();
            clearDraft();
            const ov = el("checkoutSuccess");
            if (ov) {
                ov.classList.add("is-open");
                ov.setAttribute("aria-hidden", "false");
            }
            document.body.style.overflow = "hidden";
        });

        el("successToHome")?.addEventListener("click", () => {
            window.location.href = "./index.html";
        });

        el("checkoutSuccess")?.addEventListener("click", (e) => {
            if (e.target === el("checkoutSuccess")) {
                el("checkoutSuccess")?.classList.remove("is-open");
                document.body.style.overflow = "";
            }
        });

        el("cardNumber")?.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 19);
            const parts = [];
            for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
            e.target.value = parts.join(" ");
        });

        el("cardExpiry")?.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
            if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
            e.target.value = v;
        });

        el("cardCvc")?.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
        });

        setStep(0);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bind);
    } else {
        bind();
    }
})();
