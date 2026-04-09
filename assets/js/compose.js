function postData() {
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

    if (!window.InfozapAPI) {
        alert("API connection helper not loaded.");
        return;
    }

    window.InfozapAPI.createPost({
        author,
        title,
        newsContent: news,
        category,
        imageUrl: ""
    })
        .then((data) => {
            alert("Post Saved ✅");
            console.log(data);
        })
        .catch((error) => {
            console.log(error);
            alert(`Error saving post ❌ ${error.message}`);
        });
}
