const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  login,
  verifyToken,
} = require("./entities/user/userManager");
const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  getGamesByUser,
} = require("./entities/game/gameManager");

const router = express.Router();
router.use(["/users", "/games"], verifyToken);

router.get("/", (req, res) => res.send("Coucou"));
router.post("/register", createUser);
router.post("/login", login);

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/games", getGames);
router.get("/games/:id", getGame);
router.post("/games", createGame);
router.patch("/games/:id", updateGame);
router.delete("/games/:id", deleteGame);
router.get("/users/:id/games", getGamesByUser);

module.exports = router;
