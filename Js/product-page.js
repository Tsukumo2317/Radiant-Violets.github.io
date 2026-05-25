(function () {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    if (!id || !Array.isArray(window.CATALOG_PRODUCTS)) return;

    const product = window.CATALOG_PRODUCTS.find((p) => Number(p.id) === id);
    if (!product) return;

    const byId = (x) => document.getElementById(x);
    const mainMedia = byId("productMainMedia");
    const thumbs = byId("productMediaThumbs");
    const videoList = byId("productVideoList");
    const titleEl = byId("productTitle");
    const priceEl = byId("productPrice");
    const oldPriceEl = byId("productOldPrice");
    const stockEl = byId("productStock");
    const stockFill = byId("productStockFill");
    const skuEl = byId("productSku");
    const catEl = byId("productCategory");
    const descEl = byId("productDescription");
    const reviewsEl = byId("productReviews");
    const relatedGrid = byId("relatedGrid");
    const sizeWrap = byId("productSizeWrap");
    const sizeSelect = byId("productSize");
    const qtyValue = byId("productQtyValue");
    const qtyMinus = byId("productQtyMinus");
    const qtyPlus = byId("productQtyPlus");
    const addBtn = byId("productAddToCart");
    const buyNowBtn = byId("productBuyNow");
    const favBtn = byId("productFavBtn");

    let qty = 1;

    function probeImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    async function resolveAvailableImages() {
        const candidates = Array.isArray(product.mediaImages) ? product.mediaImages : [product.imageUrl];
        const checks = await Promise.all(
            candidates.map(async (src) => ({ src, ok: await probeImage(src) }))
        );
        const images = checks.filter((x) => x.ok).map((x) => x.src);
        return images.length ? images : [product.imageUrl].filter(Boolean);
    }

    function probeVideo(src) {
        return new Promise((resolve) => {
            const v = document.createElement("video");
            let done = false;
            const finish = (ok) => {
                if (done) return;
                done = true;
                v.removeAttribute("src");
                v.load();
                resolve(ok);
            };
            v.preload = "metadata";
            v.onloadedmetadata = () => finish(true);
            v.onerror = () => finish(false);
            v.src = src;
            setTimeout(() => finish(false), 8000);
        });
    }

    async function resolveAvailableVideos() {
        const candidates = Array.isArray(product.mediaVideos) ? product.mediaVideos : [];
        if (!candidates.length) return [];
        const checks = await Promise.all(
            candidates.map(async (src) => ({ src, ok: await probeVideo(src) }))
        );
        return checks.filter((x) => x.ok).map((x) => x.src);
    }

    function formatPrice(n) {
        return typeof window.formatPrice === "function"
            ? window.formatPrice(n)
            : `${Number(n).toLocaleString("ru-RU")} ₽`;
    }

    function renderMainMedia(src, type) {
        if (!mainMedia) return;
        mainMedia.innerHTML = "";
        if (type === "video") {
            const v = document.createElement("video");
            v.controls = true;
            v.playsInline = true;
            v.preload = "metadata";
            v.src = src;
            mainMedia.appendChild(v);
        } else {
            const img = document.createElement("img");
            img.src = src;
            img.alt = product.name;
            mainMedia.appendChild(img);
        }
    }

    async function renderMedia() {
        const images = await resolveAvailableImages();
        const videos = await resolveAvailableVideos();

        if (images.length) renderMainMedia(images[0], "image");

        if (thumbs) {
            thumbs.innerHTML = "";
            thumbs.style.display = images.length > 1 ? "" : "none";
            images.forEach((src, idx) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "product-thumb";
                if (idx === 0) b.classList.add("is-active");
                b.innerHTML = `<img src="${src}" alt="">`;
                b.addEventListener("click", () => {
                    thumbs.querySelectorAll(".product-thumb").forEach((x) => x.classList.remove("is-active"));
                    b.classList.add("is-active");
                    renderMainMedia(src, "image");
                });
                thumbs.appendChild(b);
            });
        }

        if (videoList) {
            videoList.innerHTML = "";
            videos.forEach((src) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "product-video-item";
                b.textContent = "Видео";
                b.addEventListener("click", () => renderMainMedia(src, "video"));
                videoList.appendChild(b);
            });
            if (!videos.length) {
                videoList.style.display = "none";
            }
        }
    }

    function renderInfo() {
        document.title = `${product.name} — RADIANT VIOLETS`;
        if (titleEl) titleEl.textContent = product.name;
        if (priceEl) priceEl.textContent = formatPrice(product.currentPrice);
        if (oldPriceEl) oldPriceEl.textContent = formatPrice(product.oldPrice);
        if (skuEl) skuEl.textContent = product.sku || "-";
        if (catEl) catEl.textContent = product.categoryLabel || "-";
        if (descEl) descEl.textContent = product.description || "";

        const stock = Number(product.stock || 0);
        if (stockEl) stockEl.textContent = `Осталось всего ${stock} шт.`;
        if (stockFill) {
            const pct = Math.max(8, Math.min(100, stock * 15));
            stockFill.style.width = `${pct}%`;
        }
    }

    function renderSizes() {
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        if (!sizeWrap || !sizeSelect) return;
        if (!sizes.length) {
            sizeWrap.style.display = "none";
            return;
        }
        sizeWrap.style.display = "";
        sizeSelect.innerHTML = "";
        sizes.forEach((s) => {
            const opt = document.createElement("option");
            opt.value = String(s);
            opt.textContent = String(s);
            sizeSelect.appendChild(opt);
        });
    }

    function setQty(next) {
        qty = Math.max(1, Math.min(99, Number(next || 1)));
        if (qtyValue) qtyValue.textContent = String(qty);
    }

    function syncFavState() {
        if (!favBtn || !window.Favorites || typeof window.Favorites.has !== "function") return;
        favBtn.classList.toggle("is-active", window.Favorites.has(product.id));
    }

    function bindActions() {
        if (qtyMinus) qtyMinus.addEventListener("click", () => setQty(qty - 1));
        if (qtyPlus) qtyPlus.addEventListener("click", () => setQty(qty + 1));

        function cartPayload(q) {
            const sizes = Array.isArray(product.sizes) ? product.sizes : [];
            const ring =
                product.categoryId === "rings" || product.categoryId === "engagement";
            const sel =
                ring && sizeSelect && sizes.length ? String(sizeSelect.value || "") : "";
            return {
                id: product.id,
                name: product.name,
                price: product.currentPrice,
                imageUrl: product.imageUrl,
                oldPrice: product.oldPrice,
                categoryId: product.categoryId,
                size: sel,
                qty: q,
            };
        }

        if (addBtn) {
            addBtn.addEventListener("click", () => {
                if (!window.Cart || typeof window.Cart.addItem !== "function") return;
                window.Cart.addItem(cartPayload(qty));
            });
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener("click", () => {
                if (!window.Cart || typeof window.Cart.addItem !== "function") return;
                window.Cart.addItem(cartPayload(qty));
                if (typeof window.Cart.open === "function") window.Cart.open();
            });
        }

        if (favBtn) {
            favBtn.addEventListener("click", () => {
                if (!window.Favorites || typeof window.Favorites.toggle !== "function") return;
                window.Favorites.toggle({
                    id: product.id,
                    name: product.name,
                    price: product.currentPrice,
                    imageUrl: product.imageUrl,
                });
                syncFavState();
            });
        }

        document.addEventListener("favorites:updated", syncFavState);
        syncFavState();
    }

    function renderReviews() {
        if (!reviewsEl) return;
        const list = Array.isArray(product.reviews) ? product.reviews : [];
        reviewsEl.innerHTML = "";
        list.forEach((r) => {
            const el = document.createElement("div");
            el.className = "review-card";

            const header = document.createElement("div");
            header.className = "review-header";

            const avatar = document.createElement("img");
            avatar.className = "review-avatar";
            avatar.src = r.avatar || "./icon/reviews-user.png";
            avatar.alt = r.author || "Пользователь";

            const nameEl = document.createElement("div");
            nameEl.className = "review-author";
            nameEl.textContent = r.author || "Пользователь";

            header.appendChild(avatar);
            header.appendChild(nameEl);

            const textEl = document.createElement("div");
            textEl.className = "review-text";
            textEl.textContent = r.text || "";

            const starsEl = document.createElement("div");
            starsEl.className = "review-stars";
            const rating = Math.max(0, Math.min(5, Number(r.rating || 0)));
            for (let i = 0; i < 5; i += 1) {
                const star = document.createElement("span");
                star.classList.add("star-icon");
                if (i < rating) star.classList.add("star-filled");
                starsEl.appendChild(star);
            }

            el.appendChild(header);
            el.appendChild(textEl);
            el.appendChild(starsEl);
            reviewsEl.appendChild(el);
        });
    }

    function renderRelated() {
        if (!relatedGrid || !window.createProductCard) return;
        const related = window.CATALOG_PRODUCTS
            .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
            .slice(0, 4);

        const fallback = window.CATALOG_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
        const items = related.length ? related : fallback;

        relatedGrid.innerHTML = "";
        items.forEach((p) => relatedGrid.appendChild(window.createProductCard(p)));
    }

    renderMedia();
    renderInfo();
    renderSizes();
    setQty(1);
    bindActions();
    renderReviews();
    renderRelated();
})();

