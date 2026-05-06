const express = require("express");

const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } })
    .sort({ name: 1 })
    .select("_id name email");

  return res.json({
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })),
  });
});

module.exports = router;
