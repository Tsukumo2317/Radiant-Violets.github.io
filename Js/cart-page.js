(function () {
    const listEl = document.getElementById("cartPageList");
    const emptyEl = document.getElementById("cartPageEmpty");
    const summaryEl = document.getElementById("cartPageSummary");
    const totalEl = document.getElementById("cartPageTotal");
    const checkoutBtn = document.getElementById("cartPageCheckout");

    if (!listEl || !window.Cart) return;

    function isRing(cat) {
        return cat === "rings" || cat === "engagement";
    }

    function formatPrice(n) {
        return typeof window.Cart.formatPrice === "function"
            ? window.Cart.formatPrice(n)
            : Number(n || 0).toLocaleString("ru-RU") + " ₽";
    }

    function render() {
        const items = window.Cart.getItems();
        const total = window.Cart.getTotal();

        if (totalEl) totalEl.textContent = formatPrice(total);

        if (items.length === 0) {
            listEl.classList.add("is-empty");
            if (emptyEl) emptyEl.classList.remove("hidden");
            if (summaryEl) summaryEl.classList.add("is-empty");
            if (checkoutBtn) checkoutBtn.setAttribute("aria-disabled", "true");
            listEl.innerHTML = "";
            return;
        }

        listEl.classList.remove("is-empty");
        if (emptyEl) emptyEl.classList.add("hidden");
        if (summaryEl) summaryEl.classList.remove("is-empty");
        if (checkoutBtn) checkoutBtn.removeAttribute("aria-disabled");

        listEl.innerHTML = "";

        items.forEach((item) => {
            const line = document.createElement("div");
            line.className = "cart-page-line";

            const img = document.createElement("img");
            img.className = "cart-page-line-img";
            img.alt = item.name;
            img.src = item.imageUrl || "./icon/Logo.png";

            const body = document.createElement("div");
            body.className = "cart-page-line-body";

            const top = document.createElement("div");
            top.className = "cart-page-line-row";
            top.style.justifyContent = "flex-start";
            top.style.alignItems = "flex-start";

            const titleCol = document.createElement("div");
            titleCol.style.flex = "1";
            titleCol.style.minWidth = "0";

            const title = document.createElement("div");
            title.className = "cart-page-line-title";
            title.textContent = item.name;
            titleCol.appendChild(title);

            if (isRing(item.categoryId)) {
                const sz = item.size ? String(item.size) : "";
                const sizeEl = document.createElement("div");
                sizeEl.className = "cart-page-line-size";
                sizeEl.textContent = sz ? `Размер: ${sz}` : "Размер: —";
                titleCol.appendChild(sizeEl);
            }

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "cart-page-line-remove";
            remove.setAttribute("aria-label", "Удалить товар");
            remove.textContent = "×";
            remove.addEventListener("click", () => {
                window.Cart.removeLine(item.id, item.size);
                render();
            });

            top.appendChild(titleCol);
            top.appendChild(remove);

            const row = document.createElement("div");
            row.className = "cart-page-line-row";

            const price = document.createElement("div");
            price.className = "cart-page-line-price";
            price.textContent = formatPrice(item.price);

            const qty = document.createElement("div");
            qty.className = "cart-qty";

            const minus = document.createElement("button");
            minus.type = "button";
            minus.className = "cart-qty-btn";
            minus.textContent = "−";
            minus.addEventListener("click", () => {
                window.Cart.changeQty(item.id, -1, item.size);
                render();
            });

            const val = document.createElement("div");
            val.className = "cart-qty-value";
            val.textContent = String(item.qty);

            const plus = document.createElement("button");
            plus.type = "button";
            plus.className = "cart-qty-btn";
            plus.textContent = "+";
            plus.addEventListener("click", () => {
                window.Cart.changeQty(item.id, 1, item.size);
                render();
            });

            qty.appendChild(minus);
            qty.appendChild(val);
            qty.appendChild(plus);

            row.appendChild(price);
            row.appendChild(qty);

            const lineTot = document.createElement("div");
            lineTot.className = "cart-page-line-total";
            lineTot.textContent = `Итого: ${formatPrice(item.price * item.qty)}`;

            body.appendChild(top);
            body.appendChild(row);
            body.appendChild(lineTot);

            line.appendChild(img);
            line.appendChild(body);
            listEl.appendChild(line);
        });
    }

    document.addEventListener("cart:updated", render);

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", (e) => {
            if (!window.Cart.getItems().length) e.preventDefault();
        });
    }

    render();
})();
