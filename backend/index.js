const express = require("express");
const cors = require("cors");
const runCodeRoute = require("./routes/run_code_route");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Set up a simple route
app.get("/", (req, res) => {
  res.send("This is working");
});

app.use("/run", runCodeRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
