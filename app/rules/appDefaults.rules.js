import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, validate_app_default_type, validate_app_default_value, default_delete_status } from '../config/config.js';

const Op = db.Sequelize.Op;
const APP_DEFAULTS = db.app_defaults;

export const app_defaults_rules = {
	forFindingAppDefault: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(async (unique_id, { req }) => {
				return APP_DEFAULTS.findOne({ where: { unique_id: unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('App Default not found!');
				});
			})
	],
	forFindingAppDefaultFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(async (unique_id, { req }) => {
				return APP_DEFAULTS.findOne({ where: { unique_id: unique_id, status: default_delete_status } }).then(data => {
					if (!data) return Promise.reject('App Default not found!');
				});
			})
	],
	forAddingAndUpdating: [
		check('criteria', "Criteria is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('data_type', "Data Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(data_type => !!validate_app_default_type(data_type))
			.withMessage("Invalid data type, e.g. STRING, INTEGER, BIGINT, BOOLEAN, MAP or ARRAY."),
		check('value', "Value is required")
			.exists({ checkNull: true, checkFalsy: false })
			.bail()
			.custom((value, { req }) => !!validate_app_default_value(value, req.body.data_type))
			.withMessage(`Invalid data type value`)
	]
};