import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const CATEGORIES = db.categories;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const categories_rules = {
	forFindingCategoryInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return CATEGORIES.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Category not found!');
				});
			})
	],
	forFindingCategory: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return CATEGORIES.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Category not found!');
				});
			})
	],
	forFindingCategoryFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return CATEGORIES.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Category not found!');
				});
			})
	],
	forFindingCategoryAlt: [
		check('category_unique_id', "Category Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(category_unique_id => {
				return CATEGORIES.findOne({ where: { unique_id: category_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Category not found!');
				});
			})
	],
	forFindingCategoryAltOptional: [
		check('category_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(category_unique_id => {
				return CATEGORIES.findOne({ where: { unique_id: category_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Category not found!');
				});
			})
	],
	forAdding: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((name, { req }) => {
				return CATEGORIES.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						[Op.or]: [
							{
								name: {
									[Op.like]: `%${name}`
								}
							},
							{
								stripped: strip_text(name),
							}
						],
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Category already exists!');
				});
			}),
		check('image')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		check('image_public_id')
			.optional({ checkFalsy: false }),
	],
	forUpdatingDetails: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((name, { req }) => {
				return CATEGORIES.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						[Op.or]: [
							{
								name: {
									[Op.like]: `%${name}`
								}
							},
							{
								stripped: strip_text(name),
							}
						],
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || '',
						},
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Category already exists!');
				});
			}),
	],
	forUpdatingImage: [
		check('image')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		check('image_public_id')
			.optional({ checkFalsy: false }),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((stripped, { req }) => {
				return CATEGORIES.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Category not found!');
				});
			}),
	]
};  