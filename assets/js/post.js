const postTitle = document.getElementById("postTitle");
const postDate = document.getElementById("postDate");
const postCategory = document.getElementById("postCategory");
const postLead = document.getElementById("postLead");
const postBody = document.getElementById("postBody");
const postAuthor = document.getElementById("postAuthor");
const sideList = document.querySelector(".side-list");
const articleMeta = document.querySelector(".article-meta");

function escapeHTML(value) {
    return window.InfozapAPI?.escapeHTML
        ? window.InfozapAPI.escapeHTML(value)
        : String(value ?? "");
}

function setPostLead(text = "") {
    if (!postLead) {
        return;
    }

    const cleanText = String(text || "").trim();
    postLead.textContent = cleanText;
    postLead.hidden = cleanText.length === 0;
}

function buildParagraphs(text) {
    const blocks = String(text || "")
        .split(/\n+/)
        .map((block) => block.trim())
        .filter(Boolean);

    const paragraphs = blocks.length > 0 ? blocks : [String(text || "")];
    return paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
}

function getPostIdFromQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

function getRelatedPosts(posts, currentPost) {
    const currentKeywords = new Set(currentPost.keywords || []);
    const currentHashtags = new Set(currentPost.hashtags || []);

    return [...posts]
        .filter((post) => post.id !== currentPost.id)
        .map((post) => {
            const keywordMatches = (post.keywords || []).filter((keyword) => currentKeywords.has(keyword)).length;
            const hashtagMatches = (post.hashtags || []).filter((tag) => currentHashtags.has(tag)).length;
            const categoryMatch = post.category === currentPost.category ? 2 : 0;

            return {
                ...post,
                relatedScore: keywordMatches + hashtagMatches + categoryMatch
            };
        })
        .sort((left, right) => {
            if (right.relatedScore !== left.relatedScore) {
                return right.relatedScore - left.relatedScore;
            }

            return right.likes - left.likes;
        })
        .slice(0, 3);
}

function renderRelatedPosts(posts) {
    if (!sideList) {
        return;
    }

    if (posts.length === 0) {
        sideList.innerHTML = `
            <div class="side-item">
                <div class="side-text">
                    <p>No related posts available yet</p>
                    <span>Infozap</span>
                </div>
            </div>
        `;
        return;
    }

    sideList.innerHTML = posts.slice(0, 3).map((post) => {
        const imgSrc = window.getCategoryImage ? window.getCategoryImage(post.category, post.id) : "";
        return `
        <a class="side-item" href="post.html?id=${post.id}">
            ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHTML(post.category)}" class="side-item-img" loading="lazy">` : ""}
            <div class="side-text">
                <p>${escapeHTML(post.title)}</p>
                <span>${escapeHTML(post.category)} • ${escapeHTML(post.date)}</span>
                <strong>Author: ${escapeHTML(post.author)}</strong>
            </div>
        </a>
    `;
    }).join("");
}

function renderLikeButton(post) {
    if (!articleMeta) {
        return;
    }

    const isLiked = window.InfozapAPI?.hasLikedPost(post.id);
    const existingButton = articleMeta.querySelector(".like-button");
    if (existingButton) {
        existingButton.remove();
    }

    articleMeta.insertAdjacentHTML("beforeend", `
        <button class="like-button article-like-button ${isLiked ? "is-liked" : ""}" type="button" data-like-id="${post.id}" ${isLiked ? "disabled" : ""}>
            <i class="${isLiked ? "fa-solid" : "fa-regular"} fa-heart"></i>
            <span>${isLiked ? "Liked" : "Like"}</span>
            <strong data-like-count="${post.id}">${post.likes}</strong>
        </button>
    `);
}

async function handlePostLike(postId) {
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

        if (postTitle) {
            postTitle.textContent = updatedPost.title;
        }
        if (postDate) {
            postDate.textContent = updatedPost.date;
        }
        if (postCategory) {
            postCategory.textContent = updatedPost.category;
        }
        setPostLead("");
        if (postBody) {
            postBody.innerHTML = buildParagraphs(updatedPost.newsContent);
        }
        if (postAuthor) {
            postAuthor.textContent = `Author: ${updatedPost.author}`;
        }

        renderLikeButton(updatedPost);
    } catch (error) {
        console.error(error);
        alert(`Unable to like this post: ${error.message}`);
    }
}

async function getPostDetails() {
    const postId = getPostIdFromQuery();

    if (!postId || !window.InfozapAPI) {
        return;
    }

    try {
        const [post, allPosts] = await Promise.all([
            window.InfozapAPI.getPostById(postId),
            window.InfozapAPI.getPosts()
        ]);

        document.title = `Infozap | ${post.title}`;
        if (postTitle) {
            postTitle.textContent = post.title;
        }
        if (postDate) {
            postDate.textContent = post.date;
        }
        if (postCategory) {
            postCategory.textContent = post.category;
        }
        setPostLead("");
        if (postBody) {
            postBody.innerHTML = buildParagraphs(post.newsContent);
        }
        if (postAuthor) {
            postAuthor.textContent = `Author: ${post.author}`;
        }
        renderLikeButton(post);

        const relatedPosts = getRelatedPosts(allPosts, post);
        renderRelatedPosts(relatedPosts);
    } catch (error) {
        console.error(error);
        if (postTitle) {
            postTitle.textContent = "Unable to load this post";
        }
        if (postDate) {
            postDate.textContent = "Connection error";
        }
        if (postCategory) {
            postCategory.textContent = "Infozap";
        }
        setPostLead(error.message);
        if (postBody) {
            postBody.innerHTML = "<p>Please check that the backend is running and try again.</p>";
        }
        if (postAuthor) {
            postAuthor.textContent = "Author: Infozap";
        }
        renderRelatedPosts([]);
    }
}

document.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".article-like-button");
    if (!likeButton) {
        return;
    }

    event.preventDefault();
    handlePostLike(likeButton.dataset.likeId);
});

window.onload = getPostDetails;
