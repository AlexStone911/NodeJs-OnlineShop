const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: "test",
		},
	})
);

exports.getLogin = (req, res, next) => {
	let message = req.flash("error");
	if (message && message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}

	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
		errorMessage: message,
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				req.flash("error", "Invalid Email or Password");
				return req.session.save((err) => {
					res.redirect("/login");
				});
			}

			bcrypt
				.compare(password, user.password)
				.then((match) => {
					if (match) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save((err) => {
							console.log(err);
							res.redirect("/");
						});
					}
					res.redirect("/login");
				})
				.catch((err) => {
					console.log(err);
					res.redirect("/login");
				});
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/");
	});
};

exports.getSignup = (req, res, next) => {
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup",
	});
};

exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;

	User.findOne({ email: email })
		.then((userDoc) => {
			if (userDoc) {
				return res.redirect("/signup");
			}

			return bcrypt.hash(password, 12).then((hashedPassword) => {
				const user = new User({
					name: name,
					email: email,
					password: hashedPassword,
					cart: { items: [] },
				});
				return user.save();
			});
		})
		.then((result) => {
			res.redirect("/login");

			return transporter.sendMail({
				to: email,
				from: "pidhorodets19@gmail.com",
				subject: "Signup to Online Shop",
				html: "<h1>You are signed up</h1>",
			});
		})
		.catch((err) => console.log(err));
};

exports.getReset = (req, res, next) => {
	let message = req.flash("error");
	if (message && message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}

	res.render("auth/reset", {
		path: "/reset",
		pageTitle: "Reset password",
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect("/reset");
		}

		const token = buffer.toString("hex");
		User.findOne({ email: req.body.email })
			.then((user) => {
				if (!user) {
					console.log("ssssssssssssssssssss");
					req.flash(
						"errorMessage",
						"No account with such an email was found!"
					);
					console.log(JSON.stringify(req));

					res.redirect("/reset");
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user
					.save()
					.then((result) => {
						transporter.sendMail({
							to: req.body.email,
							from: "pidhorodets19@gmail.com",
							subject: "Password reset",
							html: `
							<p>You requested a password reset</p>
							<p>Click the <a href="http://localhost:3000/new-password/${token}">link</a> to set a new password: </p>
						`,
						});
						res.redirect("/");
					})
					.catch((err) => console.log(err));
			})

			.catch((err) => console.log(err));
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;

	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
	})
		.then((user) => {
			let message = req.flash("error");
			if (message && message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}

			res.render("auth/new-password", {
				path: "/new-password",
				pageTitle: "New password",
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then((user) => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPassword) => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = null;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then((result) => {
			res.redirect("/login");
		})
		.catch((err) => console.log(err));
};
