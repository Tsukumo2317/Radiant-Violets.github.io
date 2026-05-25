(function () {
    const overlay = document.getElementById("searchOverlay");
    const input = document.getElementById("searchInput");
    const form = document.getElementById("searchForm");
    const closeBtn = document.querySelector(".search-close");
    const triggers = document.querySelectorAll(".nav_item_search");

    if (!overlay || !input || !form) return;

    function openSearch() {
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        setTimeout(() => input.focus(), 50);
    }

    function closeSearch() {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        const cartOpen = document.getElementById("cartOverlay")?.classList.contains("active");
        const favOpen = document.getElementById("favOverlay")?.classList.contains("active");
        document.body.style.overflow = cartOpen || favOpen ? "hidden" : "";
    }

    triggers.forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            openSearch();
        });
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openSearch();
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeSearch);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeSearch();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("active")) closeSearch();
    });

    form.addEventListener("submit", (e) => {
        const q = (input.value || "").trim();
        if (!q) {
            e.preventDefault();
            input.focus();
        }
    });
})();
