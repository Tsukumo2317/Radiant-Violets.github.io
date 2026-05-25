(function () {
    function formatPrice(price) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(price);
        }
        return (
            Number(price || 0)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽"
        );
    }

    function createProductCard(product) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;
        card.style.cursor = "pointer";

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "product-image-wrapper";

        if (product.imageUrl) {
            const img = document.createElement("img");
            img.src = product.imageUrl;
            img.alt = product.name;
            img.loading = "lazy";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            imageWrapper.appendChild(img);
        } else {
            const imgPlaceholder = document.createElement("div");
            imgPlaceholder.className = "product-img-placeholder";
            const iconElem = document.createElement("i");
            iconElem.className = product.imageIcon || "fas fa-gem";
            imgPlaceholder.appendChild(iconElem);
            imageWrapper.appendChild(imgPlaceholder);
        }

        const actionsBlock = document.createElement("div");
        actionsBlock.className = "product-actions";

        const favBtn = document.createElement("button");
        favBtn.type = "button";
        favBtn.className = "action-btn favorite-btn";
        favBtn.innerHTML =
            '<img src="./icon/favourite-btn-icon.png" alt="" aria-hidden="true">';
        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const nextActive =
                window.Favorites && typeof window.Favorites.toggle === "function"
                    ? window.Favorites.toggle({
                          id: product.id,
                          name: product.name,
                          price: product.currentPrice,
                          imageUrl: product.imageUrl,
                      })
                    : !favBtn.classList.contains("active");
            favBtn.classList.toggle("active", nextActive);
        });

        if (window.Favorites && typeof window.Favorites.has === "function") {
            favBtn.classList.toggle("active", window.Favorites.has(product.id));
        }

        const cartBtn = document.createElement("button");
        cartBtn.type = "button";
        cartBtn.className = "action-btn add-to-cart";
        cartBtn.innerHTML =
            '<span class="cart-btn-text">Добавить в корзину</span>';
        cartBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.Cart && typeof window.Cart.addItem === "function") {
                window.Cart.addItem({
                    id: product.id,
                    name: product.name,
                    price: product.currentPrice,
                    imageUrl: product.imageUrl,
                    oldPrice: product.oldPrice,
                    categoryId: product.categoryId,
                });
            } else {
                alert(`Товар "${product.name}" добавлен в корзину!`);
            }
        });

        actionsBlock.appendChild(favBtn);
        actionsBlock.appendChild(cartBtn);

        const infoBlock = document.createElement("div");
        infoBlock.className = "product-info";

        const title = document.createElement("h3");
        title.className = "product-title";
        title.textContent = product.name;

        const priceBlock = document.createElement("div");
        priceBlock.className = "price-block";

        const currentSpan = document.createElement("span");
        currentSpan.className = "current-price";
        currentSpan.textContent = formatPrice(product.currentPrice);

        const oldSpan = document.createElement("span");
        oldSpan.className = "old-price";
        oldSpan.textContent = formatPrice(product.oldPrice);

        priceBlock.appendChild(currentSpan);
        priceBlock.appendChild(oldSpan);
        infoBlock.appendChild(title);
        infoBlock.appendChild(priceBlock);

        if (Array.isArray(product.metals) && product.metals.length) {
            const sw = document.createElement("div");
            sw.className = "product-swatches";
            product.metals.forEach((m) => {
                const d = document.createElement("span");
                d.className = "product-swatch product-swatch--" + m;
                d.setAttribute("aria-hidden", "true");
                sw.appendChild(d);
            });
            infoBlock.appendChild(sw);
        }

        card.appendChild(imageWrapper);
        card.appendChild(actionsBlock);
        card.appendChild(infoBlock);

        card.addEventListener("click", () => {
            window.location.href = `./product.html?id=${encodeURIComponent(product.id)}`;
        });

        return card;
    }

    window.createProductCard = createProductCard;
})();
