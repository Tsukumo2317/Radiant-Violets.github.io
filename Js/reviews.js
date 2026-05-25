const DEFAULT_REVIEWS = [
    {
        name: "Ральф Эдвардс",
        text: "«Роскошь и элегантность в каждом изделии!» Внимание к деталям просто захватывает дух — это настоящие произведения искусства.",
        stars: 5,
        avatar: "icon/reviews-user.png"   // укажите путь к фото (или оставьте пустым)
    },
    {
        name: "Элеонор Пена",
        text: "«Идеальный подарок для близких!» Виртуозная работа и безупречное исполнение делают каждую вещь памятным подарком на всю жизнь.",
        stars: 5,
        avatar: "icon/reviews-user.png"
    },
    {
        name: "Маргарет Уилсон",
        text: "Очень довольна покупкой! Серьги выглядят ещё лучше, чем на фото. Доставка быстрая, упаковка шикарная. Обязательно вернусь ещё.",
        stars: 5,
        avatar: "icon/reviews-user.png"
    },
    {
        name: "Александр Ковальчук",
        text: "Заказывал кольцо в подарок — качество выше всяких похвал. Отдельное спасибо консультантам за помощь с выбором.",
        stars: 4,
        avatar: "icon/reviews-user.png"
    }
];

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    // Верхняя часть: аватар + имя
    const header = document.createElement('div');
    header.className = 'review-header';

    const avatar = document.createElement('img');
    avatar.className = 'review-avatar';
    if (review.avatar && review.avatar.trim() !== '') {
        avatar.src = review.avatar;
        avatar.alt = review.name;
    } else {
        avatar.src = 'https://via.placeholder.com/40x40?text=User'; // плейсхолдер
        avatar.alt = 'Аватар';
    }

    const nameEl = document.createElement('div');
    nameEl.className = 'review-author';
    nameEl.textContent = review.name;

    header.appendChild(avatar);
    header.appendChild(nameEl);

    // Текст отзыва
    const textEl = document.createElement('div');
    textEl.className = 'review-text';
    textEl.textContent = review.text;

    // Звёзды (с возможностью замены на свои иконки)
    const starsEl = document.createElement('div');
starsEl.className = 'review-stars';

for (let i = 0; i < 5; i++) {
    const star = document.createElement('span'); // используем span, чтобы не было наследования шрифта
    star.classList.add('star-icon');
    if (i < review.stars) {
        star.classList.add('star-filled');
    } else {
        star.classList.add('star-empty');
    }
    starsEl.appendChild(star);
}

    card.appendChild(header);
    card.appendChild(textEl);
    card.appendChild(starsEl);
    return card;
}

function getReviewsForSlider() {
    const custom =
        window.SiteReviews && typeof SiteReviews.getAll === "function"
            ? SiteReviews.getAll().map((r) => ({
                  name: r.name || r.productName || "Покупатель",
                  text: r.text || "",
                  stars: r.stars || 5,
                  avatar: r.avatar || "icon/reviews-user.png",
              }))
            : [];
    return [...custom, ...DEFAULT_REVIEWS];
}

function renderReviews() {
    const track = document.getElementById('sliderTrack');
    if (!track) return;
    track.innerHTML = '';
    getReviewsForSlider().forEach((r) => track.appendChild(createReviewCard(r)));
    initSlider();
}

// Логика слайдера (без изменений)
let currentIndex = 0;
let visibleCards = 1;

function getVisibleCardsCount() {
    const wrapper = document.querySelector('.slider-wrapper');
    if (!wrapper) return 1;
    const containerWidth = wrapper.clientWidth;
    const card = document.querySelector('.review-card');
    if (!card) return 1;
    const cardWidth = card.offsetWidth;
    const gap = 24;
    if (containerWidth >= cardWidth * 2 + gap) return 2;
    return 1;
}

function updateSlider() {
    const track = document.getElementById('sliderTrack');
    if (!track) return;
    const cards = track.children;
    if (cards.length === 0) return;

    const totalCards = cards.length;
    const maxIndex = Math.max(0, totalCards - visibleCards);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const card = cards[0];
    const cardWidth = card.offsetWidth;
    const gap = 24;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    const prevBtn = document.getElementById('prevReviewBtn');
    const nextBtn = document.getElementById('nextReviewBtn');
    if (prevBtn) prevBtn.disabled = (currentIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentIndex >= maxIndex);
}

function nextSlide() {
    const totalCards = document.getElementById('sliderTrack')?.children.length || 0;
    const maxIndex = Math.max(0, totalCards - visibleCards);
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
    }
}

function initSlider() {
    visibleCards = getVisibleCardsCount();
    currentIndex = 0;
    updateSlider();
}

window.addEventListener('load', () => {
    renderProducts();
    renderReviews();
    const prevBtn = document.getElementById('prevReviewBtn');
    const nextBtn = document.getElementById('nextReviewBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    window.addEventListener('resize', () => {
        visibleCards = getVisibleCardsCount();
        updateSlider();
    });
});