const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key:
				"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",
		},
	})
);

exports.getLogin = (req, res, next) => {
	let message = req.flash("error");
	if (message > 0) {
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
				return res.redirect("/login");
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
				from: "podgorodeczkij199@gmail.com",
				subject: "Signup to Online Shop",
				html: "<h1>You are signed up</h1>",
			});
		})
		.catch((err) => console.log(err));
};
