import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from "../config/config.js";

const Op = db.Sequelize.Op;
const API_KEYS = db.api_keys;

export const api_keys_rules = {
	forFindingKey: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(async (unique_id, { req }) => {
				return API_KEYS.findOne({ where: { unique_id: unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Key not found!');
				});
			})
	],
	forFindingKeyFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(async (unique_id, { req }) => {
				return API_KEYS.findOne({ where: { unique_id: unique_id, status: default_delete_status } }).then(data => {
					if (!data) return Promise.reject('Key not found!');
				});
			})
	],
	forAdding: [
		check('alias', "Alias is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 150 })
			.withMessage("Invalid length (3 - 150) characters"),
		check('type', "Type is required")
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
			.custom(async email => {
				return API_KEYS.findOne({
					where: {
						email: email,
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
	],
	forSigningIn: [
		check('key', "Key is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail(),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
	],
	forVerifyingSignIn: [
		check('key', "Key is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail(),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('otp', "OTP is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 6, max: 6 })
			.withMessage("Invalid OTP length (6 digits required)")
	]
};