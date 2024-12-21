import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const COURSE_TYPES = db.course_types;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const course_types_rules = {
	forFindingCourseTypeInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSE_TYPES.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Type not found!');
				});
			})
	],
	forFindingCourseType: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSE_TYPES.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Type not found!');
				});
			})
	],
	forFindingCourseTypeFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSE_TYPES.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Type not found!');
				});
			})
	],
	forFindingCourseTypeAlt: [
		check('course_type_unique_id', "Course Type Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(course_type_unique_id => {
				return COURSE_TYPES.findOne({ where: { unique_id: course_type_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Course Type not found!');
				});
			})
	],
	forFindingCourseTypeAltOptional: [
		check('course_type_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(course_type_unique_id => {
				return COURSE_TYPES.findOne({ where: { unique_id: course_type_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Course Type not found!');
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
				return COURSE_TYPES.findOne({
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
					if (data) return Promise.reject('Course Type already exists!');
				});
			}),
	],
	forUpdatingDetails: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((title, { req }) => {
				return COURSE_TYPES.findOne({
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
					if (data) return Promise.reject('Course Type already exists!');
				});
			}),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((stripped, { req }) => {
				return COURSE_TYPES.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course Type not found!');
				});
			}),
	]
};  