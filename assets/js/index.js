const featuredGrid = document.getElementById("featuredGrid");
const carouselPagination = document.getElementById("carouselPagination");
const adviceGrid = document.getElementById("adviceGrid");
const loadMoreAdviceBtn = document.getElementById("loadMoreAdviceBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchForm = document.getElementById("searchForm");

let newsData = [];
let adviceData = [];
let allPosts = [];
let activeNewsIndex = 0;
let adviceVisibleCount = 4;
let spotlightTouchStartX = 0;
let spotlightTouchStartY = 0;
let spotlightTouchTarget = null;

const SPOTLIGHT_MAX_POSTS = 5;
const ADVICE_BATCH_SIZE = 4;
const ADVICE_MAX_POSTS = 20;
const SWIPE_THRESHOLD = 48;
const SWIPE_VERTICAL_TOLERANCE = 36;

function escapeHTML(value) {
    return window.InfozapAPI?.escapeHTML
        ? window.InfozapAPI.escapeHTML(value)
        : String(value ?? "");
}

function getTopLikedPosts(posts, limit = ADVICE_MAX_POSTS) {
    return [...posts]
        .sort((left, right) => {
            if (right.likes !== left.likes) {
                return right.likes - left.likes;
            }

            return right.id.localeCompare(left.id);
        })
        .slice(0, limit);
}

function getLatestPosts(posts, limit = ADVICE_MAX_POSTS) {
    return [...posts]
        .sort((left, right) => {
            if (right.timestamp !== left.timestamp) {
                return right.timestamp - left.timestamp;
            }

            return right.id.localeCompare(left.id);
        })
        .slice(0, limit);
}

function wrapIndex(index, length) {
    return (index + length) % length;
}

function renderCarouselDots() {
    if (!carouselPagination) {
        return;
    }

    carouselPagination.innerHTML = newsData.map((post, index) => `
        <button
            class="carousel-dot ${index === activeNewsIndex ? "is-active" : ""}"
            type="button"
            data-index="${index}"
            aria-label="Show ${post.title}"
            aria-pressed="${index === activeNewsIndex}"
        ></button>
    `).join("");
}

function updateCarouselHeight() {
    if (!featuredGrid) {
        return;
    }

    const activeCard = featuredGrid.querySelector(".spotlight-card.is-active");
    if (!activeCard) {
        return;
    }

    const nextHeight = Math.ceil(activeCard.scrollHeight + 16);
    featuredGrid.style.minHeight = `${nextHeight}px`;
}

function buildSpotlightCard(post, position, index) {
    const isActive = position === "active";
    const isLiked = window.InfozapAPI?.hasLikedPost(post.id);
    const imgSrc = window.getCategoryImage ? window.getCategoryImage(post.category, post.id) : "";
    const cardFooter = isActive
        ? `
            <div class="spotlight-actions">
                <p class="spotlight-author">Author: ${escapeHTML(post.author)}</p>
                <button class="like-button ${isLiked ? "is-liked" : ""}" type="button" data-like-id="${post.id}" ${isLiked ? "disabled" : ""}>
                    <i class="${isLiked ? "fa-solid" : "fa-regular"} fa-heart"></i>
                    <span>${isLiked ? "Liked" : "Like"}</span>
                    <strong data-like-count="${post.id}">${post.likes}</strong>
                </button>
            </div>
        `
        : `<p class="spotlight-author">Author: ${escapeHTML(post.author)}</p>`;

    return `
        <article
            class="spotlight-card is-${position}"
            data-index="${index}"
            role="button"
            tabindex="0"
            aria-label="${isActive ? `${post.title} is active` : `Show ${post.title} in the center`}"
        >
            <div>
                ${imgSrc ? `<div class="spotlight-img-wrap"><img src="${imgSrc}" alt="${escapeHTML(post.category)} image" class="spotlight-card-img" loading="lazy"></div>` : ""}
                <div class="spotlight-topline">
                    <span class="category-pill">${escapeHTML(post.category)}</span>
                    <span class="spotlight-date">${escapeHTML(post.date)}</span>
                </div>
                <h3 class="spotlight-title"><a href="post.html?id=${post.id}">${escapeHTML(post.title)}</a></h3>
                <p class="spotlight-summary">${escapeHTML(post.summary)}</p>
            </div>
            <div>${cardFooter}</div>
        </article>
    `;
}

function renderNews(focusActive = false) {
    if (!featuredGrid) {
        return;
    }

    if (newsData.length === 0) {
        featuredGrid.innerHTML = `
            <article class="spotlight-card is-active">
                <div>
                    <div class="spotlight-topline">
                        <span class="category-pill">Infozap</span>
                        <span class="meta-chip">Waiting for posts</span>
                    </div>
                    <h3 class="spotlight-title">No posts available yet</h3>
                    <p class="spotlight-summary">Create a post from the upload page and it will appear here automatically.</p>
                </div>
            </article>
        `;
        if (carouselPagination) {
            carouselPagination.innerHTML = "";
        }
        updateCarouselHeight();
        return;
    }

    const previousIndex = wrapIndex(activeNewsIndex - 1, newsData.length);
    const nextIndex = wrapIndex(activeNewsIndex + 1, newsData.length);

    featuredGrid.innerHTML = [
        buildSpotlightCard(newsData[previousIndex], "prev", previousIndex),
        buildSpotlightCard(newsData[activeNewsIndex], "active", activeNewsIndex),
        buildSpotlightCard(newsData[nextIndex], "next", nextIndex)
    ].join("");

    renderCarouselDots();
    updateCarouselHeight();

    if (focusActive) {
        featuredGrid.querySelector(".spotlight-card.is-active")?.focus();
    }
}

function setActiveNews(index, focusActive = false) {
    if (newsData.length === 0) {
        return;
    }

    activeNewsIndex = wrapIndex(index, newsData.length);
    renderNews(focusActive);
}

function handleSpotlightSwipe(deltaX, deltaY) {
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
        return;
    }

    if (Math.abs(deltaY) > SWIPE_VERTICAL_TOLERANCE && Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
    }

    if (deltaX < 0) {
        setActiveNews(activeNewsIndex + 1, true);
        return;
    }

    setActiveNews(activeNewsIndex - 1, true);
}

