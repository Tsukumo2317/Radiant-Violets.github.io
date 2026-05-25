(() => {
    const STORAGE_KEY = 'rv_favorites_v1';

    const overlay = document.getElementById('favOverlay');
    const closeBtn = document.getElementById('favCloseBtn');
    const itemsRoot = document.getElementById('favItems');
    const favIcon = document.querySelector('.nav_item_fav');
    const badge = document.getElementById('favBadge');

    if (!overlay || !itemsRoot) return;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(Boolean)
                .map((i) => ({
                    id: String(i.id ?? ''),
                    name: String(i.name ?? ''),
                    price: Number(i.price ?? i.currentPrice ?? 0),
                    imageUrl: i.imageUrl ? String(i.imageUrl) : '',
                }))
                .filter((i) => i.id && i.name);
        } catch {
            return [];
        }
    }

    function save(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    const state = {
        items: load(),
    };

    function setBadge() {
        if (!badge) return;
        const count = state.items.length;
        if (count > 0) {
            badge.textContent = String(count);
            badge.classList.add('active');
        } else {
            badge.textContent = '';
            badge.classList.remove('active');
        }
    }

    function render() {
        setBadge();

        if (state.items.length === 0) {
            itemsRoot.innerHTML = `<div class="fav-empty">В избранном пока нет товаров</div>`;
            return;
        }

        itemsRoot.innerHTML = '';

        state.items.forEach((item) => {
            const el = document.createElement('div');
            el.className = 'fav-item';
            el.dataset.id = item.id;

            const img = document.createElement('img');
            img.className = 'fav-item-img';
            img.alt = item.name;
            img.src = item.imageUrl || './icon/Logo.png';

            const body = document.createElement('div');
            body.className = 'fav-item-body';

            const top = document.createElement('div');
            top.className = 'fav-item-top';

            const title = document.createElement('div');
            title.className = 'fav-item-title';
            title.textContent = item.name;

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'fav-remove';
            remove.setAttribute('aria-label', 'Удалить из избранного');
            remove.textContent = '×';
            remove.addEventListener('click', () => removeById(item.id));

            top.appendChild(title);
            top.appendChild(remove);

            const meta = document.createElement('div');
            meta.className = 'fav-item-meta';

            const price = document.createElement('div');
            price.className = 'fav-item-price';
            price.textContent = Number(item.price || 0).toLocaleString('ru-RU') + ' ₽';

            const addToCart = document.createElement('button');
            addToCart.type = 'button';
            addToCart.className = 'fav-add-to-cart';
            addToCart.textContent = 'В корзину';
            addToCart.addEventListener('click', () => {
                if (window.Cart && typeof window.Cart.addItem === 'function') {
                    let payload = {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        imageUrl: item.imageUrl,
                    };
                    if (Array.isArray(window.CATALOG_PRODUCTS)) {
                        const p = window.CATALOG_PRODUCTS.find((x) => String(x.id) === String(item.id));
                        if (p) {
                            payload.oldPrice = p.oldPrice;
                            payload.categoryId = p.categoryId;
                            const ring = p.categoryId === 'rings' || p.categoryId === 'engagement';
                            if (ring && Array.isArray(p.sizes) && p.sizes.length) {
                                payload.size = String(p.sizes[0]);
                            }
                        }
                    }
                    window.Cart.addItem(payload);
                }
            });

            meta.appendChild(price);
            meta.appendChild(addToCart);

            body.appendChild(top);
            body.appendChild(meta);

            el.appendChild(img);
            el.appendChild(body);
            itemsRoot.appendChild(el);
        });
    }

    function open() {
        if (window.Cart && typeof window.Cart.close === 'function') {
            window.Cart.close();
        }
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        const cartOpen = document.getElementById('cartOverlay')?.classList.contains('active');
        document.body.style.overflow = cartOpen ? 'hidden' : '';
    }

    function persistAndRender() {
        save(state.items);
        render();
        document.dispatchEvent(new CustomEvent('favorites:updated', { detail: { ids: state.items.map(i => i.id) } }));
    }

    function has(id) {
        return state.items.some((i) => i.id === String(id));
    }

    function add(item) {
        const id = String(item?.id ?? '');
        const name = String(item?.name ?? '');
        const price = Number(item?.price ?? item?.currentPrice ?? 0);
        const imageUrl = item?.imageUrl ? String(item.imageUrl) : '';
        if (!id || !name) return false;
        if (has(id)) return true;
        state.items.unshift({ id, name, price, imageUrl });
        persistAndRender();
        return true;
    }

    function removeById(id) {
        state.items = state.items.filter((i) => i.id !== String(id));
        persistAndRender();
    }

    function toggle(item) {
        const id = String(item?.id ?? '');
        if (!id) return false;
        if (has(id)) {
            removeById(id);
            return false;
        }
        add(item);
        return true;
    }

    // Events
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (favIcon) favIcon.addEventListener('click', open);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });

    // Public API
    window.Favorites = {
        open,
        close,
        has,
        toggle,
        add,
        remove: removeById,
        getItems: () => [...state.items],
        getIds: () => new Set(state.items.map((i) => i.id)),
    };

    // Initial render
    render();
})();

