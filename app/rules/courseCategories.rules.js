import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const COURSE_CATEGORIES = db.course_categories;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const course_categories_rules = {
	forFindingCourseCategoryInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSE_CATEGORIES.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Category not found!');
				});
			})
	],
	forFindingCourseCategory: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSE_CATEGORIES.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Category not found!');
				});
			})
	],
	forFindingCourseCategoryFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSE_CATEGORIES.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Category not found!');
				});
			})
	],
	forFindingCourseCategoryAlt: [
		check('course_category_unique_id', "Course Category Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(course_category_unique_id => {
				return COURSE_CATEGORIES.findOne({ where: { unique_id: course_category_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Course Category not found!');
				});
			})
	],
	forFindingCourseCategoryAltOptional: [
		check('course_category_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(course_category_unique_id => {
				return COURSE_CATEGORIES.findOne({ where: { unique_id: course_category_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Course Category not found!');
				});
			})
	],
	forAdding: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((title, { req }) => {
				return COURSE_CATEGORIES.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						[Op.or]: [
							{
								title: {
									[Op.like]: `%${title}`
								}
							},
							{
								stripped: strip_text(title),
							}
						],
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Course Category already exists!');
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
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((title, { req }) => {
				return COURSE_CATEGORIES.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						[Op.or]: [
							{
								title: {
									[Op.like]: `%${title}`
								}
							},
							{
								stripped: strip_text(title),
							}
						],
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || '',
						},
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Course Category already exists!');
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
				return COURSE_CATEGORIES.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Category not found!');
				});
			}),
	]
};  