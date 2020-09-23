const express = require("express");
const router = express.Router();

router.get("/check", (req, res) => {
  res.send({ response: "server is up and running like a baby" }).status(200);
});

module.exports = router;