function renderAdvice() {
    if (!adviceGrid) {
        return;
    }

    const visibleAdvicePosts = adviceData.slice(0, adviceVisibleCount);

    if (loadMoreAdviceBtn) {
        const hasMorePosts = adviceVisibleCount < adviceData.length && adviceVisibleCount < ADVICE_MAX_POSTS;
        loadMoreAdviceBtn.style.display = adviceData.length > ADVICE_BATCH_SIZE ? "inline-flex" : "none";
        loadMoreAdviceBtn.disabled = !hasMorePosts;
        loadMoreAdviceBtn.textContent = hasMorePosts ? "Load More Latest Posts" : "All Latest Posts Loaded";
    }

    if (visibleAdvicePosts.length === 0) {
        adviceGrid.innerHTML = `
            <article class="advice-card advice-empty-card">
                <div class="spotlight-topline">
                    <span class="category-pill light-pill">Infozap</span>
                    <span class="meta-chip light-chip">No latest uploads</span>
                </div>
                <h3>Upload a new post to populate this section</h3>
                <p>The newest stories from the compose page will appear here automatically.</p>
            </article>
        `;
        return;
    }

    adviceGrid.innerHTML = visibleAdvicePosts.map((item, index) => {
        const imgSrc = window.getCategoryImage ? window.getCategoryImage(item.category, item.id) : "";
        return `
        <article class="advice-card">
            ${imgSrc ? `<div class="advice-card-img-wrap"><img src="${imgSrc}" alt="${escapeHTML(item.category)} image" class="advice-card-img" loading="lazy"></div>` : ""}
            <div class="advice-card-header">
                <span class="advice-order">${String(index + 1).padStart(2, "0")}</span>
                <div class="advice-card-meta">
                    <span class="category-pill light-pill">${escapeHTML(item.category)}</span>
                    <span class="advice-date">${escapeHTML(item.date)}</span>
                </div>
            </div>
            <h3><a href="post.html?id=${item.id}">${escapeHTML(item.title)}</a></h3>
            <p>${escapeHTML(item.summary)}</p>
            <p class="card-author">Author: ${escapeHTML(item.author)}</p>
        </article>
    `;
    }).join("");
}

async function handleLike(postId) {
    if (!window.InfozapAPI || !postId) {
        return;
    }

    if (window.InfozapAPI.hasLikedPost(postId)) {
        alert("You already liked this post.");
        return;
    }

    try {
        const updatedPost = await window.InfozapAPI.likePost(postId);
        window.InfozapAPI.markPostLiked(postId);

        allPosts = allPosts.map((post) => post.id === updatedPost.id ? updatedPost : post);
        newsData = getTopLikedPosts(allPosts, SPOTLIGHT_MAX_POSTS);
        adviceData = getLatestPosts(allPosts, ADVICE_MAX_POSTS);
        renderNews();
        renderAdvice();
    } catch (error) {
        console.error(error);
        alert(`Unable to like this post: ${error.message}`);
    }
}

function handleSearch(event) {
    const query = searchInput?.value.trim() || "";

    if (!query) {
        event?.preventDefault();
        searchInput?.focus();
        return;
    }

    if (event) {
        event.preventDefault();
    }

    window.location.href = `category.html?search=${encodeURIComponent(query)}`;
}

