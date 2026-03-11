const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "comment-feed-library": path.resolve(__dirname, "../CommentFeedLibrary/src/index.ts"),
    },
  },
};
