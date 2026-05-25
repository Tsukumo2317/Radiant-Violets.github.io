const inspirationImages = [
    { src: "img/Вдохновляйтесь/img1.png", alt: "Ювелирное украшение 1" },
    { src: "img/Вдохновляйтесь/img2.png", alt: "Ювелирное украшение 2" },
    { src: "img/Вдохновляйтесь/img3.png", alt: "Ювелирное украшение 3" },
    { src: "img/Вдохновляйтесь/img4.png", alt: "Ювелирное украшение 4" },
    { src: "img/Вдохновляйтесь/img1.png", alt: "Ювелирное украшение 5" },
    { src: "img/Вдохновляйтесь/img2.png", alt: "Ювелирное украшение 5" },
    { src: "img/Вдохновляйтесь/img3.png", alt: "Ювелирное украшение 5" },
    { src: "img/Вдохновляйтесь/img4.png", alt: "Ювелирное украшение 5" },
    // Добавьте свои фото
];

function createInspirationCard(imgData) {
    const card = document.createElement('div');
    card.className = 'inspiration-card';
    const img = document.createElement('img');
    img.src = imgData.src;
    img.alt = imgData.alt;
    card.appendChild(img);
    return card;
}

function renderInspiration() {
    const track = document.getElementById('inspirationTrack');
    if (!track) return;
    track.innerHTML = '';
    inspirationImages.forEach(img => {
        track.appendChild(createInspirationCard(img));
    });
    initInspirationSlider();
}

// Логика слайдера для вдохновения
let currentInspirationIndex = 0;
let visibleInspirationCards = 1;

function getVisibleInspirationCount() {
    const wrapper = document.querySelector('.inspiration-container .slider-wrapper');
    if (!wrapper) return 1;
    const containerWidth = wrapper.clientWidth;
    const card = document.querySelector('.inspiration-card');
    if (!card) return 1;
    const cardWidth = card.offsetWidth;
    const gap = 24; // gap между карточками
    if (containerWidth >= cardWidth * 2 + gap) return 2;
    return 1;
}

function updateInspirationSlider() {
    const track = document.getElementById('inspirationTrack');
    if (!track) return;
    const cards = track.children;
    if (cards.length === 0) return;

    const total = cards.length;
    const maxIndex = Math.max(0, total - visibleInspirationCards);
    if (currentInspirationIndex > maxIndex) currentInspirationIndex = maxIndex;
    if (currentInspirationIndex < 0) currentInspirationIndex = 0;

    const card = cards[0];
    const cardWidth = card.offsetWidth;
    const gap = 24;
    const offset = currentInspirationIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    const prevBtn = document.getElementById('prevInspirationBtn');
    const nextBtn = document.getElementById('nextInspirationBtn');
    if (prevBtn) prevBtn.disabled = (currentInspirationIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentInspirationIndex >= maxIndex);
}

function nextInspiration() {
    const total = document.getElementById('inspirationTrack')?.children.length || 0;
    const maxIndex = Math.max(0, total - visibleInspirationCards);
    if (currentInspirationIndex < maxIndex) {
        currentInspirationIndex++;
        updateInspirationSlider();
    }
}

function prevInspiration() {
    if (currentInspirationIndex > 0) {
        currentInspirationIndex--;
        updateInspirationSlider();
    }
}

function initInspirationSlider() {
    visibleInspirationCards = getVisibleInspirationCount();
    currentInspirationIndex = 0;
    updateInspirationSlider();
}

// Обновляем window.addEventListener, чтобы инициализировать все слайдеры
window.addEventListener('load', () => {
    renderProducts();
    renderReviews();
    renderInspiration();

    // События для отзывов
    const prevReview = document.getElementById('prevReviewBtn');
    const nextReview = document.getElementById('nextReviewBtn');
    if (prevReview) prevReview.addEventListener('click', prevSlide);
    if (nextReview) nextReview.addEventListener('click', nextSlide);

    // События для вдохновения
    const prevInsp = document.getElementById('prevInspirationBtn');
    const nextInsp = document.getElementById('nextInspirationBtn');
    if (prevInsp) prevInsp.addEventListener('click', prevInspiration);
    if (nextInsp) nextInsp.addEventListener('click', nextInspiration);

    // Ресайз для всех слайдеров
    window.addEventListener('resize', () => {
        // Обновляем видимые карточки для отзывов
        visibleCards = getVisibleCardsCount();
        updateSlider();
        // Обновляем для вдохновения
        visibleInspirationCards = getVisibleInspirationCount();
        updateInspirationSlider();
    });
});