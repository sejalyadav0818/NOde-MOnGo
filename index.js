const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();
app.use(express.json());
const path = require("path");
const userRoute = require("./src/routes/userRoutes");
const postRoute = require("./src/routes/postRoutes");
const authMiddleware = require("./src/middleware/authMiddleware");
app.use(express.static(path.join(__dirname, "public")));

//error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).send({ error: "Invalid JSON" });
  }
  next(err);
});

//database connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    // console.error("Error connecting to MongoDB Atlas:", err);
  });

app.use(authMiddleware.initialize());
app.use(userRoute);
app.use(postRoute);

app.listen(PORT);
// app.listen(PORT, () => {
//   // console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;
