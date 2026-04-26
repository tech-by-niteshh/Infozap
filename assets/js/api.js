(() => {
    function resolveApiBase() {
        if (window.INFOZAP_API_BASE) {
            return String(window.INFOZAP_API_BASE).replace(/\/$/, "");
        }

        const { protocol, hostname, port, origin } = window.location;

        if (protocol === "file:") {
            return "/api";
        }

        if (["localhost", "127.0.0.1"].includes(hostname) && port !== "5000") {
            return `${protocol}//${hostname}:5000/api`;
        }

        return `${origin}/api`;
    }

    const API_BASE = resolveApiBase();
    const LIKE_STORAGE_KEY = "infozap-liked-posts";

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    function formatDate(dateValue) {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function buildSummary(text, limit = 170) {
        const cleanText = String(text || "").replace(/\s+/g, " ").trim();

        if (!cleanText) {
            return "No summary available yet.";
        }

        if (cleanText.length <= limit) {
            return cleanText;
        }

        return `${cleanText.slice(0, limit).trim()}...`;
    }

    function getReadTime(text) {
        const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 180));
        return `${minutes} min read`;
    }

    function normalizeList(items) {
        return Array.isArray(items)
            ? items.map((item) => String(item).trim()).filter(Boolean)
            : [];
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function buildHighlights(post) {
        const content = String(post.newsContent || "").trim();
        if (!content) {
            return ["No additional summary available yet.", "Open the full post for more details."];
        }

        return content
            .split(/[.!?]/)
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 2);
    }

    function mapPost(post) {
        const normalizedPost = post || {};
        const content = String(normalizedPost.newsContent || "").trim();
        const createdAtValue = normalizedPost.createdAt || normalizedPost.date || "";
        const timestamp = Number.isNaN(new Date(createdAtValue).getTime())
            ? 0
            : new Date(createdAtValue).getTime();

        return {
            id: normalizedPost._id || normalizedPost.id || "",
            title: normalizedPost.title || "Untitled post",
            author: normalizedPost.author || "Infozap Editorial Team",
            newsContent: content,
            category: normalizedPost.category || "General",
            date: formatDate(normalizedPost.date),
            dateValue: normalizedPost.date || "",
            createdAtValue,
            timestamp,
            imageUrl: normalizedPost.imageUrl || "",
            likes: Number(normalizedPost.likes || 0),
            hashtags: normalizeList(normalizedPost.hashtags),
            keywords: normalizeList(normalizedPost.keywords),
            summary: buildSummary(content),
            highlights: buildHighlights(normalizedPost),
            readTime: getReadTime(content)
        };
    }

    async function getPosts() {
        const response = await request("/posts");
        return Array.isArray(response.data) ? response.data.map(mapPost) : [];
    }

    async function getPostById(id) {
        const response = await request(`/posts/${id}`);
        return mapPost(response.data);
    }

    async function getPostsByCategory(category) {
        const response = await request(`/posts/category/${encodeURIComponent(category)}`);
        return Array.isArray(response.data) ? response.data.map(mapPost) : [];
    }

    async function createPost(payload) {
        const response = await request("/posts", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        return mapPost(response.data);
    }

    async function likePost(id) {
        const response = await request(`/posts/${id}/like`, {
            method: "PATCH"
        });

        return mapPost(response.data);
    }

    function getLikedPostIds() {
        try {
            const rawValue = window.localStorage.getItem(LIKE_STORAGE_KEY);
            const parsedValue = JSON.parse(rawValue || "[]");
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch (error) {
            return [];
        }
    }

    function hasLikedPost(id) {
        return getLikedPostIds().includes(String(id));
    }

    function markPostLiked(id) {
        const postId = String(id);
        const likedPostIds = getLikedPostIds();

        if (likedPostIds.includes(postId)) {
            return likedPostIds;
        }

        const nextLikedPostIds = [...likedPostIds, postId];

        try {
            window.localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(nextLikedPostIds));
        } catch (error) {
            console.warn("Unable to persist liked posts", error);
        }

        return nextLikedPostIds;
    }

    window.InfozapAPI = {
        API_BASE,
        request,
        formatDate,
        buildSummary,
        getReadTime,
        escapeHTML,
        mapPost,
        getPosts,
        getPostById,
        getPostsByCategory,
        createPost,
        likePost,
        getLikedPostIds,
        hasLikedPost,
        markPostLiked
    };
})();
