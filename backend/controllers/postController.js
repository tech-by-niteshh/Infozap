const mongoose = require("mongoose");
const Post = require("../models/Post");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeArrayField = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const generateKeywordsFromText = (text) => {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "have",
    "into",
    "your",
    "about",
    "will",
    "they",
    "their",
    "them",
    "been",
    "were",
    "when",
    "what",
    "where",
    "which",
    "while",
    "more",
    "than",
    "also",
    "only",
    "just",
    "over",
    "under",
    "after",
    "before",
    "news",
    "post",
    "infozap"
  ]);

  const words = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)].slice(0, 8);
};

const generateHashtags = (title, category, keywords) => {
  const baseTags = [
    category,
    ...keywords.slice(0, 3)
  ]
    .map((item) => String(item || "").trim().replace(/\s+/g, ""))
    .filter(Boolean);

  const titleWords = String(title || "")
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => word.length > 3)
    .slice(0, 2);

  return [...new Set([...baseTags, ...titleWords])].slice(0, 5);
};

const createPost = async (req, res, next) => {
  try {
    const {
      title,
      author,
      newsContent,
      news,
      hashtags,
      keywords,
      category,
      imageUrl,
      date,
    } = req.body;

    const resolvedContent = newsContent || news;
    const normalizedKeywords = normalizeArrayField(keywords);
    const generatedKeywords = normalizedKeywords.length > 0
      ? normalizedKeywords
      : generateKeywordsFromText(`${title} ${resolvedContent} ${category || ""}`);

    const normalizedHashtags = normalizeArrayField(hashtags);
    const generatedHashtags = normalizedHashtags.length > 0
      ? normalizedHashtags
      : generateHashtags(title, category || "General", generatedKeywords);

    const post = await Post.create({
      title,
      author,
      newsContent: resolvedContent,
      hashtags: generatedHashtags,
      keywords: generatedKeywords,
      category: category || "General",
      imageUrl: imageUrl || "",
      ...(date ? { date } : {}),
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid post ID");
      error.statusCode = 400;
      throw error;
    }

    const post = await Post.findById(id);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

const getPostsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const escapedCategory = escapeRegex(category);

    const posts = await Post.find({
      category: { $regex: `^${escapedCategory}$`, $options: "i" },
    }).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid post ID");
      error.statusCode = 400;
      throw error;
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: "Post liked successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByCategory,
  likePost,
};
