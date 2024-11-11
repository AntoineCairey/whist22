const express = require("express");
const userManager = require("./entities/user/userManager");
const gameManager = require("./entities/game/gameManager");

const router = express.Router();
router.use(["/users", "/games"], userManager.verifyToken);

router.post("/signup", userManager.createUser);
router.post("/login", userManager.login);

router.get("/users", userManager.getUsers);
router.get("/users/me", userManager.getUser);
router.get("/users/:id", userManager.getUser);
router.patch("/users/:id", userManager.updateUser);
router.delete("/users/:id", userManager.deleteUser);

router.get("/games", gameManager.getGames);
router.get("/games/:id", gameManager.getGame);
router.post("/games", gameManager.createGame);
router.patch("/games/:id", gameManager.updateGame);
router.delete("/games/:id", gameManager.deleteGame);
router.get("/users/me/games", gameManager.getGamesByUser);
router.get("/users/:id/games", gameManager.getGamesByUser);

module.exports = router;
