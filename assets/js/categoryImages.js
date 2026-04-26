/**
 * categoryImages.js
 * Maps each post category to its 10 local images.
 * Exposes: window.getCategoryImage(category, postId)
 *   - Returns a stable random image path for a given post
 *     (same post always gets the same image within a session).
 */

const CATEGORY_IMAGE_MAP = {
    "AI": [
        "assets/images/AI/AI0.jpeg",
        "assets/images/AI/AI1.avif",
        "assets/images/AI/AI2.avif",
        "assets/images/AI/AI3.jpg",
        "assets/images/AI/AI4.avif",
        "assets/images/AI/AI5.jpg",
        "assets/images/AI/AI6.jpg",
        "assets/images/AI/AI7.jpg",
        "assets/images/AI/AI8.jpg",
        "assets/images/AI/AI9.webp"
    ],
    "Automotive": [
        "assets/images/Automotive/auto0.webp",
        "assets/images/Automotive/auto1.jpg",
        "assets/images/Automotive/auto2.webp",
        "assets/images/Automotive/auto3.webp",
        "assets/images/Automotive/auto4.jpg",
        "assets/images/Automotive/auto5.webp",
        "assets/images/Automotive/auto6.jpg",
        "assets/images/Automotive/auto7.jpg",
        "assets/images/Automotive/auto8.jpg",
        "assets/images/Automotive/auto9.jpg"
    ],
    "IOT": [
        "assets/images/IOT/IOT0.jpg",
        "assets/images/IOT/IOT1.jpg",
        "assets/images/IOT/IOT2.webp",
        "assets/images/IOT/IOT3.jpg",
        "assets/images/IOT/IOT4.jpg",
        "assets/images/IOT/IOT5.jpg",
        "assets/images/IOT/IOT6.png",
        "assets/images/IOT/IOT7.jpg",
        "assets/images/IOT/IOT8.webp",
        "assets/images/IOT/IOT9.jpg"
    ],
    "defence and security": [
        "assets/images/defence and security/DS0.jpeg",
        "assets/images/defence and security/DS1.jpg",
        "assets/images/defence and security/DS2.webp",
        "assets/images/defence and security/DS3.jpg",
        "assets/images/defence and security/DS4.avif",
        "assets/images/defence and security/DS5.jpeg",
        "assets/images/defence and security/DS6.jpg",
        "assets/images/defence and security/DS7.webp",
        "assets/images/defence and security/DS8.jpg",
        "assets/images/defence and security/DS9.jpg"
    ],
    "educational updates": [
        "assets/images/educational updates/ED0.png",
        "assets/images/educational updates/ED1.webp",
        "assets/images/educational updates/ED2.jpg",
        "assets/images/educational updates/ED3.jpeg",
        "assets/images/educational updates/ED4.avif",
        "assets/images/educational updates/ED5.jpg",
        "assets/images/educational updates/ED6.jpg",
        "assets/images/educational updates/ED7.webp",
        "assets/images/educational updates/ED8.avif",
        "assets/images/educational updates/ED9.avif"
    ],
    "environmet and climate": [
        "assets/images/environmet and climate/EC0.jpg",
        "assets/images/environmet and climate/EC1.jpg",
        "assets/images/environmet and climate/EC2.jpg",
        "assets/images/environmet and climate/EC3.webp",
        "assets/images/environmet and climate/EC4.avif",
        "assets/images/environmet and climate/EC5.jpg",
        "assets/images/environmet and climate/EC6.jpg",
        "assets/images/environmet and climate/EC7.jpg",
        "assets/images/environmet and climate/EC8.jpg",
        "assets/images/environmet and climate/EC9.jpg"
    ],
    "exam result": [
        "assets/images/exam result/ER0.jpg",
        "assets/images/exam result/ER1.webp",
        "assets/images/exam result/ER2.jpeg",
        "assets/images/exam result/ER3.jpg",
        "assets/images/exam result/ER4.jpg",
        "assets/images/exam result/ER5.jpg",
        "assets/images/exam result/ER6.avif",
        "assets/images/exam result/ER7.avif",
        "assets/images/exam result/ER8.avif",
        "assets/images/exam result/ER9.avif"
    ],
    "finance": [
        "assets/images/finance/finance0.png",
        "assets/images/finance/finance1.jpg",
        "assets/images/finance/finance2.jpg",
        "assets/images/finance/finance3.jpg",
        "assets/images/finance/finance4.jpg",
        "assets/images/finance/finance5.webp",
        "assets/images/finance/finance6.webp",
        "assets/images/finance/finance7.jpg",
        "assets/images/finance/finance8.webp",
        "assets/images/finance/finance9.avif"
    ],
    "health and wellness": [
        "assets/images/health and wellness/HW0.jpg",
        "assets/images/health and wellness/HW1.webp",
        "assets/images/health and wellness/HW2.png",
        "assets/images/health and wellness/HW3.jpg",
        "assets/images/health and wellness/HW4.webp",
        "assets/images/health and wellness/HW5.avif",
        "assets/images/health and wellness/HW6.webp",
        "assets/images/health and wellness/HW7.jpg",
        "assets/images/health and wellness/HW8.webp",
        "assets/images/health and wellness/HW9.jpg"
    ],
    "jobs and career": [
        "assets/images/jobs and career/JC0.jpg",
        "assets/images/jobs and career/JC1.jpg",
        "assets/images/jobs and career/JC2.webp",
        "assets/images/jobs and career/JC3.jpg",
        "assets/images/jobs and career/JC4.webp",
        "assets/images/jobs and career/JC5.jpg",
        "assets/images/jobs and career/JC6.avif",
        "assets/images/jobs and career/JC7.avif",
        "assets/images/jobs and career/JC8.avif",
        "assets/images/jobs and career/JC9.avif"
    ],
    "medical science": [
        "assets/images/medical science/MS0.webp",
        "assets/images/medical science/MS1.jpeg",
        "assets/images/medical science/MS2.jpg",
        "assets/images/medical science/MS3.jpg",
        "assets/images/medical science/MS4.webp",
        "assets/images/medical science/MS5.jpg",
        "assets/images/medical science/MS6.webp",
        "assets/images/medical science/MS7.avif",
        "assets/images/medical science/MS8.webp",
        "assets/images/medical science/MS9.webp"
    ],
    "others": [
        "assets/images/others/OTH0.jpeg",
        "assets/images/others/OTH1.png",
        "assets/images/others/OTH2.jpg",
        "assets/images/others/OTH3.png",
        "assets/images/others/OTH4.webp",
        "assets/images/others/OTH5.jpg",
        "assets/images/others/OTH6.png",
        "assets/images/others/OTH7.png",
        "assets/images/others/OTH8.webp",
        "assets/images/others/OTH9.jpg"
    ],
    "political affairs": [
        "assets/images/political affairs/PA0.jpg",
        "assets/images/political affairs/PA1.webp",
        "assets/images/political affairs/PA2.jpg",
        "assets/images/political affairs/PA3.jpeg",
        "assets/images/political affairs/PA4.jpg",
        "assets/images/political affairs/PA5.jpg",
        "assets/images/political affairs/PA6.jpg",
        "assets/images/political affairs/PA7.jpg",
        "assets/images/political affairs/PA8.webp",
        "assets/images/political affairs/PA9.jpeg"
    ],
    "product reviews": [
        "assets/images/product reviews/PR0.webp",
        "assets/images/product reviews/PR1.png",
        "assets/images/product reviews/PR2.webp",
        "assets/images/product reviews/PR3.avif",
        "assets/images/product reviews/PR4.jpg",
        "assets/images/product reviews/PR5.webp",
        "assets/images/product reviews/PR6.webp",
        "assets/images/product reviews/PR7.png",
        "assets/images/product reviews/PR8.jpg",
        "assets/images/product reviews/PR9.webp"
    ],
    "science and space": [
        "assets/images/science and space/SS0.jpg",
        "assets/images/science and space/SS1.webp",
        "assets/images/science and space/SS2.jpeg",
        "assets/images/science and space/SS3.jpg",
        "assets/images/science and space/SS4.jpg",
        "assets/images/science and space/SS5.jpg",
        "assets/images/science and space/SS6.jpg",
        "assets/images/science and space/SS7.jpg",
        "assets/images/science and space/SS8.jpg",
        "assets/images/science and space/SS9.jpeg"
    ],
    "software development": [
        "assets/images/software development/SD0.jpg",
        "assets/images/software development/SD1.jpeg",
        "assets/images/software development/SD1.jpg",
        "assets/images/software development/SD3.jpg",
        "assets/images/software development/SD4.jpg",
        "assets/images/software development/SD5.jpg",
        "assets/images/software development/SD6.jpg",
        "assets/images/software development/SD7.jpeg",
        "assets/images/software development/SD8.jpg",
        "assets/images/software development/SD9.jpg"
    ],
    "sports": [
        "assets/images/sports/SPRT0.avif",
        "assets/images/sports/SPRT1.jpg",
        "assets/images/sports/SPRT2.jpg",
        "assets/images/sports/SPRT3.jpg",
        "assets/images/sports/SPRT4.jpg",
        "assets/images/sports/SPRT5.jpg",
        "assets/images/sports/SPRT6.jpg",
        "assets/images/sports/SPRT7.jpg",
        "assets/images/sports/SPRT8.jpg",
        "assets/images/sports/SPRT9.jpeg"
    ],
    "viral news": [
        "assets/images/viral news/VN0.avif",
        "assets/images/viral news/VN1.png",
        "assets/images/viral news/VN2.jpg",
        "assets/images/viral news/VN3.png",
        "assets/images/viral news/VN4.webp",
        "assets/images/viral news/VN5.jpg",
        "assets/images/viral news/VN6.png",
        "assets/images/viral news/VN7.jpg",
        "assets/images/viral news/VN8.jpg",
        "assets/images/viral news/VN9.png"
    ],
    "world news": [
        "assets/images/world news/WN0.webp",
        "assets/images/world news/WN1.webp",
        "assets/images/world news/WN2.jpg",
        "assets/images/world news/WN3.avif",
        "assets/images/world news/WN4.jpg",
        "assets/images/world news/WN5.jpg",
        "assets/images/world news/WN6.jpg",
        "assets/images/world news/WN7.jpg",
        "assets/images/world news/WN8.webp",
        "assets/images/world news/WN9.avif"
    ]
};

