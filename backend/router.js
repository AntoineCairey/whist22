const express = require("express");
const userManager = require("./managers/userManager");
const gameManager = require("./managers/gameManager");

const router = express.Router();
// router.use(["/users", "/games"], userManager.verifyToken);

// no token needed
router.post("/signup", userManager.createUser);
router.post("/login", userManager.login);
router.get("/bestusers", userManager.getBestUsers);
router.post("/games", gameManager.createGame);

// token needed
router.get("/users/me", userManager.verifyToken, userManager.getUser);
router.get(
  "/users/me/games",
  userManager.verifyToken,
  gameManager.getGamesByUser
);

/* router.get("/users", userManager.getUsers);
router.get("/users/:id", userManager.getUser);
router.patch("/users/:id", userManager.updateUser);
router.delete("/users/:id", userManager.deleteUser);

router.get("/games", gameManager.getGames);
router.get("/games/:id", gameManager.getGame);
router.patch("/games/:id", gameManager.updateGame);
router.delete("/games/:id", gameManager.deleteGame);
router.get("/users/:id/games", gameManager.getGamesByUser); */

module.exports = router;
