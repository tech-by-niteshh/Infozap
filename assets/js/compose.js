async function postData() {
    const author = document.getElementById("author").value.trim();
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim();
    const news = document.getElementById("news").value.trim();

    if (!author || !title || !category || !news) {
        alert("Author, Title, Category aur News required hai!");
        return;
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

        if (response.ok) {
            alert("Post Saved Successfully! ✅");
            return;
        }

        console.error("Server Error:", response.status);
        alert(`Error saving post ❌ ${response.status}`);
    } catch (error) {
        console.error("CORS or Network Error ❌", error);
        alert("CORS or Network Error ❌");
    }
}
