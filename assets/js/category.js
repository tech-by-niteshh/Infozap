const categoryGrid = document.getElementById("categoryGrid");
const loadMoreButton = document.querySelector(".load-more");
const categoryKicker = document.getElementById("categoryKicker");
const categoryTitle = document.getElementById("categoryTitle");
const categoryIntro = document.getElementById("categoryIntro");
const CATEGORY_BATCH_SIZE = 6;

let categoryPosts = [];
let visibleCategoryCount = CATEGORY_BATCH_SIZE;

function getCategoryFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category");
}

function getSearchFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("search");
}

function escapeHTML(value) {
    return window.InfozapAPI?.escapeHTML
        ? window.InfozapAPI.escapeHTML(value)
        : String(value ?? "");
}

function getSearchableText(post) {
    return [
        post.title,
        post.category,
        post.summary,
        post.author,
        post.newsContent,
        ...(post.hashtags || []),
        ...(post.keywords || [])
    ].join(" ").toLowerCase();
}

function updateCategoryHeader(selectedCategory, searchQuery, resultCount) {
    if (searchQuery) {
        if (categoryKicker) {
            categoryKicker.textContent = "Search Results";
        }
        if (categoryTitle) {
            categoryTitle.textContent = `Results for "${searchQuery}"`;
        }
        if (categoryIntro) {
            categoryIntro.textContent = resultCount > 0
                ? `Showing related posts that match your search using the category page card layout.`
                : `No related posts matched your search. Try another keyword or phrase.`;
        }
        document.title = `Infozap | Search: ${searchQuery}`;
        return;
    }

    if (selectedCategory) {
        if (categoryKicker) {
            categoryKicker.textContent = "Category Feed";
        }
        if (categoryTitle) {
            categoryTitle.textContent = `${selectedCategory} updates`;
        }
        if (categoryIntro) {
            categoryIntro.textContent = `Browse grouped updates from the ${selectedCategory} category in a clean text-first layout.`;
        }
        document.title = `Infozap | ${selectedCategory}`;
        return;
    }

    document.title = "Infozap | categories";
}

function renderCategoryPosts(posts) {
    if (!categoryGrid) {
        return;
    }

    const visiblePosts = posts.slice(0, visibleCategoryCount);

    if (loadMoreButton) {
        const hasMorePosts = visibleCategoryCount < posts.length;
        loadMoreButton.style.display = posts.length > CATEGORY_BATCH_SIZE ? "inline-flex" : "none";
        loadMoreButton.disabled = !hasMorePosts;
        loadMoreButton.textContent = hasMorePosts ? "Load More Stories" : "All Stories Loaded";
    }

    if (posts.length === 0) {
        categoryGrid.innerHTML = `
            <article class="news-card">
                <div class="card-meta">
                    <span class="category-pill">Infozap</span>
                    <span>No posts yet</span>
                </div>
                <h3>No posts found</h3>
                <p class="card-summary">Create content from the upload page or choose another category.</p>
            </article>
        `;
        return;
    }

    categoryGrid.innerHTML = visiblePosts.map((post) => `
        <article class="news-card">
            <div class="card-meta">
                <span class="category-pill">${escapeHTML(post.category)}</span>
                <span>${escapeHTML(post.date)}</span>
            </div>
            <h3><a href="post.html?id=${post.id}">${escapeHTML(post.title)}</a></h3>
            <p class="card-summary">${escapeHTML(post.summary)}</p>
            <p class="card-author">Author: ${escapeHTML(post.author)}</p>
        </article>
    `).join("");
}

async function loadCategoryPosts() {
    if (!window.InfozapAPI || !categoryGrid) {
        return;
    }

    try {
        const selectedCategory = getCategoryFromQuery();
        const searchQuery = (getSearchFromQuery() || "").trim();
        const normalizedSearch = searchQuery.toLowerCase();
        let posts = selectedCategory
            ? await window.InfozapAPI.getPostsByCategory(selectedCategory)
            : await window.InfozapAPI.getPosts();

        if (normalizedSearch) {
            posts = posts.filter((post) => getSearchableText(post).includes(normalizedSearch));
        }

        categoryPosts = posts;
        visibleCategoryCount = CATEGORY_BATCH_SIZE;
        updateCategoryHeader(selectedCategory, searchQuery, categoryPosts.length);
        renderCategoryPosts(categoryPosts);
    } catch (error) {
        console.error(error);
        if (loadMoreButton) {
            loadMoreButton.style.display = "none";
        }
        categoryGrid.innerHTML = `
            <article class="news-card">
                <div class="card-meta">
                    <span class="category-pill">Connection</span>
                    <span>Error</span>
                </div>
                <h3>Unable to load category posts</h3>
                <p class="card-summary">${escapeHTML(error.message)}</p>
            </article>
        `;
    }
}

loadMoreButton?.addEventListener("click", () => {
    visibleCategoryCount = Math.min(visibleCategoryCount + CATEGORY_BATCH_SIZE, categoryPosts.length);
    renderCategoryPosts(categoryPosts);
});

window.onload = loadCategoryPosts;

