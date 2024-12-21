import { check } from 'express-validator';
import moment from 'moment';
import {
	password_options, default_status, check_length_TEXT, validate_future_date, validate_future_end_date, default_delete_status, user_types
} from '../config/config.js';
import db from "../models/index.js";

const USERS = db.users;
const Op = db.Sequelize.Op;

export const user_rules = {
	forFindingUser: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return USERS.findOne({ where: { unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forFindingUserEmailForVerification: [
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom((email, { reg }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', email, status: default_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forFindingUserFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return USERS.findOne({ where: { unique_id, status: default_delete_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forFindingUserAlt: [
		check('user_unique_id', "User Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(user_unique_id => {
				return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forAddingStudent: [
		check('method', "Method is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('firstname', "Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('lastname', "Lastname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom((email, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', email, type: user_types.student } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('phone_number', "Phone Number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isMobilePhone()
			.withMessage('Invalid phone number')
			.bail()
			.custom((phone_number, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', phone_number, type: user_types.student } }).then(data => {
					if (data) return Promise.reject('Phone number already exists!');
				});
			}),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('date_of_birth')
			.optional({ checkFalsy: false })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
		check('address')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('country')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('city')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('password', "Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isStrongPassword(password_options)
			.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		check('confirmPassword', "Confirm Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
			.withMessage('Passwords are different')
	],
	forAddingStaff: [
		check('method', "Method is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('firstname', "Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('lastname', "Lastname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom((email, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', email, type: user_types.staff } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('phone_number', "Phone Number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isMobilePhone()
			.withMessage('Invalid phone number')
			.bail()
			.custom((phone_number, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', phone_number, type: user_types.staff } }).then(data => {
					if (data) return Promise.reject('Phone number already exists!');
				});
			}),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('date_of_birth')
			.optional({ checkFalsy: false })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
		check('address')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('country')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('city')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('password', "Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isStrongPassword(password_options)
			.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		check('confirmPassword', "Confirm Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
			.withMessage('Passwords are different')
	],
	forAddingStudentViaOther: [
		check('method', "Method is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('firstname', "Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('lastname', "Lastname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom((email, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', email, type: user_types.student } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage('Invalid phone number')
			.bail()
			.custom((phone_number, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', phone_number, type: user_types.student } }).then(data => {
					if (data) return Promise.reject('Phone number already exists!');
				});
			}),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('date_of_birth')
			.optional({ checkFalsy: false })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
		check('address')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('country', "Country is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('city')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('profile_image', "Profile Image is required (url)")
			.exists({ checkNull: true, checkFalsy: true }),
		// check('password', "Password is required")
		// 	.exists({ checkNull: true, checkFalsy: true })
		// 	.bail()
		// 	.isString().isStrongPassword(password_options)
		// 	.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		// check('confirmPassword', "Confirm Password is required")
		// 	.exists({ checkNull: true, checkFalsy: true })
		// 	.bail()
		// 	.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
		// 	.withMessage('Passwords are different')
	],
	forAddingStaffViaOther: [
		check('method', "Method is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('firstname', "Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('lastname', "Lastname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom((email, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', email, type: user_types.staff } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage('Invalid phone number')
			.bail()
			.custom((phone_number, { req }) => {
				return USERS.findOne({ where: { center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '', phone_number, type: user_types.staff } }).then(data => {
					if (data) return Promise.reject('Phone number already exists!');
				});
			}),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('date_of_birth')
			.optional({ checkFalsy: false })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
		check('address')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('country', "Country is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('city')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('profile_image', "Profile Image is required (url)")
			.exists({ checkNull: true, checkFalsy: true }),
		// check('password', "Password is required")
		// 	.exists({ checkNull: true, checkFalsy: true })
		// 	.bail()
		// 	.isString().isStrongPassword(password_options)
		// 	.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		// check('confirmPassword', "Confirm Password is required")
		// 	.exists({ checkNull: true, checkFalsy: true })
		// 	.bail()
		// 	.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
		// 	.withMessage('Passwords are different')
	],
	forEmailLogin: [
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('password').exists().isString().withMessage("Password is required"),
		check('remember_me')
			.optional({ checkFalsy: false })
			.bail()
			.isBoolean()
			.withMessage("Value should be true or false")
	],
	forEmailLoginAlt: [
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('remember_me')
			.optional({ checkFalsy: false })
			.bail()
			.isBoolean()
			.withMessage("Value should be true or false")
	],
	forGeneralLogin: [
		check('login_id', "Login ID is required (Email or Phone Number)")
			.exists({ checkNull: true, checkFalsy: true })
			.bail(),
		check('password').exists().isString().withMessage("Password is required"),
		check('remember_me')
			.optional({ checkFalsy: false })
			.bail()
			.isBoolean()
			.withMessage("Value should be true or false")
	],
	forUpdatingNames: [
		check('firstname', "Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
		check('lastname', "Lastname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
	],
	forUpdatingAddressDetails: [
		check('address', "Address is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('country', "Country is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state', "State is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('city', "City is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('city_of_origin', "City of Origin is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state_of_origin', "State of Origin is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('nationality', "Nationality is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
	], 
	forUpdatingDetails: [
		check('phone_number', "Phone number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isMobilePhone()
			.bail()
			.custom((phone_number, { req }) => {
				return USERS.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						phone_number,
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || req.UNIQUE_ID || '',
						}
					}
				}).then(data => {
					if (data) return Promise.reject('Phone number already exists!');
				});
			}),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('date_of_birth', "Date of Birth is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
	],
	forChangingPassword: [
		check('oldPassword', "Old Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.isString()
			.withMessage("Invalid old password"),
		check('password', "Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isStrongPassword(password_options)
			.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		check('confirmPassword', "Confirm Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
			.withMessage('Passwords are different')
	],
	forGeneralPasswordReset: [
		check('login_id', "Login ID is required (Email or Phone Number)")
			.exists({ checkNull: true, checkFalsy: true })
			.bail(),
	],
	forEmail: [
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
	],
	forSearching: [
		check('search', "Search is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
	],
	forProfileImageUpload: [
		check('profile_image', "Profile Image is required (url)")
			.exists({ checkNull: true, checkFalsy: true }),
		check('profile_image_public_id', "Profile Image Public Id is required")
			.exists({ checkNull: true, checkFalsy: true })
	],
};