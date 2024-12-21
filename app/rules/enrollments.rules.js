import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const ENROLLMENTS = db.enrollments;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const enrollments_rules = {
	forFindingEnrollmentInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return ENROLLMENTS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Enrollment not found!');
				});
			})
	],
	forFindingEnrollment: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return ENROLLMENTS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Enrollment not found!');
				});
			})
	],
	forFindingEnrollmentFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return ENROLLMENTS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Enrollment not found!');
				});
			})
	],
	forFindingEnrollmentAlt: [
		check('enrollment_unique_id', "Enrollment Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(enrollment_unique_id => {
				return ENROLLMENTS.findOne({ where: { unique_id: enrollment_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Enrollment not found!');
				});
			})
	],
	forFindingEnrollmentAltOptional: [
		check('enrollment_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(enrollment_unique_id => {
				return ENROLLMENTS.findOne({ where: { unique_id: enrollment_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Enrollment not found!');
				});
			})
	],
	forIssuingCertificate: [
		check('certificate', "Certificate is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to a file"),
		check('certificate_type', "Certificate Type is required")
			.exists({ checkNull: true, checkFalsy: true }),
		check('certificate_public_id', "Certificate Public Id is required")
			.exists({ checkNull: true, checkFalsy: true }),
		check('certification_date', "Certification Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(certification_date => {
				const later = moment(certification_date, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Certified Date format (YYYY-MM-DD)"),
	],
	forFindingViaEnrollmentStatus: [
		check('enrollment_status', "Enrollment Status is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters")
	],
	forFindingViaReference: [
		check('reference', "Reference is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters")
			.bail()
			.custom((reference, { req }) => {
				return ENROLLMENTS.findOne({
					where: {
						reference: reference,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Enrollment not found!');
				});
			}),
	], 
	forFiltering: [
		check('start_date', "Start Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(start_date => {
				const later = moment(start_date, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid start datetime format (YYYY-MM-DD)"),
			// .bail()
			// .custom(start_date => !!validate_past_date(start_date))
			// .withMessage("Invalid start datetime"),
		check('end_date', "End Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(end_date => {
				const later = moment(end_date, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid end datetime format (YYYY-MM-DD)")
			.bail()
			.custom((end_date, { req }) => !!validate_future_end_date(req.query.start_date || req.body.start_date || '', end_date))
			.withMessage("Invalid end datetime"),
	],
};  