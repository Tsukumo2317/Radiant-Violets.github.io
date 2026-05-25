(() => {
    const STORAGE_KEY = 'rv_cart_v1';

    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('cartCloseBtn');
    const itemsRoot = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartIcon = document.querySelector('.nav_item_cart');
    const badge = document.getElementById('cartBadge');

    function formatPrice(price) {
        return Number(price || 0).toLocaleString('ru-RU') + ' ₽';
    }

    function normSize(s) {
        if (s == null || s === '') return '';
        return String(s).trim();
    }

    function isRingCategory(cat) {
        return cat === 'rings' || cat === 'engagement';
    }

    function sameLine(a, b) {
        return String(a.id) === String(b.id) && normSize(a.size) === normSize(b.size);
    }

    function loadCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(Boolean)
                .map((i) => ({
                    id: String(i.id ?? ''),
                    name: String(i.name ?? ''),
                    price: Number(i.price ?? 0),
                    imageUrl: i.imageUrl ? String(i.imageUrl) : '',
                    qty: Math.max(1, Number(i.qty ?? 1)),
                    size: normSize(i.size),
                    oldPrice: i.oldPrice != null && i.oldPrice !== '' ? Number(i.oldPrice) : undefined,
                    categoryId: i.categoryId ? String(i.categoryId) : '',
                }))
                .filter((i) => i.id && i.name);
        } catch {
            return [];
        }
    }

    function saveCart(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    const state = {
        items: loadCart(),
    };

    function getCount() {
        return state.items.reduce((sum, i) => sum + (i.qty || 0), 0);
    }

    function getTotal() {
        return state.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    }

    function setBadge() {
        const count = getCount();
        if (!badge) return;
        if (count > 0) {
            badge.textContent = String(count);
            badge.classList.add('active');
        } else {
            badge.textContent = '';
            badge.classList.remove('active');
        }
    }

    function setCheckoutEnabled() {
        if (checkoutBtn) checkoutBtn.disabled = state.items.length === 0;
    }

    function render() {
        setBadge();
        setCheckoutEnabled();

        if (!itemsRoot || !totalEl) return;

        const total = getTotal();
        totalEl.textContent = formatPrice(total);

        if (state.items.length === 0) {
            itemsRoot.innerHTML = `<div class="cart-empty">Корзина пуста</div>`;
            return;
        }

        itemsRoot.innerHTML = '';

        state.items.forEach((item) => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.dataset.id = item.id;
            el.dataset.size = normSize(item.size);

            const img = document.createElement('img');
            img.className = 'cart-item-img';
            img.alt = item.name;
            img.src = item.imageUrl || './icon/Logo.png';

            const body = document.createElement('div');
            body.className = 'cart-item-body';

            const top = document.createElement('div');
            top.className = 'cart-item-top';

            const title = document.createElement('div');
            title.className = 'cart-item-title';
            title.textContent = item.name;

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'cart-remove';
            remove.setAttribute('aria-label', 'Удалить товар');
            remove.textContent = '×';
            remove.addEventListener('click', () => removeLine(item.id, item.size));

            top.appendChild(title);
            top.appendChild(remove);

            body.appendChild(top);

            if (isRingCategory(item.categoryId)) {
                const sizeRow = document.createElement('div');
                sizeRow.className = 'cart-item-size';
                const sz = normSize(item.size);
                sizeRow.textContent = sz ? `Размер: ${sz}` : 'Размер: —';
                body.appendChild(sizeRow);
            }

            const meta = document.createElement('div');
            meta.className = 'cart-item-meta';

            const price = document.createElement('div');
            price.className = 'cart-item-price';
            price.textContent = formatPrice(item.price);

            const qty = document.createElement('div');
            qty.className = 'cart-qty';

            const minus = document.createElement('button');
            minus.type = 'button';
            minus.className = 'cart-qty-btn';
            minus.textContent = '−';
            minus.setAttribute('aria-label', 'Уменьшить количество');
            minus.addEventListener('click', () => changeQty(item.id, -1, item.size));

            const value = document.createElement('div');
            value.className = 'cart-qty-value';
            value.textContent = String(item.qty);

            const plus = document.createElement('button');
            plus.type = 'button';
            plus.className = 'cart-qty-btn';
            plus.textContent = '+';
            plus.setAttribute('aria-label', 'Увеличить количество');
            plus.addEventListener('click', () => changeQty(item.id, +1, item.size));

            qty.appendChild(minus);
            qty.appendChild(value);
            qty.appendChild(plus);

            meta.appendChild(price);
            meta.appendChild(qty);

            const lineTotal = document.createElement('div');
            lineTotal.className = 'cart-item-line-total';
            lineTotal.textContent = `Сумма: ${formatPrice(item.price * item.qty)}`;

            body.appendChild(meta);
            body.appendChild(lineTotal);

            el.appendChild(img);
            el.appendChild(body);
            itemsRoot.appendChild(el);
        });
    }

    function openCart() {
        if (window.Favorites && typeof window.Favorites.close === 'function') {
            window.Favorites.close();
        }
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
        const favOpen = document.getElementById('favOverlay')?.classList.contains('active');
        document.body.style.overflow = favOpen ? 'hidden' : '';
    }

    function persistAndRender() {
        saveCart(state.items);
        render();
        try {
            window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: [...state.items] } }));
        } catch {
            /* ignore */
        }
    }

    function addItem(payload) {
        const id = String(payload?.id ?? '');
        const name = String(payload?.name ?? '');
        const price = Number(payload?.price ?? payload?.currentPrice ?? 0);
        const imageUrl = payload?.imageUrl ? String(payload.imageUrl) : '';
        const qtyAdd = Math.max(1, Math.min(99, Number(payload?.qty ?? 1)));
        const size = normSize(payload?.size);
        const categoryId = payload?.categoryId ? String(payload.categoryId) : '';
        const oldPriceRaw = payload?.oldPrice;
        const oldPrice =
            oldPriceRaw != null && oldPriceRaw !== '' && Number.isFinite(Number(oldPriceRaw))
                ? Number(oldPriceRaw)
                : undefined;

        if (!id || !name || !Number.isFinite(price)) return;

        const probe = { id, size };
        const existing = state.items.find((i) => sameLine(i, probe));
        if (existing) {
            existing.qty = Math.min(99, existing.qty + qtyAdd);
            if (categoryId && !existing.categoryId) existing.categoryId = categoryId;
            if (oldPrice != null && existing.oldPrice == null) existing.oldPrice = oldPrice;
        } else {
            state.items.unshift({
                id,
                name,
                price,
                imageUrl,
                qty: qtyAdd,
                size,
                categoryId,
                ...(oldPrice != null ? { oldPrice } : {}),
            });
        }
        persistAndRender();
    }

    function removeLine(id, size) {
        const probe = { id: String(id), size: normSize(size) };
        state.items = state.items.filter((i) => !sameLine(i, probe));
        persistAndRender();
    }

    function changeQty(id, delta, size) {
        const item = state.items.find((i) => sameLine(i, { id: String(id), size: normSize(size) }));
        if (!item) return;
        item.qty = Math.max(1, Math.min(99, item.qty + delta));
        persistAndRender();
    }

    function clearCart() {
        state.items = [];
        persistAndRender();
    }

    // Events (drawer may be absent on dedicated cart page)
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeCart();
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay?.classList.contains('active')) closeCart();
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (state.items.length === 0) return;
            window.location.href = './cart.html';
        });
    }

    window.Cart = {
        addItem,
        open: openCart,
        close: closeCart,
        getItems: () => [...state.items],
        getTotal,
        formatPrice,
        removeLine,
        changeQty,
        clear: clearCart,
        persist: persistAndRender,
        reloadFromStorage: () => {
            state.items = loadCart();
            persistAndRender();
        },
    };

    render();
})();
