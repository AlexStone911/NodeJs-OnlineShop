const express = require("express");

const { check } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post(
	"/login",
	[
		check("email")
			.isEmail()
			.normalizeEmail()
			.withMessage("Please enter a valid email address"),
		check("password", "Please, enter a correct password or email")
			.isLength({ min: 6 })
			.isAlphanumeric()
			.trim(),
	],
	authController.postLogin
);

router.post("/logout", authController.postLogout);

router.post(
	"/signup",
	[
		check("name")
			.trim()
			.notEmpty()
			.withMessage("Please enter your name"),
		check("email")
			.isEmail()
			.normalizeEmail()
			.withMessage("Please enter a valid email address"),
		check(
			"password",
			"Please, enter a password only number and text, at least 6 characters"
		)
			.isLength({ min: 6 })
			.trim()
			.isAlphanumeric(),
		check("confirmPassword").custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords have to match");
			}
			return true;
		}),
	],
	authController.postSignup
);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/reset", authController.postReset);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
