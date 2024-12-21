import { validationResult, matchedData } from 'express-validator';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, random_uuid, zero, strip_text, today_str, enrollment_status, return_all_letters_lowercase, getFileExtension, mailer_url
} from '../config/config.js';
import db from "../models/index.js";
import { deleteImage } from '../middleware/uploads.js';
import { user_certification, user_enrollment } from '../config/templates.js';

dotenv.config();

const { clouder_key, cloudy_name, cloudy_key, cloudy_secret, cloud_mailer_key, host_type, smtp_host, cloud_mailer_username, cloud_mailer_password, from_email } = process.env;

const ENROLLMENTS = db.enrollments;
const CENTERS = db.centers;
const COURSES = db.courses;
const USERS = db.users;
const Op = db.Sequelize.Op;

export async function getEnrollments(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getEnrollment(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		ENROLLMENTS.findOne({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
		}).then(enrollment => {
			if (!enrollment) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Enrollment not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollment loaded" }, enrollment);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchEnrollments(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				[Op.or]: [
					{
						reference: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$course.title$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.firstname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.middlename$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.lastname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			}, 
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				[Op.or]: [
					{
						reference: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$course.title$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.firstname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.middlename$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.lastname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
			order: [
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getEnrollmentsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function filterEnrollmentsByEnrolledDate(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ 
			where: { 
				center_unique_id: center_unique_id || payload.center_unique_id, 
				enrolled_date: {
					[Op.gte]: payload.start_date,
					[Op.lte]: payload.end_date
				}
			} 
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id, 
				enrolled_date: {
					[Op.gte]: payload.start_date,
					[Op.lte]: payload.end_date
				}
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function filterEnrollmentsByCompletionDate(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ 
			where: { 
				center_unique_id: center_unique_id || payload.center_unique_id, 
				completion_date: {
					[Op.gte]: payload.start_date,
					[Op.lte]: payload.end_date
				}
			} 
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id, 
				completion_date: {
					[Op.gte]: payload.start_date,
					[Op.lte]: payload.end_date
				}
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function filterEnrollmentsByCertificationDate(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ 
			where: { 
				center_unique_id: center_unique_id || payload.center_unique_id, 
				certification_date: {
					[Op.gte]: payload.start_date,
					[Op.lte]: payload.end_date
				}
			} 
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id, 
				certification_date: {
					[Op.gte]: payload.start_date,
					[Op.lte]: payload.end_date
				}
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
				}
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetEnrollments(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'enrollment_details', 'certificate_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'image']
				}
			],
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Enrollments Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetEnrollment(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		ENROLLMENTS.findOne({
			attributes: { exclude: ['id', 'certificate_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'image']
				}
			],
		}).then(async enrollment => {
			if (!enrollment) {
				NotFoundError(res, { unique_id: anonymous, text: "Enrollment not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Enrollment loaded" }, enrollment);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchEnrollments(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({
			where: {
				center_unique_id: payload.center_unique_id,
				[Op.or]: [
					{
						reference: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$course.title$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.firstname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.middlename$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.lastname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'enrollment_details', 'certificate_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id,
				[Op.or]: [
					{
						reference: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$course.title$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.firstname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.middlename$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.lastname$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'image']
				}
			],
			order: [
				['createdAt', 'DESC']
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Enrollments Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function getUserEnrollments(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await ENROLLMENTS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id, user_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		ENROLLMENTS.findAndCountAll({
			attributes: { exclude: ['id', 'enrollment_details', 'certificate_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id, 
				user_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(enrollments => {
			if (!enrollments || enrollments.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments, pages: pagination.pages });
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollments loaded" }, { ...enrollments });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getUserEnrollment(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		ENROLLMENTS.findOne({
			attributes: { exclude: ['id', 'certificate_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id,
				user_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount', 'certificate', 'image', 'views']
				},
			],
		}).then(enrollment => {
			if (!enrollment) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Enrollment not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollment loaded" }, enrollment);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function addEnrollment(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const enrollment_details = await ENROLLMENTS.findOne({
				where: {
					center_unique_id: center_unique_id || payload.center_unique_id,
					user_unique_id: payload.user_unique_id,
					course_unique_id: payload.course_unique_id,
					enrollment_status: {
						[Op.ne]: enrollment_status.cancelled
					},
					status: default_status
				}
			});

			if (enrollment_details) {
				BadRequestError(res, { unique_id: user_unique_id, text: "User Course Enrollment already exists!" }, null);
			} else {
				const user_details = await USERS.findOne({
					where: {
						unique_id: payload.user_unique_id,
						status: default_status
					},
				});

				const course_details = await COURSES.findOne({
					where: {
						unique_id: payload.course_unique_id,
						status: default_status
					},
					include: [
						{
							model: CENTERS,
							attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
						},
					]
				});

				if (!course_details || !user_details) {
					NotFoundError(res, { unique_id: user_unique_id, text: "Course or User not found" }, null);
				} else {
					const enrollment_unique_id = uuidv4();
					const reference = random_uuid(4);

					const { email_html, email_subject, email_text } = user_enrollment(
						{
							center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
							center_image: course_details.center.image,
							center_url: course_details.center.url,
							username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
							email: user_details.email,
							course: course_details.title,
							course_certificate: course_details.certificate,
							course_image: course_details.image,
							reference: reference,
							enrolled_date: today_str(),
							enrollment_status: enrollment_status.enrolled
						}
					);

					const mailer_response = await axios.post(
						`${mailer_url}/send`,
						{
							host_type: host_type,
							smtp_host: smtp_host,
							username: cloud_mailer_username,
							password: cloud_mailer_password,
							from_email: course_details.center.acronym + " " + from_email,
							to_email: return_all_letters_lowercase(user_details.email),
							subject: email_subject,
							text: email_text,
							html: email_html,
						},
						{
							headers: {
								'mailer-access-key': cloud_mailer_key
							}
						}
					);

					if (mailer_response.data.success) {
						if (mailer_response.data.data === null) {
							BadRequestError(response, { unique_id: user_unique_id, text: "Unable to send email to user" }, null);
						} else {
							await db.sequelize.transaction(async (transaction) => {
								const enrollment = await ENROLLMENTS.create(
									{
										unique_id: enrollment_unique_id,
										center_unique_id: center_unique_id || payload.center_unique_id,
										user_unique_id: payload.user_unique_id,
										course_unique_id: payload.course_unique_id,
										reference: reference,
										enrollment_details: course_details.enrollment_details,
										enrolled_date: today_str(),
										enrollment_status: enrollment_status.enrolled,
										status: default_status
									}, { transaction }
								);
		
								if (enrollment) {
									SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollment created successfully!" }, { unique_id: enrollment_unique_id, reference });
								} else {
									throw new Error("Error adding course");
								}
							});
						}
					} else {
						BadRequestError(res, { unique_id: user_unique_id, text: mailer_response.data.message }, null);
					}
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateEnrollmentDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const enrollment = await ENROLLMENTS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}, 
				include: [
					{
						model: COURSES,
						attributes: ['unique_id', 'reference', 'title', 'stripped', 'enrollment_details', 'currency', 'amount', 'certificate', 'image', 'views']
					},
				],
			});

			if (!enrollment) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Enrollment not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const update_enrollment = await ENROLLMENTS.update(
						{
							enrollment_details: enrollment.course.enrollment_details
						}, {
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);
	
					if (update_enrollment > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
					} else {
						throw new Error("Enrollment not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function issueCertification(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const enrollment = await ENROLLMENTS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				},
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
					{
						model: COURSES,
						attributes: ['unique_id', 'reference', 'title', 'stripped', 'enrollment_details', 'currency', 'amount', 'certificate', 'image', 'views']
					},
					{
						model: USERS,
						attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'profile_image']
					}, 
				],
			});

			if (!enrollment) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Enrollment not found" }, null);
				
				// Delete former certificate available
				if (payload.certificate_public_id !== null) {
					await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: payload.certificate_public_id });
				}
			} else if (enrollment.enrollment_status !== enrollment_status.completed) {
				BadRequestError(res, { unique_id: user_unique_id, text: "Enrollment for course hasn't been completed yet" }, null);

				// Delete former certificate available
				if (payload.certificate_public_id !== null) {
					await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: payload.certificate_public_id });
				}
			} else {
				const certificate_name = enrollment.user.firstname + (enrollment.user.middlename ? " " + enrollment.user.middlename + " " : " ") + enrollment.user.lastname + " certificate for " + enrollment.course.title;
				
				const { email_html, email_subject, email_text } = user_certification(
					{ 
						center_name: enrollment.center.name + " (" + enrollment.center.acronym + ")", 
						center_image: enrollment.center.image, 
						center_url: enrollment.center.url, 
						username: enrollment.user.firstname + (enrollment.user.middlename ? " " + enrollment.user.middlename + " " : " ") + enrollment.user.lastname,
						email: enrollment.user.email,
						course: enrollment.course.title,
						course_certificate: enrollment.course.certificate,
						course_image: enrollment.course.image,
						reference: enrollment.reference,
						enrolled_date: enrollment.enrolled_date,
						completion_date: enrollment.completion_date,
						certificate: payload.certificate,
						certificate_type: payload.certificate_type,
						certificate_public_id: payload.certificate_public_id,
						certification_date: payload.certification_date,
						enrollment_status: enrollment_status.certified
					}
				);
	
				const mailer_response = await axios.post(
					`${mailer_url}/send`,
					{
						host_type: host_type,
						smtp_host: smtp_host,
						username: cloud_mailer_username,
						password: cloud_mailer_password,
						from_email: enrollment.center.acronym + " " + from_email,
						to_email: return_all_letters_lowercase(enrollment.user.email),
						subject: email_subject,
						text: email_text,
						html: email_html,
						attachments: [
							{
								filename: certificate_name + "." + getFileExtension(payload.certificate),
								path: payload.certificate
							}
						]
					},
					{
						headers: {
							'mailer-access-key': cloud_mailer_key
						}
					}
				);
	
				if (mailer_response.data.success) {
					if (mailer_response.data.data === null) {
						BadRequestError(response, { unique_id: user_unique_id, text: "Unable to send email to user" }, null);

						// Delete former certificate available
						if (payload.certificate_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: payload.certificate_public_id });
						}
					} else {
						await db.sequelize.transaction(async (transaction) => {
							const enrollment = await ENROLLMENTS.update(
								{
									certificate: payload.certificate,
									certificate_type: payload.certificate_type,
									certificate_public_id: payload.certificate_public_id,
									certification_date: payload.certification_date,
									enrollment_status: enrollment_status.certified
								}, {
									where: {
										unique_id: payload.unique_id,
										status: default_status
									},
									transaction
								}
							);
			
							if (enrollment > 0) {
								SuccessResponse(res, { unique_id: user_unique_id, text: "User certified successfully!" }, null);
							} else {
								throw new Error("Enrollment not found");
							}
						});
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: mailer_response.data.message }, null);

					// Delete former certificate available
					if (payload.certificate_public_id !== null) {
						await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: payload.certificate_public_id });
					}
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);

			// Delete former certificate available
			if (payload.certificate_public_id !== null) {
				await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: payload.certificate_public_id });
			}
		}
	}
};

export async function updateEnrollmentStatusCompleted(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const enrollment = await ENROLLMENTS.update(
					{
						enrollment_status: enrollment_status.completed,
						completion_date: today_str()
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (enrollment > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Enrollment not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateEnrollmentStatusCancelled(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const enrollment = await ENROLLMENTS.update(
					{
						enrollment_status: enrollment_status.cancelled
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (enrollment > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Enrollment not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteEnrollment(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const enrollment_details = await ENROLLMENTS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!enrollment_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Enrollment not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const enrollment = await ENROLLMENTS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (enrollment > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Enrollment was deleted successfully!" });

						// Delete former certificate available
						if (enrollment_details.certificate_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: enrollment_details.certificate_public_id });
						}
					} else {
						throw new Error("Error deleting enrollment");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};