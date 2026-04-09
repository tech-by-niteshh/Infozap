const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    newsContent: {
      type: String,
      required: [true, "News content is required"],
      trim: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Post", postSchema);