async function loadHomepagePosts() {
    if (!window.InfozapAPI) {
        return;
    }

    try {
        const posts = await window.InfozapAPI.getPosts();
        allPosts = posts;
        newsData = getTopLikedPosts(allPosts, SPOTLIGHT_MAX_POSTS);
        adviceData = getLatestPosts(allPosts, ADVICE_MAX_POSTS);
        adviceVisibleCount = 4;
        activeNewsIndex = 0;
        renderNews();
        renderAdvice();
    } catch (error) {
        console.error(error);
        if (featuredGrid) {
            featuredGrid.innerHTML = `
                <article class="spotlight-card is-active">
                    <div>
                        <div class="spotlight-topline">
                            <span class="category-pill">Connection</span>
                            <span class="meta-chip">Error</span>
                        </div>
                        <h3 class="spotlight-title">Unable to load posts</h3>
                        <p class="spotlight-summary">${escapeHTML(error.message)}</p>
                    </div>
                </article>
            `;
        }
        if (carouselPagination) {
            carouselPagination.innerHTML = "";
        }
        if (adviceGrid) {
            adviceGrid.innerHTML = `
                <article class="advice-card advice-empty-card">
                    <div class="spotlight-topline">
                        <span class="category-pill light-pill">Connection</span>
                        <span class="meta-chip light-chip">Error</span>
                    </div>
                    <h3>Unable to load latest posts</h3>
                    <p>${escapeHTML(error.message)}</p>
                </article>
            `;
        }
    }
}

featuredGrid?.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (likeButton) {
        event.preventDefault();
        event.stopPropagation();
        handleLike(likeButton.dataset.likeId);
        return;
    }

    const anchor = event.target.closest("a");
    if (anchor) {
        return;
    }

    const card = event.target.closest(".spotlight-card");
    if (!card) {
        return;
    }

    const nextIndex = Number(card.dataset.index);
    if (!Number.isNaN(nextIndex) && nextIndex !== activeNewsIndex) {
        setActiveNews(nextIndex);
    }
});

featuredGrid?.addEventListener("keydown", (event) => {
    const card = event.target.closest(".spotlight-card");
    if (!card) {
        return;
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const nextIndex = Number(card.dataset.index);
        if (!Number.isNaN(nextIndex)) {
            setActiveNews(nextIndex, true);
        }
    }
});

featuredGrid?.addEventListener("touchstart", (event) => {
    if (newsData.length === 0 || event.touches.length !== 1) {
        spotlightTouchTarget = null;
        return;
    }

    if (event.target.closest("a, button, input, textarea, select")) {
        spotlightTouchTarget = null;
        return;
    }

    const touch = event.touches[0];
    spotlightTouchStartX = touch.clientX;
    spotlightTouchStartY = touch.clientY;
    spotlightTouchTarget = event.target.closest(".spotlight-card") || featuredGrid;
}, { passive: true });

featuredGrid?.addEventListener("touchend", (event) => {
    if (!spotlightTouchTarget || event.changedTouches.length !== 1) {
        spotlightTouchTarget = null;
        return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - spotlightTouchStartX;
    const deltaY = touch.clientY - spotlightTouchStartY;
    const tappedCard = spotlightTouchTarget.closest(".spotlight-card");
    spotlightTouchTarget = null;

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && tappedCard) {
        const nextIndex = Number(tappedCard.dataset.index);
        if (!Number.isNaN(nextIndex) && nextIndex !== activeNewsIndex) {
            setActiveNews(nextIndex, true);
        }
        return;
    }

    handleSpotlightSwipe(deltaX, deltaY);
}, { passive: true });

featuredGrid?.addEventListener("touchcancel", () => {
    spotlightTouchTarget = null;
}, { passive: true });

carouselPagination?.addEventListener("click", (event) => {
    const dot = event.target.closest(".carousel-dot");
    if (!dot) {
        return;
    }

    const nextIndex = Number(dot.dataset.index);
    if (!Number.isNaN(nextIndex)) {
        setActiveNews(nextIndex, true);
    }
});

loadMoreAdviceBtn?.addEventListener("click", () => {
    adviceVisibleCount = Math.min(adviceVisibleCount + ADVICE_BATCH_SIZE, Math.min(adviceData.length, ADVICE_MAX_POSTS));
    renderAdvice();
});

document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

    if (isTyping || newsData.length === 0) {
        return;
    }

    if (event.key === "ArrowLeft") {
        setActiveNews(activeNewsIndex - 1, true);
    }

    if (event.key === "ArrowRight") {
        setActiveNews(activeNewsIndex + 1, true);
    }
});

searchForm?.addEventListener("submit", handleSearch);
searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

window.addEventListener("resize", updateCarouselHeight);

loadHomepagePosts();



