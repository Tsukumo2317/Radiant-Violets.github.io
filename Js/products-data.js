(function () {
    function formatPrice(price) {
        return Number(price || 0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
    }

    /**
     * categoryId: engagement | rings | necklaces | bracelets | earrings
     * cutId: round | princess | emerald | oval | pear | heart | cushion
     * size: условный размер (как в фильтре)
     * metals: gold | white | silver — для кружков под ценой
     */
    const BASE_CATALOG_PRODUCTS = [
        {
            id: 1,
            name: "Золотое кольцо с бриллиантом выращенным",
            currentPrice: 43000,
            oldPrice: 50000,
            imageUrl: "./Товары/Кольца/SMART DIAMONDS (Принцесса)/1.jpg",
            categoryId: "rings",
            cutId: "princess",
            size: 17,
            metals: ["gold", "white"],
            stock: 3,
            sku: "RV-RG-001",
            description:
                "Кольцо с выращенным бриллиантом в аккуратной оправе. Модель рассчитана на повседневную носку и торжественные случаи.",
        },
        {
            id: 2,
            name: "Золотое кольцо с гранатом",
            currentPrice: 20990,
            oldPrice: 25000,
            imageUrl: "./Товары/Кольца/Золотое кольцо с гранатом (Овал)/1.jpg",
            categoryId: "rings",
            cutId: "oval",
            size: 16.5,
            metals: ["gold"],
            stock: 5,
            sku: "RV-RG-002",
            description:
                "Золотое кольцо с выразительным гранатом. Лаконичный дизайн и теплый оттенок металла подчеркивают камень.",
        },
        {
            id: 3,
            name: "Серебряный браслет с аметистами и фианитами",
            currentPrice: 5700,
            oldPrice: 8000,
            imageUrl: "./Товары/Браслеты/Серебряный браслет (Груша)/1.jpg",
            categoryId: "bracelets",
            cutId: "pear",
            size: 18,
            metals: ["silver"],
            stock: 4,
            sku: "RV-BR-001",
            description:
                "Легкий серебряный браслет с фианитами и акцентными аметистами. Подходит для ежедневного образа.",
        },
        {
            id: 4,
            name: "Золотой браслет с гранатом и фианитами",
            currentPrice: 49000,
            oldPrice: 75000,
            imageUrl: "./Товары/Браслеты/Золотой браслет с гранатом и фианитами (Круг)/1.jpg",
            categoryId: "bracelets",
            cutId: "round",
            size: 17.5,
            metals: ["gold", "white"],
            stock: 2,
            sku: "RV-BR-002",
            description:
                "Статусный браслет в золоте с гранатом. Контраст оттенков делает украшение заметным в любом образе.",
        },
        {
            id: 5,
            name: "Золотая подвеска с ситаллом и фианитами",
            currentPrice: 13200,
            oldPrice: 15000,
            imageUrl: "./Товары/Ожирелья/Золотая подвеска с ситаллом и фианитами (Изумруд)/1.jpg",
            categoryId: "necklaces",
            cutId: "emerald",
            size: 16,
            metals: ["gold"],
            stock: 7,
            sku: "RV-NK-001",
            description:
                "Подвеска с ситаллом изумрудной формы и дорожкой фианитов. Изящное украшение с мягким блеском.",
        },
        {
            id: 6,
            name: "Золотая подвеска с фианитами",
            currentPrice: 19000,
            oldPrice: 25000,
            imageUrl: "./Товары/Ожирелья/Золотая подвеска с фианитами (Круг)/1.jpg",
            categoryId: "necklaces",
            cutId: "round",
            size: 17,
            metals: ["gold", "white"],
            stock: 6,
            sku: "RV-NK-002",
            description:
                "Классическая подвеска с фианитами в круглой форме огранки. Универсальный вариант для подарка.",
        },
        {
            id: 7,
            name: "Золотые серьги с топазами Sky и фианитами",
            currentPrice: 12000,
            oldPrice: 13000,
            imageUrl: "./Товары/Серьги/Золотые серьги с топазами Sky и фианитами (Сердце)/1.jpg",
            categoryId: "earrings",
            cutId: "heart",
            size: 16,
            metals: ["gold"],
            stock: 8,
            sku: "RV-ER-001",
            description:
                "Серьги с топазами формы сердце и фианитами. Комфортная посадка и деликатный блеск.",
        },
        {
            id: 8,
            name: "Серебряные серьги с имитацией кварца и фианитами",
            currentPrice: 2500,
            oldPrice: 3000,
            imageUrl: "./Товары/Серьги/Серебряные серьги с имитацией кварца и фианитами (Подушка)/1.jpg",
            categoryId: "earrings",
            cutId: "cushion",
            size: 16.5,
            metals: ["silver", "white"],
            stock: 10,
            sku: "RV-ER-002",
            description:
                "Серебряные серьги с имитацией кварца формы подушка. Лаконичная пара на каждый день.",
        },
        {
            id: 9,
            name: "Золотое кольцо с бриллиантами",
            currentPrice: 24000,
            oldPrice: 26000,
            imageUrl: "./Товары/Помолвочные кольца/Золотое кольцо с бриллиантами (Круглая)/1.jpg",
            categoryId: "engagement",
            cutId: "round",
            size: 17,
            metals: ["gold", "white"],
            stock: 3,
            sku: "RV-EN-001",
            description:
                "Помолвочное кольцо с бриллиантами в классической круглой огранке. Выверенные пропорции и сияние.",
        },
        {
            id: 10,
            name: "Золотое кольцо с бриллиантами выращенными",
            currentPrice: 30300,
            oldPrice: 35000,
            imageUrl: "./Товары/Помолвочные кольца/Золотое кольцо с бриллиантами выращенными (Принцесса)/1.jpg",
            categoryId: "engagement",
            cutId: "princess",
            size: 16.5,
            metals: ["gold"],
            stock: 4,
            sku: "RV-EN-002",
            description:
                "Помолвочное кольцо с выращенными бриллиантами огранки принцесса. Элегантная геометрия и чистый свет.",
        },
    ];

    function createMediaFromImage(imageUrl, categoryId) {
        if (!imageUrl) return { images: [], videos: [] };
        const dot = imageUrl.lastIndexOf(".");
        const slash = imageUrl.lastIndexOf("/");
        if (dot < 0 || slash < 0) {
            return { images: [imageUrl], videos: [] };
        }
        const ext = imageUrl.slice(dot);
        const base = imageUrl.slice(0, slash);
        const byCategory = {
            rings: ["ring-vid-1.mp4", "ring-vid-2.mp4"],
            bracelets: ["bracelet-vid-1.mp4", "bracelet-vid-2.mp4"],
            necklaces: ["necklace-vid-1.mp4", "necklace-vid-2.mp4"],
            earrings: ["earrings-vid-1.mp4", "earrings-vid-2.mp4"],
            engagement: ["engagement ring-vid-1.mp4", "engagement ring-vid-2.mp4"],
        };
        const namedVideos = (byCategory[categoryId] || []).map((name) => `${base}/${name}`);
        return {
            images: [`${base}/1${ext}`, `${base}/2${ext}`, `${base}/3${ext}`, `${base}/4${ext}`],
            videos: [
                ...namedVideos,
                `${base}/1.mp4`,
                `${base}/2.mp4`,
                `${base}/3.mp4`,
                `${base}/4.mp4`,
                `${base}/1.webm`,
            ],
        };
    }

    function buildDefaultReviews(name) {
        return [
            {
                author: "Аннет Блэк",
                date: "25 февраля 2025",
                text: `«${name}» вживую выглядит еще лучше. Камни сияют аккуратно, посадка комфортная.`,
                rating: 5,
                avatar: "./icon/reviews-user.png",
            },
            {
                author: "Даррел Стюард",
                date: "25 февраля 2025",
                text: "Отличное качество и быстрая доставка. Упаковка аккуратная, идеально для подарка.",
                rating: 5,
                avatar: "./icon/reviews-user.png",
            },
        ];
    }

    function categoryLabelById(id) {
        const map = {
            engagement: "Помолвочные кольца",
            rings: "Кольца",
            necklaces: "Ожерелья и подвески",
            bracelets: "Браслеты",
            earrings: "Серьги",
        };
        return map[id] || "Украшения";
    }

    function parseArrayField(value) {
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value !== "string") return [];
        return value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    }

    function normalizeProduct(raw, fallbackId) {
        const id = Number(raw?.id);
        return {
            id: Number.isFinite(id) && id > 0 ? id : fallbackId,
            name: String(raw?.name || "").trim(),
            currentPrice: Number(raw?.currentPrice || 0),
            oldPrice: Number(raw?.oldPrice || 0),
            imageUrl: String(raw?.imageUrl || "").trim(),
            categoryId: String(raw?.categoryId || "rings").trim(),
            cutId: String(raw?.cutId || "round").trim(),
            size: Number(raw?.size || 0),
            metals: parseArrayField(raw?.metals),
            stock: Number(raw?.stock || 0),
            sku: String(raw?.sku || "").trim(),
            description: String(raw?.description || "").trim(),
            mediaImages: Array.isArray(raw?.mediaImages) ? raw.mediaImages.filter(Boolean) : [],
            mediaVideos: Array.isArray(raw?.mediaVideos) ? raw.mediaVideos.filter(Boolean) : [],
        };
    }

    function loadCustomProducts() {
        const key = "rv_custom_products_v1";
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || "[]");
            if (!Array.isArray(parsed)) return [];
            return parsed
                .map((raw, idx) => normalizeProduct(raw, 10000 + idx))
                .filter((p) => p.name && p.imageUrl && p.categoryId && p.cutId);
        } catch (err) {
            return [];
        }
    }

    const CATALOG_PRODUCTS = [...BASE_CATALOG_PRODUCTS, ...loadCustomProducts()];

    const ENRICHED_PRODUCTS = CATALOG_PRODUCTS.map((p) => {
        const media = createMediaFromImage(p.imageUrl, p.categoryId);
        return {
            ...p,
            mediaImages:
                Array.isArray(p.mediaImages) && p.mediaImages.length ? p.mediaImages : media.images,
            mediaVideos:
                Array.isArray(p.mediaVideos) && p.mediaVideos.length ? p.mediaVideos : media.videos,
            description:
                p.description ||
                "Украшение выполнено с вниманием к деталям и рассчитано на комфортную ежедневную носку.",
            reviews: Array.isArray(p.reviews) ? p.reviews : buildDefaultReviews(p.name),
            categoryLabel: categoryLabelById(p.categoryId),
            sizes: p.categoryId === "rings" || p.categoryId === "engagement" ? [16, 16.5, 17, 17.5, 18] : [],
            stock: typeof p.stock === "number" ? p.stock : 5,
            sku: p.sku || `RV-${String(p.id).padStart(4, "0")}`,
        };
    });

    window.formatPrice = formatPrice;
    window.CATALOG_PRODUCTS = ENRICHED_PRODUCTS;
    window.CATALOG_BASE_PRODUCTS = BASE_CATALOG_PRODUCTS.map((p) => ({ ...p }));

    window.CATALOG_FILTER_CONFIG = {
        categories: [
            { id: "engagement", label: "Помолвочные кольца" },
            { id: "rings", label: "Кольца" },
            { id: "necklaces", label: "Ожерелья" },
            { id: "bracelets", label: "Браслеты" },
            { id: "earrings", label: "Серьги" },
        ],
        cuts: [
            { id: "round", label: "Круглая" },
            { id: "princess", label: "Принцесса" },
            { id: "emerald", label: "Изумруд" },
            { id: "oval", label: "Овальная" },
            { id: "pear", label: "Груша" },
            { id: "heart", label: "Сердце" },
            { id: "cushion", label: "Подушка" },
        ],
        sizes: [16, 16.5, 17, 17.5, 18],
        priceMax: 200000,
    };
})();