/**
 * Maps every compose.html <option value="..."> to the correct CATEGORY_IMAGE_MAP key.
 * Add new aliases here whenever compose.html categories change.
 */
const CATEGORY_ALIAS = {
    // compose.html value       → CATEGORY_IMAGE_MAP key
    "study":                    "educational updates",
    "result":                   "exam result",
    "career":                   "jobs and career",
    "political":                "political affairs",
    "defence":                  "defence and security",
    "international":            "world news",
    "health":                   "health and wellness",
    "medical":                  "medical science",
    "sports":                   "sports",
    "finance":                  "finance",
    "products":                 "product reviews",
    "automotive":               "Automotive",
    "viral news":               "viral news",
    "environment":              "environmet and climate",
    "science":                  "science and space",
    "software development":     "software development",
    "iot":                      "IOT",
    "ai":                       "AI",
    "others":                   "others"
};

/**
 * Returns a stable image path for a post.
 * Uses the post ID to deterministically pick one of the 10 images
 * so the same post always shows the same image across pages.
 * Falls back to "others" if the category is unknown.
 *
 * @param {string} category - Post category string (from DB / compose.html value)
 * @param {string|number} postId - Unique post identifier
 * @returns {string} Relative image path
 */
function getCategoryImage(category, postId) {
    const key = String(category || "").toLowerCase().trim();

    // 1. Direct exact match (e.g. "AI", "IOT", "Automotive")
    // 2. Direct lowercase match (e.g. "sports", "finance")
    // 3. Alias lookup for compose.html shortcodes (e.g. "Study" -> "educational updates")
    // 4. Fall back to "others"
    const resolvedKey =
        CATEGORY_IMAGE_MAP[category]  ? category  :
        CATEGORY_IMAGE_MAP[key]       ? key        :
        CATEGORY_ALIAS[key]           ? CATEGORY_ALIAS[key] :
        "others";

    const images = CATEGORY_IMAGE_MAP[resolvedKey] || CATEGORY_IMAGE_MAP["others"];

    // Stable hash from postId so the same post always shows the same image
    const idStr = String(postId || Math.random());
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
    }
    return images[hash % images.length];
}

// Expose globally so all page scripts can call it
window.getCategoryImage = getCategoryImage;

