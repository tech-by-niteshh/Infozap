const app = require("./backend/server");

const port = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Infozap server running on port ${port}`);
  });
}

module.exports = app;
