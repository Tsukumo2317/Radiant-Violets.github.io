(function () {
    if (!window.AdminAuth || !AdminAuth.isLoggedIn()) return;

    const STORAGE_KEY = "rv_custom_products_v1";
    const form = document.getElementById("adminProductForm");
    const list = document.getElementById("adminProductsList");
    const resetBtn = document.getElementById("adminResetBtn");
    const clearBtn = document.getElementById("adminClearAllBtn");
    const status = document.getElementById("adminStatus");

    if (!form || !list) return;

    function readStoredProducts() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    function writeStoredProducts(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function splitByLines(value) {
        return String(value || "")
            .split(/\r?\n/)
            .map((x) => x.trim())
            .filter(Boolean);
    }

    function splitByComma(value) {
        return String(value || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    }

    function getNextId() {
        const allIds = (Array.isArray(window.CATALOG_PRODUCTS) ? window.CATALOG_PRODUCTS : [])
            .map((p) => Number(p.id))
            .filter((n) => Number.isFinite(n));
        const maxId = allIds.length ? Math.max(...allIds) : 0;
        return maxId + 1;
    }

    function renderStatus(text, isError) {
        if (!status) return;
        status.textContent = text;
        status.classList.toggle("is-error", Boolean(isError));
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }

    function renderProducts() {
        const items = readStoredProducts();
        list.innerHTML = "";

        if (!items.length) {
            list.innerHTML = '<p class="admin-empty">Пока нет добавленных товаров.</p>';
            return;
        }

        items.forEach((p) => {
            const item = document.createElement("article");
            item.className = "admin-product-item";
            item.innerHTML = `
                <img src="${escapeHtml(p.imageUrl || "")}" alt="" class="admin-product-thumb">
                <div class="admin-product-meta">
                    <h3>${escapeHtml(p.name || "Без названия")}</h3>
                    <p>ID: ${escapeHtml(p.id)} | SKU: ${escapeHtml(p.sku || "-")}</p>
                    <p>Цена: ${Number(p.currentPrice || 0).toLocaleString("ru-RU")} ₽</p>
                    <p>Категория: ${escapeHtml(p.categoryId || "-")}, Огранка: ${escapeHtml(
                p.cutId || "-"
            )}</p>
                </div>
                <button type="button" class="admin-delete-btn" data-id="${escapeHtml(p.id)}">Удалить</button>
            `;
            list.appendChild(item);
        });

        list.querySelectorAll(".admin-delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = Number(btn.getAttribute("data-id"));
                const rest = readStoredProducts().filter((p) => Number(p.id) !== id);
                writeStoredProducts(rest);
                renderProducts();
                renderStatus("Товар удален. Обнови страницу каталога для применения.");
            });
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const record = {
            id: getNextId(),
            name: String(fd.get("name") || "").trim(),
            currentPrice: Number(fd.get("currentPrice") || 0),
            oldPrice: Number(fd.get("oldPrice") || 0),
            imageUrl: String(fd.get("imageUrl") || "").trim(),
            categoryId: String(fd.get("categoryId") || "rings"),
            cutId: String(fd.get("cutId") || "round"),
            size: Number(fd.get("size") || 0),
            metals: splitByComma(fd.get("metals")),
            stock: Number(fd.get("stock") || 0),
            sku: String(fd.get("sku") || "").trim(),
            description: String(fd.get("description") || "").trim(),
            mediaImages: splitByLines(fd.get("mediaImages")),
            mediaVideos: splitByLines(fd.get("mediaVideos")),
        };

        if (!record.name || !record.imageUrl) {
            renderStatus("Заполни минимум: название и главное фото (imageUrl).", true);
            return;
        }

        const items = readStoredProducts();
        items.push(record);
        writeStoredProducts(items);
        renderProducts();
        form.reset();
        renderStatus(
            "Товар добавлен. Он появится в каталоге после перезагрузки страницы каталога."
        );
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            form.reset();
            renderStatus("Форма очищена.");
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (!confirm("Удалить все товары, добавленные через CMS?")) return;
            localStorage.removeItem(STORAGE_KEY);
            renderProducts();
            renderStatus("Все пользовательские товары удалены.");
        });
    }

    renderProducts();
})();
