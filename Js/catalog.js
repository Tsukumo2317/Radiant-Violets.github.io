(function () {
    const grid = document.getElementById("catalogGrid");
    const countEl = document.getElementById("catalogCount");
    const sortEl = document.getElementById("catalogSort");
    const searchField = document.getElementById("catalogSearchField");
    const btnGrid = document.getElementById("viewGridBtn");
    const btnList = document.getElementById("viewListBtn");
    const filterToggle = document.getElementById("filterToggleBtn");
    const filterClose = document.getElementById("filterCloseBtn");
    const filterBackdrop = document.getElementById("filterBackdrop");
    const sidebar = document.getElementById("catalogSidebar");
    const priceMinEl = document.getElementById("priceMin");
    const priceMaxEl = document.getElementById("priceMax");
    const priceLabel = document.getElementById("priceRangeLabel");

    if (!grid || !window.CATALOG_PRODUCTS || !window.createProductCard || !window.CATALOG_FILTER_CONFIG) {
        return;
    }

    const products = window.CATALOG_PRODUCTS.slice();
    const cfg = window.CATALOG_FILTER_CONFIG;
    const PRICE_MAX = cfg.priceMax || 200000;

    const state = {
        categories: new Set(),
        cuts: new Set(),
        sizes: new Set(),
        priceMin: 0,
        priceMax: PRICE_MAX,
        sort: "popularity",
        query: "",
        view: "grid",
    };

    function countBy(keyFn) {
        const map = new Map();
        products.forEach((p) => {
            const k = keyFn(p);
            map.set(k, (map.get(k) || 0) + 1);
        });
        return map;
    }

    function syncPriceInputs() {
        let a = Number(priceMinEl?.value || 0);
        let b = Number(priceMaxEl?.value || PRICE_MAX);
        if (a > b) [a, b] = [b, a];
        state.priceMin = a;
        state.priceMax = b;
        if (priceLabel) {
            const fmt = (n) => Number(n).toLocaleString("ru-RU");
            priceLabel.textContent = `Цена: ${fmt(a)} — ${fmt(b)} ₽`;
        }
    }

    function bindPriceSliders() {
        if (!priceMinEl || !priceMaxEl) return;
        const onInput = () => {
            let min = Number(priceMinEl.value);
            let max = Number(priceMaxEl.value);
            if (min > max) {
                if (priceMinEl === document.activeElement) priceMaxEl.value = String(min);
                else priceMinEl.value = String(max);
                min = Number(priceMinEl.value);
                max = Number(priceMaxEl.value);
            }
            syncPriceInputs();
            applyFilters();
        };
        priceMinEl.addEventListener("input", onInput);
        priceMaxEl.addEventListener("input", onInput);
        syncPriceInputs();
    }

    function readCheckboxes(container, targetSet, attrName) {
        targetSet.clear();
        container.querySelectorAll(`input[type="checkbox"][data-${attrName}]:checked`).forEach((cb) => {
            targetSet.add(cb.getAttribute(`data-${attrName}`));
        });
    }

    function collectFiltersFromDom() {
        readCheckboxes(document.getElementById("filterCategories"), state.categories, "category");
        readCheckboxes(document.getElementById("filterCuts"), state.cuts, "cut");
        readCheckboxes(document.getElementById("filterSizes"), state.sizes, "size");
        syncPriceInputs();
    }

    function productMatches(p) {
        if (state.query) {
            const q = state.query.toLowerCase();
            if (!String(p.name).toLowerCase().includes(q)) return false;
        }
        if (state.categories.size && !state.categories.has(p.categoryId)) return false;
        if (state.cuts.size && !state.cuts.has(p.cutId)) return false;
        if (state.sizes.size && !state.sizes.has(String(p.size))) return false;
        const price = Number(p.currentPrice);
        if (price < state.priceMin || price > state.priceMax) return false;
        return true;
    }

    function sortList(list) {
        const out = list.slice();
        switch (state.sort) {
            case "price-asc":
                return out.sort((a, b) => a.currentPrice - b.currentPrice);
            case "price-desc":
                return out.sort((a, b) => b.currentPrice - a.currentPrice);
            case "name":
                return out.sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
            default:
                return out.sort((a, b) => a.id - b.id);
        }
    }

    function applyFilters() {
        collectFiltersFromDom();
        if (searchField) state.query = (searchField.value || "").trim().toLowerCase();

        let filtered = products.filter(productMatches);
        filtered = sortList(filtered);

        grid.innerHTML = "";
        filtered.forEach((p) => grid.appendChild(window.createProductCard(p)));

        const total = filtered.length;
        const all = products.length;
        if (countEl) {
            if (total === 0) {
                countEl.textContent = "Ничего не найдено";
            } else {
                countEl.textContent = `Показано 1–${total} из ${all} результатов`;
            }
        }

        document.dispatchEvent(new CustomEvent("favorites:updated"));
    }

    function setView(mode) {
        state.view = mode;
        grid.classList.toggle("is-list", mode === "list");
        if (btnGrid) btnGrid.classList.toggle("is-active", mode === "grid");
        if (btnList) btnList.classList.toggle("is-active", mode === "list");
    }

    function openFiltersMobile() {
        document.body.classList.add("catalog-filters-open");
    }

    function closeFiltersMobile() {
        document.body.classList.remove("catalog-filters-open");
    }

    function initFiltersUI() {
        const catRoot = document.getElementById("filterCategories");
        const cutRoot = document.getElementById("filterCuts");
        const sizeRoot = document.getElementById("filterSizes");

        const catCounts = countBy((p) => p.categoryId);
        cfg.categories.forEach((c) => {
            const n = catCounts.get(c.id) || 0;
            const label = document.createElement("label");
            label.className = "filter-check";
            label.innerHTML = `<input type="checkbox" data-category="${c.id}"> <span>${c.label}</span> <span class="filter-count">(${n})</span>`;
            catRoot.appendChild(label);
        });

        const cutCounts = countBy((p) => p.cutId);
        cfg.cuts.forEach((c) => {
            const n = cutCounts.get(c.id) || 0;
            const label = document.createElement("label");
            label.className = "filter-check filter-check--cut";
            label.innerHTML = `<input type="checkbox" data-cut="${c.id}"> <span class="filter-cut-dot" data-cut="${c.id}"></span><span>${c.label}</span> <span class="filter-count">(${n})</span>`;
            cutRoot.appendChild(label);
        });

        const sizeCounts = countBy((p) => String(p.size));
        cfg.sizes.forEach((s) => {
            const n = sizeCounts.get(String(s)) || 0;
            const label = document.createElement("label");
            label.className = "filter-check";
            label.innerHTML = `<input type="checkbox" data-size="${s}"> <span>${s}</span> <span class="filter-count">(${n})</span>`;
            sizeRoot.appendChild(label);
        });

        document.querySelectorAll("#filterCategories input, #filterCuts input, #filterSizes input").forEach((el) => {
            el.addEventListener("change", applyFilters);
        });
    }

    function readUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const q = (params.get("q") || "").trim();
        if (q && searchField) searchField.value = q;
        state.query = q.toLowerCase();

        const cat = params.get("category");
        if (cat) {
            const cb = document.querySelector(`#filterCategories input[data-category="${cat}"]`);
            if (cb) cb.checked = true;
        }
    }

    if (sortEl) sortEl.addEventListener("change", () => {
        state.sort = sortEl.value;
        applyFilters();
    });

    if (searchField) {
        let t;
        searchField.addEventListener("input", () => {
            clearTimeout(t);
            t = setTimeout(applyFilters, 220);
        });
    }

    if (btnGrid) btnGrid.addEventListener("click", () => setView("grid"));
    if (btnList) btnList.addEventListener("click", () => setView("list"));

    if (filterToggle) filterToggle.addEventListener("click", openFiltersMobile);
    if (filterClose) filterClose.addEventListener("click", closeFiltersMobile);
    if (filterBackdrop) filterBackdrop.addEventListener("click", closeFiltersMobile);

    initFiltersUI();
    bindPriceSliders();
    readUrlParams();
    setView("grid");
    applyFilters();

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) closeFiltersMobile();
    });

    document.addEventListener("favorites:updated", () => {
        if (!window.Favorites || typeof window.Favorites.has !== "function") return;
        document.querySelectorAll("#catalogGrid .product-card").forEach((card) => {
            const id = card?.dataset?.id;
            const favBtn = card.querySelector(".favorite-btn");
            if (!id || !favBtn) return;
            favBtn.classList.toggle("active", window.Favorites.has(id));
        });
    });
})();
