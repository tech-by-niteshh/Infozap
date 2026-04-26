async function postData() {
    const postBtn = document.getElementById("postBtn");
    const author = document.getElementById("author").value.trim();
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim();
    const news = document.getElementById("news").value.trim();

    if (!author || !title || !category || !news) {
        alert("Author, Title, Category aur News required hai!");
        return;
    }

    // Disable button to prevent double clicks
    if (postBtn) {
        postBtn.disabled = true;
        postBtn.innerText = "Saving...";
        postBtn.style.opacity = "0.7";
        postBtn.style.cursor = "not-allowed";
    }

    document.getElementById("preview").style.display = "block";
    document.getElementById("pTitle").innerText = title;
    document.getElementById("pNews").innerText = news;
    document.getElementById("pAuthor").innerText = "By " + author;
    document.getElementById("pCategory").innerText = "Category: " + category;

    const post = {
        title,
        author,
        newsContent: news,
        category,
        imageUrl: ""
    };

    try {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(post)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            alert("Post Saved Successfully! ✅");
            // Clear fields or redirect
            document.getElementById("title").value = "";
            document.getElementById("news").value = "";
            if (postBtn) {
                postBtn.disabled = false;
                postBtn.innerText = "Post";
                postBtn.style.opacity = "1";
                postBtn.style.cursor = "pointer";
            }
            return;
        }

        const message = data.message || `Server Error: ${response.status}`;
        console.error("Server Error:", response.status, data);
        alert(`Error saving post ❌ ${message}`);
    } catch (error) {
        console.error("CORS or Network Error ❌", error);
        alert(`CORS or Network Error ❌ ${error.message || "Unknown error"}`);
    } finally {
        // Always re-enable button on error/completion unless redirected
        if (postBtn && postBtn.innerText === "Saving...") {
            postBtn.disabled = false;
            postBtn.innerText = "Post";
            postBtn.style.opacity = "1";
            postBtn.style.cursor = "pointer";
        }
    }
}
