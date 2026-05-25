function renderProducts() {
    const gridContainer = document.getElementById("productsGrid");
    if (!gridContainer || !window.CATALOG_PRODUCTS || !window.createProductCard) return;
    gridContainer.innerHTML = "";
    window.CATALOG_PRODUCTS.forEach((product) => {
        gridContainer.appendChild(window.createProductCard(product));
    });
}

renderProducts();

document.addEventListener("favorites:updated", () => {
    if (!window.Favorites || typeof window.Favorites.has !== "function") return;
    document.querySelectorAll(".product-card").forEach((card) => {
        const id = card?.dataset?.id;
        const favBtn = card.querySelector(".favorite-btn");
        if (!id || !favBtn) return;
        favBtn.classList.toggle("active", window.Favorites.has(id));
    });
});
