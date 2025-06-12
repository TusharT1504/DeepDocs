require("dotenv").config();
const express = require("express");
const app = express();
const ragRoute = require("./routes/rag");

app.use(express.json());
app.use("/api/rag", ragRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
