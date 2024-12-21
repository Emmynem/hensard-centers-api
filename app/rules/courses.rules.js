import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const COURSES = db.courses;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const courses_rules = {
	forFindingCourseInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSES.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Course not found!');
				});
			})
	],
	forFindingCourse: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSES.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course not found!');
				});
			})
	],
	forFindingCourseFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return COURSES.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course not found!');
				});
			})
	],
	forFindingCourseAlt: [
		check('course_unique_id', "Course Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(course_unique_id => {
				return COURSES.findOne({ where: { unique_id: course_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Course not found!');
				});
			})
	],
	forFindingCourseAltOptional: [
		check('course_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(course_unique_id => {
				return COURSES.findOne({ where: { unique_id: course_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Course not found!');
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
				return COURSES.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						course_category_unique_id: req.query.course_category_unique_id || req.body.course_category_unique_id || '',
						course_type_unique_id: req.query.course_type_unique_id || req.body.course_type_unique_id || '',
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
					if (data) return Promise.reject('Course already exists!');
				});
			}),
		check('description', "Description is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
		check('currency')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 10 })
			.withMessage("Invalid length (2 - 10) characters"),
		check('amount', "Amount is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isFloat()
			.custom(amount => {
				if (amount === 0) return false;
				else if (amount < 1) return false;
				else return true;
			})
			.withMessage("Amount invalid"),
		check('certificate')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
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
				return COURSES.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						course_category_unique_id: req.query.course_category_unique_id || req.body.course_category_unique_id || '',
						course_type_unique_id: req.query.course_type_unique_id || req.body.course_type_unique_id || '',
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
					if (data) return Promise.reject('Course already exists!');
				});
			}),
		check('description', "Description is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
		check('currency')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 10 })
			.withMessage("Invalid length (2 - 10) characters"),
		check('amount', "Amount is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isFloat()
			.custom(amount => {
				if (amount === 0) return false;
				else if (amount < 1) return false;
				else return true;
			})
			.withMessage("Amount invalid"),
		check('certificate')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
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
	forUpdatingCertificateTemplate: [
		check('certificate_template', "Certificate Template is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
	],
	forUpdatingEnrollmentDetails: [
		check('enrollment_details', "Enrollment Details is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((stripped, { req }) => {
				return COURSES.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course not found!');
				});
			}),
	],
	forFindingViaReference: [
		check('reference', "Reference is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters")
			.bail()
			.custom((reference, { req }) => {
				return COURSES.findOne({
					where: {
						reference: reference,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Course not found!');
				});
			}),
	]
};  