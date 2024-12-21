import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import axios from "axios";
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, ForbiddenError, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, processing, payment_methods, currency, withdrawal, cancelled, completed, anonymous, paginate,
	tag_root, deposit, return_all_letters_uppercase, app_defaults, timestamp_str_alt, transaction_types, paystack_verify_payment_url, today_str, enrollment_status, 
	validate_future_end_date, gateways, squad_live_verify_payment_url, squad_sandbox_verify_payment_url, generate_reference, mailer_url, random_uuid
} from '../config/config.js';
import { 
	user_cancelled_deposit, user_cancelled_withdrawal, user_complete_deposit, user_complete_withdrawal, user_complete_enrollment_fee, user_cancelled_enrollment_fee,
	user_enrollment
} from '../config/templates.js';
import db from "../models/index.js";

dotenv.config();

const { cloud_mailer_key, host_type, smtp_host, cloud_mailer_username, cloud_mailer_password, from_email } = process.env;

const TRANSACTIONS = db.transactions;
const USERS = db.users;
const CENTERS = db.centers;
const COURSES = db.courses;
const COURSE_CATEGORIES = db.course_categories;
const COURSE_TYPES = db.course_types;
const ENROLLMENTS = db.enrollments;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export async function getTransactions(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number'],
				},
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length == 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getTransaction(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		TRANSACTIONS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number'],
				}, 
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			]
		}).then(transaction => {
			if (!transaction) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Transaction not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction loaded" }, transaction);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getTransactionsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number'],
				},
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length == 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function filterTransactions(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: USERS,
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number'],
				}, 
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length == 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Filtered Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Filtered Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchTransactions(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				[Op.or]: [
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						gateway: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
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
						transaction_status: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						details: {
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
						"$user.lastname$": {
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
						"$user.email$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.phone_number$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			},
			include: [
				{
					model: USERS,
					as: "user",
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number'],
				}, 
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			]
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id, 
				[Op.or]: [
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						gateway: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
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
						transaction_status: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						details: {
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
						"$user.lastname$": {
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
						"$user.email$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						"$user.phone_number$": {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			},
			include: [
				{
					model: USERS,
					as: "user",
					attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number'],
				}, 
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			],
			order: [
				// ["$user.firstname$", 'ASC'],
				// ["$user.lastname$", 'ASC'],
				// ["$user.middlename$", 'ASC'],
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function userGetTransactions(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({ where: { user_unique_id: user_unique_id, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				user_unique_id: user_unique_id, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			],
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function userGetTransaction(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		TRANSACTIONS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
				user_unique_id: user_unique_id, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			]
		}).then(transaction => {
			if (!transaction) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Transaction not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction loaded" }, transaction);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function userGetTransactionsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({ where: { ...payload, user_unique_id: user_unique_id, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
				user_unique_id: user_unique_id, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			], 
			order: [
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length == 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function userFilterTransactions(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({
			where: {
				user_unique_id: user_unique_id,
				center_unique_id: center_unique_id || payload.center_unique_id, 
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				user_unique_id: user_unique_id,
				center_unique_id: center_unique_id || payload.center_unique_id, 
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			},
			include: [
				{
					model: COURSES,
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			], 
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length == 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Filtered Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Filtered Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function userSearchTransactions(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await TRANSACTIONS.count({
			where: {
				user_unique_id: user_unique_id,
				center_unique_id: center_unique_id || payload.center_unique_id, 
				[Op.or]: [
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						gateway: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
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
						transaction_status: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						details: {
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
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		TRANSACTIONS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				user_unique_id: user_unique_id,
				center_unique_id: center_unique_id || payload.center_unique_id, 
				[Op.or]: [
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						gateway: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
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
						transaction_status: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						details: {
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
					attributes: ['unique_id', 'reference', 'title', 'currency', 'amount', 'views'],
					include: [
						{
							model: COURSE_CATEGORIES,
							attributes: ['unique_id', 'title', 'stripped', 'image']
						},
						{
							model: COURSE_TYPES,
							attributes: ['unique_id', 'title', 'stripped']
						}
					]
				},
			], 
			order: [
				// ["$user.firstname$", 'ASC'],
				// ["$user.lastname$", 'ASC'],
				// ["$user.middlename$", 'ASC'],
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(transactions => {
			if (!transactions || transactions.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions loaded" }, { ...transactions, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getPaystackSecretKey(req, res) {
	APP_DEFAULTS.findOne({
		attributes: { exclude: ['id'] },
		where: {
			criteria: app_defaults.paystack_secret_key
		},
	}).then(app_default => {
		if (!app_default) {
			NotFoundError(res, { unique_id: anonymous, text: "Paystack Secret not found" }, null);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Paystack Secret loaded" }, app_default);
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function getPaystackPublicKey(req, res) {
	APP_DEFAULTS.findOne({
		attributes: { exclude: ['id'] },
		where: {
			criteria: app_defaults.paystack_public_key
		},
	}).then(app_default => {
		if (!app_default) {
			NotFoundError(res, { unique_id: anonymous, text: "Paystack Public not found" }, null);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Paystack Public loaded" }, app_default);
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function getSquadSecretKey(req, res) {
	APP_DEFAULTS.findOne({
		attributes: { exclude: ['id'] },
		where: {
			criteria: app_defaults.squad_secret_key
		},
	}).then(app_default => {
		if (!app_default) {
			NotFoundError(res, { unique_id: anonymous, text: "Squad Secret not found" }, null);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Squad Secret loaded" }, app_default);
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function getSquadPublicKey(req, res) {
	APP_DEFAULTS.findOne({
		attributes: { exclude: ['id'] },
		where: {
			criteria: app_defaults.squad_public_key
		},
	}).then(app_default => {
		if (!app_default) {
			NotFoundError(res, { unique_id: anonymous, text: "Squad Public not found" }, null);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Squad Public loaded" }, app_default);
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export async function addTransaction(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			// if (payload.currency !== currency) {
			// 	BadRequestError(res, { unique_id: user_unique_id, text: `${payload.currency} currency not supported for now!` }, null);
			// } else {
				const reference = generate_reference();

				await db.sequelize.transaction(async (transaction) => {

					const transactions = await TRANSACTIONS.create(
						{
							unique_id: uuidv4(),
							user_unique_id,
							center_unique_id: center_unique_id || payload.center_unique_id, 
							gateway: payload.gateway ? return_all_letters_uppercase(payload.gateway) : null,
							...payload,
							reference: payload.reference ? payload.reference : reference,
							other: payload.other ? payload.other : null,
							details: payload.details ? payload.details : null,
							status: default_status
						}, { transaction }
					);

					if (transactions) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" }, { unique_id: transactions.unique_id, reference: transactions.reference, currency: transactions.currency, amount: transactions.amount });
					} else {
						throw new Error("Error creating transaction");
					}
				});
			// }
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function addTransactionInternally(data, transaction) {

	let msg;
	let param;
	let return_data = { status: 0 };

	try {
		const transactions = TRANSACTIONS.create({
			...data,
			unique_id: uuidv4(),
			gateway: data.gateway ? return_all_letters_uppercase(data.gateway) : null,
			reference: data.reference ? data.reference : null,
			other: data.other ? data.other : null,
			details: data.details ? data.details : null,
			status: default_status
		}, { transaction });

		return_data.status = 1;

		logger.info({ unique_id: data.user_unique_id, text: `Transactions - ${data.type}` });
		return { ...return_data, err: null };
	} catch (err) {
		logger.error({ unique_id: data.user_unique_id, text: err.message });
		return { ...return_data, err: err.message };
	}
};

export async function addDeposit(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						type: transaction_types.deposit,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					BadRequestError(res, { unique_id: user_unique_id, text: "You have a pending deposit payment!!" }, null);
				} else {
					if (payload.payment_method === payment_methods.card && !payload.reference) {
						BadRequestError(res, { unique_id: user_unique_id, text: "No reference found for Card payment!" }, null);
					} else {
						// if (payload.currency !== currency) {
						// 	BadRequestError(res, { unique_id: user_unique_id, text: `${payload.currency} currency not supported for now!` }, null);
						// } else {
							const details = `${payload.currency} ${payload.amount.toLocaleString()} ${transaction_types.deposit.toLowerCase()}, payment via ${payload.payment_method}`;
							const reference = generate_reference();

							await db.sequelize.transaction(async (transaction) => {

								const transactions = await TRANSACTIONS.create(
									{
										unique_id: uuidv4(),
										user_unique_id,
										center_unique_id: center_unique_id || payload.center_unique_id, 
										type: transaction_types.deposit,
										gateway: payload.gateway ? return_all_letters_uppercase(payload.gateway) : null,
										payment_method: payload.payment_method,
										currency: payload.currency,
										amount: parseInt(payload.amount),
										reference: payload.reference ? payload.reference : reference,
										transaction_status: processing,
										details,
										other: null,
										status: default_status
									}, { transaction }
								);

								if (transactions) {
									SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" }, { unique_id: transactions.unique_id, reference: transactions.reference, currency: transactions.currency, amount: transactions.amount });
								} else {
									throw new Error("Error creating transaction");
								}
							});
						// }
					}
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function addDepositExternally(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						type: transaction_types.deposit,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					BadRequestError(res, { unique_id: user_details.unique_id, text: "You have a pending deposit payment!!" }, null);
				} else {
					if (payload.payment_method === payment_methods.card && !payload.reference) {
						BadRequestError(res, { unique_id: user_details.unique_id, text: "No reference found for Card payment!" }, null);
					} else {
						// if (payload.currency !== currency) {
						// 	BadRequestError(res, { unique_id: user_details.unique_id, text: `${payload.currency} currency not supported for now!` }, null);
						// } else {
							const details = `${payload.currency} ${payload.amount.toLocaleString()} ${transaction_types.deposit.toLowerCase()}, payment via ${payload.payment_method}`;
							const reference = generate_reference();

							await db.sequelize.transaction(async (transaction) => {

								const transactions = await TRANSACTIONS.create(
									{
										unique_id: uuidv4(),
										user_unique_id: user_details.unique_id,
										center_unique_id: center_unique_id || payload.center_unique_id, 
										type: transaction_types.deposit,
										gateway: payload.gateway ? return_all_letters_uppercase(payload.gateway) : null,
										payment_method: payload.payment_method,
										currency: payload.currency,
										amount: parseInt(payload.amount),
										reference: payload.reference ? payload.reference : reference,
										transaction_status: processing,
										details,
										other: null,
										status: default_status
									}, { transaction }
								);

								if (transactions) {
									SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction created successfully!" }, { unique_id: transactions.unique_id, reference: transactions.reference, currency: transactions.currency, amount: transactions.amount });
								} else {
									throw new Error("Error creating transaction");
								}
							});
						// }
					}
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function cancelDeposit(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.deposit,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					const { email_html, email_subject, email_text } = user_cancelled_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

					const mailer_response = await axios.post(
						`${mailer_url}/send`,
						{
							host_type: host_type,
							smtp_host: smtp_host,
							username: cloud_mailer_username,
							password: cloud_mailer_password,
							from_email: user_details.center.acronym + " " + from_email,
							to_email: user_details.email,
							subject: email_subject,
							text: email_text,
							html: email_html
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
								const transactions = await TRANSACTIONS.update(
									{
										transaction_status: cancelled,
									}, {
										where: {
											unique_id: payload.unique_id,
											status: default_status
										},
										transaction
									}
								);

								if (transactions > 0) {
									SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was cancelled successfully!" }, null);
								} else {
									throw new Error("Transaction not found");
								}
							});
						}
					} else {
						BadRequestError(res, { unique_id: user_unique_id, text: mailer_response.data.message }, null);
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function cancelDepositExternally(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.deposit,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					const { email_html, email_subject, email_text } = user_cancelled_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

					const mailer_response = await axios.post(
						`${mailer_url}/send`,
						{
							host_type: host_type,
							smtp_host: smtp_host,
							username: cloud_mailer_username,
							password: cloud_mailer_password,
							from_email: user_details.center.acronym + " " + from_email,
							to_email: user_details.email,
							subject: email_subject,
							text: email_text,
							html: email_html
						},
						{
							headers: {
								'mailer-access-key': cloud_mailer_key
							}
						}
					);

					if (mailer_response.data.success) {
						if (mailer_response.data.data === null) {
							BadRequestError(response, { unique_id: tag_root, text: "Unable to send email to user" }, null);
						} else {
							await db.sequelize.transaction(async (transaction) => {
								const transactions = await TRANSACTIONS.update(
									{
										transaction_status: cancelled,
									}, {
										where: {
											unique_id: payload.unique_id,
											status: default_status
										},
										transaction
									}
								);

								if (transactions > 0) {
									SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction was cancelled successfully!" }, null);
								} else {
									throw new Error("Transaction not found");
								}
							});
						}
					} else {
						BadRequestError(res, { unique_id: user_details.unique_id, text: mailer_response.data.message }, null);
					}
				} else {
					BadRequestError(res, { unique_id: user_details.unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function completeDeposit(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.deposit,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					if (current_transaction.payment_method === payment_methods.card) {
						if (current_transaction.gateway === gateways.paystack) {
							const app_default = await APP_DEFAULTS.findOne({
								attributes: { exclude: ['id'] },
								where: {
									criteria: app_defaults.paystack_secret_key
								}
							});

							if (app_default) {
								try {
									const paystack_transaction_res = await axios.get(
										`${paystack_verify_payment_url}${current_transaction.reference}`,
										{
											headers: {
												'Authorization': `Bearer ${app_default.value}`
											}
										}
									);

									if (paystack_transaction_res.data.status !== true) {
										BadRequestError(res, { unique_id: user_details.unique_id, text: "Error getting transaction for validation" }, null);
									} else if (paystack_transaction_res.data.data.status !== "success") {
										BadRequestError(res, { unique_id: user_details.unique_id, text: `Transaction unsuccessful (Status - ${return_all_letters_uppercase(paystack_transaction_res.data.data.status)})` }, null);
									} else {
										const updated_balance = user_details.balance + current_transaction.amount;

										const { email_html, email_subject, email_text } = user_complete_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

										const mailer_response = await axios.post(
											`${mailer_url}/send`,
											{
												host_type: host_type,
												smtp_host: smtp_host,
												username: cloud_mailer_username,
												password: cloud_mailer_password,
												from_email: user_details.center.acronym + " " + from_email,
												to_email: user_details.email,
												subject: email_subject,
												text: email_text,
												html: email_html
											},
											{
												headers: {
													'mailer-access-key': cloud_mailer_key
												}
											}
										);

										if (mailer_response.data.success) {
											if (mailer_response.data.data === null) {
												BadRequestError(response, { unique_id: user_details.unique_id, text: "Unable to send email to user" }, null);
											} else {
												await db.sequelize.transaction(async (transaction) => {
													const balance_update = await USERS.update(
														{
															balance: updated_balance,
														}, {
															where: {
																unique_id: user_details.unique_id,
																status: default_status
															},
															transaction
														}
													);

													if (balance_update > 0) {
														const transactions = await TRANSACTIONS.update(
															{
																transaction_status: completed,
															}, {
																where: {
																	unique_id: payload.unique_id,
																	user_unique_id: user_details.unique_id,
																	type: transaction_types.deposit,
																	status: default_status
																},
																transaction
															}
														);

														if (transactions > 0) {
															SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction was completed successfully!" });
														} else {
															throw new Error("Error completing transaction");
														}
													} else {
														throw new Error("Error updating balance");
													}
												});
											}
										} else {
											BadRequestError(res, { unique_id: user_details.unique_id, text: mailer_response.data.message }, null);
										}
									}
								} catch (error) {
									BadRequestError(res, { unique_id: user_details.unique_id, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
								}
							} else {
								BadRequestError(res, { unique_id: user_details.unique_id, text: "App Default for Paystack Gateway not found!" }, null);
							}
						} else if (current_transaction.gateway === gateways.squad) {
							const app_default = await APP_DEFAULTS.findOne({
								attributes: { exclude: ['id'] },
								where: {
									criteria: app_defaults.squad_secret_key
								}
							});

							if (app_default) {
								try {
									const squad_transaction_res = await axios.get(
										`${squad_live_verify_payment_url}${current_transaction.reference}`,
										{
											headers: {
												'Authorization': `Bearer ${app_default.value}`
											}
										}
									);

									if (squad_transaction_res.data.success !== true) {
										BadRequestError(res, { unique_id: user_details.unique_id, text: "Error getting transaction for validation" }, null);
									} else if (squad_transaction_res.data.data.transaction_status !== "success") {
										BadRequestError(res, { unique_id: user_details.unique_id, text: `Transaction unsuccessful (Status - ${squad_transaction_res.data.data.transaction_status})` }, null);
									} else if (squad_transaction_res.data.data.transaction_amount < current_transaction.amount) {
										BadRequestError(res, { unique_id: user_details.unique_id, text: `Invalid transaction amount!` }, null);
									} else {
										const updated_balance = user_details.balance + current_transaction.amount;

										const { email_html, email_subject, email_text } = user_complete_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

										const mailer_response = await axios.post(
											`${mailer_url}/send`,
											{
												host_type: host_type,
												smtp_host: smtp_host,
												username: cloud_mailer_username,
												password: cloud_mailer_password,
												from_email: user_details.center.acronym + " " + from_email,
												to_email: user_details.email,
												subject: email_subject,
												text: email_text,
												html: email_html
											},
											{
												headers: {
													'mailer-access-key': cloud_mailer_key
												}
											}
										);

										if (mailer_response.data.success) {
											if (mailer_response.data.data === null) {
												BadRequestError(response, { unique_id: user_details.unique_id, text: "Unable to send email to user" }, null);
											} else {
												await db.sequelize.transaction(async (transaction) => {
													const balance_update = await USERS.update(
														{
															balance: updated_balance,
														}, {
															where: {
																unique_id: user_details.unique_id,
																status: default_status
															},
															transaction
														}
													);

													if (balance_update > 0) {
														const transactions = await TRANSACTIONS.update(
															{
																transaction_status: completed,
															}, {
																where: {
																	unique_id: payload.unique_id,
																	user_unique_id: user_details.unique_id,
																	type: transaction_types.deposit,
																	status: default_status
																},
																transaction
															}
														);

														if (transactions > 0) {
															SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction was completed successfully!" });
														} else {
															throw new Error("Error completing transaction");
														}
													} else {
														throw new Error("Error updating balance");
													}
												});
											}
										} else {
											BadRequestError(res, { unique_id: user_details.unique_id, text: mailer_response.data.message }, null);
										}
									}
								} catch (error) {
									BadRequestError(res, { unique_id: user_details.unique_id, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
								}
							} else {
								BadRequestError(res, { unique_id: user_details.unique_id, text: "App Default for Squad Gateway not found!" }, null);
							}
						} else {
							BadRequestError(res, { unique_id: user_details.unique_id, text: "Invalid transaction gateway!" }, null);
						}
					} else {
						const updated_balance = user_details.balance + current_transaction.amount;

						const { email_html, email_subject, email_text } = user_complete_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

						const mailer_response = await axios.post(
							`${mailer_url}/send`,
							{
								host_type: host_type,
								smtp_host: smtp_host,
								username: cloud_mailer_username,
								password: cloud_mailer_password,
								from_email: user_details.center.acronym + " " + from_email,
								to_email: user_details.email,
								subject: email_subject,
								text: email_text,
								html: email_html
							},
							{
								headers: {
									'mailer-access-key': cloud_mailer_key
								}
							}
						);

						if (mailer_response.data.success) {
							if (mailer_response.data.data === null) {
								BadRequestError(response, { unique_id: user_details.unique_id, text: "Unable to send email to user" }, null);
							} else {
								await db.sequelize.transaction(async (transaction) => {
									const balance_update = await USERS.update(
										{
											balance: updated_balance,
										}, {
											where: {
												unique_id: user_details.unique_id,
												status: default_status
											},
											transaction
										}
									);

									if (balance_update > 0) {
										const transactions = await TRANSACTIONS.update(
											{
												transaction_status: completed,
											}, {
												where: {
													unique_id: payload.unique_id,
													user_unique_id: user_details.unique_id,
													type: transaction_types.deposit,
													status: default_status
												},
												transaction
											}
										);

										if (transactions > 0) {
											SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction was completed successfully!" });
										} else {
											throw new Error("Error completing transaction");
										}
									} else {
										throw new Error("Error updating balance");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: user_details.unique_id, text: mailer_response.data.message }, null);
						}
					}
				} else {
					BadRequestError(res, { unique_id: user_details.unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User balance!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function internalCompleteDeposit(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;
	
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: payload.unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.transaction_unique_id, // BEWARE OF THIS IN ROUTE
						type: transaction_types.deposit,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					if (current_transaction.payment_method === payment_methods.card) {
						if (current_transaction.gateway === gateways.paystack) {
							const app_default = await APP_DEFAULTS.findOne({
								attributes: { exclude: ['id'] },
								where: {
									criteria: app_defaults.paystack_secret_key
								}
							});

							if (app_default) {
								try {
									const paystack_transaction_res = await axios.get(
										`${paystack_verify_payment_url}${current_transaction.reference}`,
										{
											headers: {
												'Authorization': `Bearer ${app_default.value}`
											}
										}
									);

									if (paystack_transaction_res.data.status !== true) {
										BadRequestError(res, { unique_id: tag_root, text: "Error getting transaction for validation" }, null);
									} else if (paystack_transaction_res.data.data.status !== "success") {
										BadRequestError(res, { unique_id: tag_root, text: `Transaction unsuccessful (Status - ${return_all_letters_uppercase(paystack_transaction_res.data.data.status)})` }, null);
									} else {
										const updated_balance = user_details.balance + current_transaction.amount;

										const { email_html, email_subject, email_text } = user_complete_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

										const mailer_response = await axios.post(
											`${mailer_url}/send`,
											{
												host_type: host_type,
												smtp_host: smtp_host,
												username: cloud_mailer_username,
												password: cloud_mailer_password,
												from_email: user_details.center.acronym + " " + from_email,
												to_email: user_details.email,
												subject: email_subject,
												text: email_text,
												html: email_html
											},
											{
												headers: {
													'mailer-access-key': cloud_mailer_key
												}
											}
										);

										if (mailer_response.data.success) {
											if (mailer_response.data.data === null) {
												BadRequestError(response, { unique_id: tag_root, text: "Unable to send email to user" }, null);
											} else {
												await db.sequelize.transaction(async (transaction) => {
													const balance_update = await USERS.update(
														{
															balance: updated_balance,
														}, {
															where: {
																unique_id: user_details.unique_id,
																status: default_status
															},
															transaction
														}
													);

													if (balance_update > 0) {
														const transactions = await TRANSACTIONS.update(
															{
																transaction_status: completed,
															}, {
																where: {
																	unique_id: payload.unique_id,
																	user_unique_id: user_details.unique_id,
																	type: transaction_types.deposit,
																	status: default_status
																},
																transaction
															}
														);

														if (transactions > 0) {
															SuccessResponse(res, { unique_id: tag_root, text: "Transaction was completed successfully!" });
														} else {
															throw new Error("Error completing transaction");
														}
													} else {
														throw new Error("Error updating balance");
													}
												});
											}
										} else {
											BadRequestError(res, { unique_id: tag_root, text: mailer_response.data.message }, null);
										}
									}
								} catch (error) {
									BadRequestError(res, { unique_id: tag_root, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
								}
							} else {
								BadRequestError(res, { unique_id: tag_root, text: "App Default for Paystack Gateway not found!" }, null);
							}
						} else if (current_transaction.gateway === gateways.squad) {
							const app_default = await APP_DEFAULTS.findOne({
								attributes: { exclude: ['id'] },
								where: {
									criteria: app_defaults.squad_secret_key
								}
							});

							if (app_default) {
								try {
									const squad_transaction_res = await axios.get(
										`${squad_live_verify_payment_url}${current_transaction.reference}`,
										{
											headers: {
												'Authorization': `Bearer ${app_default.value}`
											}
										}
									);

									if (squad_transaction_res.data.success !== true) {
										BadRequestError(res, { unique_id: tag_root, text: "Error getting transaction for validation" }, null);
									} else if (squad_transaction_res.data.data.transaction_status !== "success") {
										BadRequestError(res, { unique_id: tag_root, text: `Transaction unsuccessful (Status - ${squad_transaction_res.data.data.transaction_status})` }, null);
									} else if (squad_transaction_res.data.data.transaction_amount < current_transaction.amount) {
										BadRequestError(res, { unique_id: tag_root, text: `Invalid transaction amount!` }, null);
									} else {
										const updated_balance = user_details.balance + current_transaction.amount;

										const { email_html, email_subject, email_text } = user_complete_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

										const mailer_response = await axios.post(
											`${mailer_url}/send`,
											{
												host_type: host_type,
												smtp_host: smtp_host,
												username: cloud_mailer_username,
												password: cloud_mailer_password,
												from_email: user_details.center.acronym + " " + from_email,
												to_email: user_details.email,
												subject: email_subject,
												text: email_text,
												html: email_html
											},
											{
												headers: {
													'mailer-access-key': cloud_mailer_key
												}
											}
										);

										if (mailer_response.data.success) {
											if (mailer_response.data.data === null) {
												BadRequestError(response, { unique_id: tag_root, text: "Unable to send email to user" }, null);
											} else {
												await db.sequelize.transaction(async (transaction) => {
													const balance_update = await USERS.update(
														{
															balance: updated_balance,
														}, {
															where: {
																unique_id: user_details.unique_id,
																status: default_status
															},
															transaction
														}
													);

													if (balance_update > 0) {
														const transactions = await TRANSACTIONS.update(
															{
																transaction_status: completed,
															}, {
																where: {
																	unique_id: payload.unique_id,
																	user_unique_id: user_details.unique_id,
																	type: transaction_types.deposit,
																	status: default_status
																},
																transaction
															}
														);

														if (transactions > 0) {
															SuccessResponse(res, { unique_id: tag_root, text: "Transaction was completed successfully!" });
														} else {
															throw new Error("Error completing transaction");
														}
													} else {
														throw new Error("Error updating balance");
													}
												});
											}
										} else {
											BadRequestError(res, { unique_id: tag_root, text: mailer_response.data.message }, null);
										}
									}
								} catch (error) {
									BadRequestError(res, { unique_id: tag_root, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
								}
							} else {
								BadRequestError(res, { unique_id: tag_root, text: "App Default for Squad Gateway not found!" }, null);
							}
						} else {
							BadRequestError(res, { unique_id: tag_root, text: "Invalid transaction gateway!" }, null);
						}
					} else {
						const updated_balance = user_details.balance + current_transaction.amount;

						const { email_html, email_subject, email_text } = user_complete_deposit({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

						const mailer_response = await axios.post(
							`${mailer_url}/send`,
							{
								host_type: host_type,
								smtp_host: smtp_host,
								username: cloud_mailer_username,
								password: cloud_mailer_password,
								from_email: user_details.center.acronym + " " + from_email,
								to_email: user_details.email,
								subject: email_subject,
								text: email_text,
								html: email_html
							},
							{
								headers: {
									'mailer-access-key': cloud_mailer_key
								}
							}
						);

						if (mailer_response.data.success) {
							if (mailer_response.data.data === null) {
								BadRequestError(response, { unique_id: tag_root, text: "Unable to send email to user" }, null);
							} else {
								await db.sequelize.transaction(async (transaction) => {
									const balance_update = await USERS.update(
										{
											balance: updated_balance,
										}, {
											where: {
												unique_id: user_details.unique_id,
												status: default_status
											},
											transaction
										}
									);

									if (balance_update > 0) {
										const transactions = await TRANSACTIONS.update(
											{
												transaction_status: completed,
											}, {
												where: {
													unique_id: payload.unique_id,
													user_unique_id: user_details.unique_id,
													type: transaction_types.deposit,
													status: default_status
												},
												transaction
											}
										);

										if (transactions > 0) {
											SuccessResponse(res, { unique_id: tag_root, text: "Transaction was completed successfully!" });
										} else {
											throw new Error("Error completing transaction");
										}
									} else {
										throw new Error("Error updating balance");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: tag_root, text: mailer_response.data.message }, null);
						}
					}
				} else {
					BadRequestError(res, { unique_id: tag_root, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: tag_root, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function addWithdrawal(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'balance', 'otp_code', 'otp_valid', 'otp_expiration'],
				where: {
					unique_id: user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				if (user_details.otp_code !== payload.otp) {
					NotFoundError(res, { unique_id: user_unique_id, text: "Invalid OTP" }, null);
				} else if (!user_details.otp_valid) {
					ForbiddenError(res, { unique_id: user_unique_id, text: "OTP invalid" }, null);
				} else if (!validate_future_end_date(moment().toDate(), user_details.otp_expiration)) {
					const invalidate_otp = await db.sequelize.transaction((t) => {
						return USERS.update({ otp_valid: false_status }, {
							where: {
								unique_id: user_unique_id,
								status: default_status
							}
						}, { transaction: t });
					})

					if (invalidate_otp > 0) {
						ForbiddenError(res, { unique_id: user_unique_id, text: "Expired OTP" }, null);
					} else {
						BadRequestError(res, { unique_id: user_unique_id, text: "Error invalidating OTP!" }, null);
					}
				} else {
					const current_transaction = await TRANSACTIONS.findOne({
						attributes: { exclude: ['id'] },
						where: {
							user_unique_id: user_details.unique_id,
							type: transaction_types.withdrawal,
							transaction_status: processing,
							status: default_status
						},
					});

					if (current_transaction) {
						BadRequestError(res, { unique_id: user_unique_id, text: "You have a pending withdrawal payment!!" }, null);
					} else {
						if (parseInt(payload.amount) > parseInt(user_details.balance)) {
							BadRequestError(res, { unique_id: user_unique_id, text: "Insufficient balance!" }, null);
						} else {
							// if (payload.currency !== currency) {
							// 	BadRequestError(res, { unique_id: user_unique_id, text: `${payload.currency} currency not supported for now!` }, null);
							// } else {
								const validate_otp = await db.sequelize.transaction((t) => {
									return USERS.update({ otp_valid: false_status }, {
										where: {
											unique_id: user_unique_id,
											status: default_status
										}
									}, { transaction: t });
								})

								if (validate_otp > 0) {
									const details = `${payload.currency} ${payload.amount.toLocaleString()} ${transaction_types.withdrawal.toLowerCase()}, payment via ${payment_methods.wallet}`;
									const reference = generate_reference();

									await db.sequelize.transaction(async (transaction) => {

										const transactions = await TRANSACTIONS.create(
											{
												unique_id: uuidv4(),
												user_unique_id,
												center_unique_id: center_unique_id || payload.center_unique_id, 
												type: transaction_types.withdrawal,
												payment_method: payment_methods.wallet,
												currency: payload.currency,
												amount: parseInt(payload.amount),
												reference: payload.reference ? payload.reference : reference,
												transaction_status: processing,
												details,
												other: null,
												status: default_status
											}, { transaction }
										);

										if (transactions) {
											SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" }, { unique_id: transactions.unique_id, reference: transactions.reference, currency: transactions.currency, amount: transactions.amount });
										} else {
											throw new Error("Error creating transaction");
										}
									});
								} else {
									BadRequestError(res, { unique_id: user_unique_id, text: "Error validating OTP!" }, null);
								}
							// }
						}
					}
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function addWithdrawalExternally(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'balance', 'otp_code', 'otp_valid', 'otp_expiration'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				},
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				if (user_details.otp_code !== payload.otp) {
					NotFoundError(res, { unique_id: user_details.unique_id, text: "Invalid OTP" }, null);
				} else if (!user_details.otp_valid) {
					ForbiddenError(res, { unique_id: user_details.unique_id, text: "OTP invalid" }, null);
				} else if (!validate_future_end_date(moment().toDate(), user_details.otp_expiration)) {
					const invalidate_otp = await db.sequelize.transaction((t) => {
						return USERS.update({ otp_valid: false_status }, {
							where: {
								unique_id: user_details.unique_id,
								status: default_status
							}
						}, { transaction: t });
					})

					if (invalidate_otp > 0) {
						ForbiddenError(res, { unique_id: user_details.unique_id, text: "Expired OTP" }, null);
					} else {
						BadRequestError(res, { unique_id: user_details.unique_id, text: "Error invalidating OTP!" }, null);
					}
				} else {
					const current_transaction = await TRANSACTIONS.findOne({
						attributes: { exclude: ['id'] },
						where: {
							user_unique_id: user_details.unique_id,
							type: transaction_types.withdrawal,
							transaction_status: processing,
							status: default_status
						},
					});

					if (current_transaction) {
						BadRequestError(res, { unique_id: user_details.unique_id, text: "You have a pending withdrawal payment!!" }, null);
					} else {
						if (parseInt(payload.amount) > parseInt(user_details.balance)) {
							BadRequestError(res, { unique_id: user_details.unique_id, text: "Insufficient balance!" }, null);
						} else {
							// if (payload.currency !== currency) {
							// 	BadRequestError(res, { unique_id: user_details.unique_id, text: `${payload.currency} currency not supported for now!` }, null);
							// } else {
								const validate_otp = await db.sequelize.transaction((t) => {
									return USERS.update({ otp_valid: false_status }, {
										where: {
											unique_id: user_details.unique_id,
											status: default_status
										}
									}, { transaction: t });
								})

								if (validate_otp > 0) {
									const details = `${payload.currency} ${payload.amount.toLocaleString()} ${transaction_types.withdrawal.toLowerCase()}, payment via ${payment_methods.wallet}`;
									const reference = generate_reference();

									await db.sequelize.transaction(async (transaction) => {

										const transactions = await TRANSACTIONS.create(
											{
												unique_id: uuidv4(),
												user_unique_id: user_details.unique_id,
												center_unique_id: center_unique_id || payload.center_unique_id, 
												type: transaction_types.withdrawal,
												payment_method: payment_methods.wallet,
												currency: payload.currency,
												amount: parseInt(payload.amount),
												reference: payload.reference ? payload.reference : reference,
												transaction_status: processing,
												details,
												other: null,
												status: default_status
											}, { transaction }
										);

										if (transactions) {
											SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction created successfully!" }, { unique_id: transactions.unique_id, reference: transactions.reference, currency: transactions.currency, amount: transactions.amount });
										} else {
											throw new Error("Error creating transaction");
										}
									});
								} else {
									BadRequestError(res, { unique_id: user_details.unique_id, text: "Error validating OTP!" }, null);
								}
							// }
						}
					}
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function cancelWithdrawal(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.withdrawal,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					const { email_html, email_subject, email_text } = user_cancelled_withdrawal({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

					const mailer_response = await axios.post(
						`${mailer_url}/send`,
						{
							host_type: host_type,
							smtp_host: smtp_host,
							username: cloud_mailer_username,
							password: cloud_mailer_password,
							from_email: user_details.center.acronym + " " + from_email,
							to_email: user_details.email,
							subject: email_subject,
							text: email_text,
							html: email_html
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
								const transactions = await TRANSACTIONS.update(
									{
										transaction_status: cancelled,
									}, {
										where: {
											unique_id: payload.unique_id,
											status: default_status
										},
										transaction
									}
								);

								if (transactions > 0) {
									SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was cancelled successfully!" }, null);
								} else {
									throw new Error("Transaction not found");
								}
							});
						}
					} else {
						BadRequestError(res, { unique_id: user_unique_id, text: mailer_response.data.message }, null);
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function cancelWithdrawalExternally(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.withdrawal,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					const { email_html, email_subject, email_text } = user_cancelled_withdrawal({ amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

					const mailer_response = await axios.post(
						`${mailer_url}/send`,
						{
							host_type: host_type,
							smtp_host: smtp_host,
							username: cloud_mailer_username,
							password: cloud_mailer_password,
							from_email: user_details.center.acronym + " " + from_email,
							to_email: user_details.email,
							subject: email_subject,
							text: email_text,
							html: email_html
						},
						{
							headers: {
								'mailer-access-key': cloud_mailer_key
							}
						}
					);

					if (mailer_response.data.success) {
						if (mailer_response.data.data === null) {
							BadRequestError(response, { unique_id: tag_root, text: "Unable to send email to user" }, null);
						} else {
							await db.sequelize.transaction(async (transaction) => {
								const transactions = await TRANSACTIONS.update(
									{
										transaction_status: cancelled,
									}, {
										where: {
											unique_id: payload.unique_id,
											status: default_status
										},
										transaction
									}
								);

								if (transactions > 0) {
									SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction was cancelled successfully!" }, null);
								} else {
									throw new Error("Transaction not found");
								}
							});
						}
					} else {
						BadRequestError(res, { unique_id: user_details.unique_id, text: mailer_response.data.message }, null);
					}
				} else {
					BadRequestError(res, { unique_id: user_details.unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function completeWithdrawal(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.withdrawal,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					if (user_details.balance < current_transaction.amount) {
						BadRequestError(res, { unique_id: user_details.unique_id, text: "Balance insufficient for withdrawal!" }, null);
					} else {
						const updated_balance = user_details.balance - current_transaction.amount;

						const { email_html, email_subject, email_text } = user_complete_withdrawal({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

						const mailer_response = await axios.post(
							`${mailer_url}/send`,
							{
								host_type: host_type,
								smtp_host: smtp_host,
								username: cloud_mailer_username,
								password: cloud_mailer_password,
								from_email: user_details.center.acronym + " " + from_email,
								to_email: user_details.email,
								subject: email_subject,
								text: email_text,
								html: email_html
							},
							{
								headers: {
									'mailer-access-key': cloud_mailer_key
								}
							}
						);

						if (mailer_response.data.success) {
							if (mailer_response.data.data === null) {
								BadRequestError(response, { unique_id: user_details.unique_id, text: "Unable to send email to user" }, null);
							} else {
								await db.sequelize.transaction(async (transaction) => {
									const balance_update = await USERS.update(
										{
											balance: updated_balance,
										}, {
											where: {
												unique_id: user_details.unique_id,
												status: default_status
											},
											transaction
										}
									);

									if (balance_update > 0) {
										const transactions = await TRANSACTIONS.update(
											{
												transaction_status: completed,
											}, {
												where: {
													unique_id: payload.unique_id,
													user_unique_id: user_details.unique_id,
													type: transaction_types.withdrawal,
													status: default_status
												},
												transaction
											}
										);

										if (transactions > 0) {
											SuccessResponse(res, { unique_id: user_details.unique_id, text: "Transaction was completed successfully!" });
										} else {
											throw new Error("Error completing transaction");
										}
									} else {
										throw new Error("Error updating balance");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: user_details.unique_id, text: mailer_response.data.message }, null);
						}
					}
				} else {
					BadRequestError(res, { unique_id: user_details.unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function internalCompleteWithdrawal(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				], 
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						unique_id: payload.unique_id,
						type: transaction_types.withdrawal,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					if (user_details.balance < current_transaction.amount) {
						BadRequestError(res, { unique_id: user_unique_id, text: "Balance insufficient for withdrawal!" }, null);
					} else {
						const updated_balance = user_details.balance - current_transaction.amount;

						const { email_html, email_subject, email_text } = user_complete_withdrawal({ center_name: user_details.center.name + " (" + user_details.center.acronym + ")", center_image: user_details.center.image, center_url: user_details.center.url, balance: updated_balance, amount: current_transaction.amount, username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname });

						const mailer_response = await axios.post(
							`${mailer_url}/send`,
							{
								host_type: host_type,
								smtp_host: smtp_host,
								username: cloud_mailer_username,
								password: cloud_mailer_password,
								from_email: user_details.center.acronym + " " + from_email,
								to_email: user_details.email,
								subject: email_subject,
								text: email_text,
								html: email_html
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
									const balance_update = await USERS.update(
										{
											balance: updated_balance,
										}, {
											where: {
												unique_id: user_details.unique_id,
												status: default_status
											},
											transaction
										}
									);

									if (balance_update > 0) {
										const transactions = await TRANSACTIONS.update(
											{
												transaction_status: completed,
											}, {
												where: {
													unique_id: payload.unique_id,
													user_unique_id: user_details.unique_id,
													type: transaction_types.withdrawal,
													status: default_status
												},
												transaction
											}
										);

										if (transactions > 0) {
											SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was completed successfully!" });
										} else {
											throw new Error("Error completing transaction");
										}
									} else {
										throw new Error("Error updating balance");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: user_unique_id, text: mailer_response.data.message }, null);
						}
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: "Processing Transaction not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "User balance not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function addEnrollmentFee(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'balance'],
				where: {
					unique_id: user_unique_id
				}
			});

			const course_details = await COURSES.findOne({
				attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount'],
				where: {
					unique_id: payload.course_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				]
			});
			
			const center_details = await CENTERS.findOne({
				attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url'],
				where: {
					unique_id: center_unique_id || payload.center_unique_id
				}
			});

			if (!user_details) {
				BadRequestError(res, { unique_id: user_unique_id, text: "User not found" }, null);
			} else if (!course_details) {
				BadRequestError(res, { unique_id: user_unique_id, text: "Course not found" }, null);
			} else if (!center_details) {
				BadRequestError(res, { unique_id: user_unique_id, text: "Center not found" }, null);
			} else {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						course_unique_id: payload.course_unique_id,
						type: transaction_types.enrollment_fee,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					BadRequestError(res, { unique_id: user_unique_id, text: `You have a pending payment for ${transaction_types.enrollment_fee} !!` }, { unique_id: current_transaction.unique_id, reference: current_transaction.reference, amount: current_transaction.amount, payment_method: current_transaction.payment_method, gateway: current_transaction.gateway });
				} else {
					const details = `${course_details.currency} ${course_details.amount.toLocaleString()} ${transaction_types.enrollment_fee.toLowerCase()}, via ${payload.payment_method} for ${course_details.title} course`;
					const transaction_unique_id = uuidv4();
					const reference = random_uuid(5);

					await db.sequelize.transaction(async (transaction) => {
						const add_transaction = await TRANSACTIONS.create(
							{
								unique_id: transaction_unique_id,
								center_unique_id: center_unique_id || payload.center_unique_id,
								user_unique_id,
								course_unique_id: payload.course_unique_id,
								type: transaction_types.enrollment_fee,
								gateway: return_all_letters_uppercase(payload.gateway),
								payment_method: payload.payment_method,
								currency: course_details.currency,
								amount: parseInt(course_details.amount),
								reference: reference,
								transaction_status: processing,
								details,
								status: default_status
							}, { transaction }
						);

						if (add_transaction) {
							SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollment payment created successfully!" }, { unique_id: transaction_unique_id, reference: add_transaction.reference, amount: add_transaction.amount, payment_method: add_transaction.payment_method, gateway: add_transaction.gateway });
						} else {
							throw new Error("Error adding enrollment payment");
						}
					});
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function cancelEnrollmentFee(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'type', 'firstname', 'middlename', 'lastname', 'email', 'balance'],
				where: {
					unique_id: user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				],
			});

			if (user_details) {
				const current_transaction = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						unique_id: payload.unique_id,
						user_unique_id: user_details.unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						type: transaction_types.enrollment_fee,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction) {
					const course_details = await COURSES.findOne({
						attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount'],
						where: {
							unique_id: current_transaction.course_unique_id
						}, 
						include: [
							{
								model: CENTERS,
								attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
							},
						]
					});

					if (!course_details) {
						BadRequestError(res, { unique_id: user_unique_id, text: "Course not found!" }, null);
					} else {
						const { email_html, email_subject, email_text } = user_cancelled_enrollment_fee(
							{ 
								center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
								center_image: course_details.center.image,
								center_url: course_details.center.url,
								currency: current_transaction.currency, 
								amount: current_transaction.amount.toLocaleString(), 
								reference: current_transaction.reference, 
								username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname, 
								course: course_details.title,
								course_certificate: course_details.certificate,
								course_image: course_details.image,
							}
						);

						const mailer_response = await axios.post(
							`${mailer_url}/send`,
							{
								host_type: host_type,
								smtp_host: smtp_host,
								username: cloud_mailer_username,
								password: cloud_mailer_password,
								from_email: user_details.center.acronym + " " + from_email,
								to_email: user_details.email,
								subject: email_subject,
								text: email_text,
								html: email_html
							},
							{
								headers: {
									'mailer-access-key': cloud_mailer_key
								}
							}
						);

						if (mailer_response.data.success) {
							if (mailer_response.data.data === null) {
								BadRequestError(response, { unique_id: tag_root, text: "Unable to send email to user" }, null);
							} else {
								await db.sequelize.transaction(async (transaction) => {
									const update_transaction = await TRANSACTIONS.update(
										{
											transaction_status: cancelled,
										}, {
											where: {
												unique_id: payload.unique_id,
												status: default_status
											},
											transaction
										}
									);

									if (update_transaction > 0) {
										SuccessResponse(res, { unique_id: user_unique_id, text: "Enrollment Fee was cancelled successfully!" }, null);
									} else {
										throw new Error("Enrollment Fee not found");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: user_unique_id, text: mailer_response.data.message }, null);
						}
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: "Processing Enrollment Fee not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "User not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function completeEnrollmentFee(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user_details = await USERS.findOne({
				attributes: ['unique_id', 'firstname', 'middlename', 'lastname', 'email', 'phone_number', 'balance'],
				where: {
					unique_id: req.USER_UNIQUE_ID || payload.user_unique_id
				}, 
				include: [
					{
						model: CENTERS,
						attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
					},
				]
			});

			if (user_details) {
				const current_transaction_details = await TRANSACTIONS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						user_unique_id: user_details.unique_id,
						center_unique_id: user_details.center.unique_id,
						reference: payload.reference,
						type: transaction_types.enrollment_fee,
						transaction_status: processing,
						status: default_status
					},
				});

				if (current_transaction_details) {
					const course_details = await COURSES.findOne({
						attributes: ['unique_id', 'reference', 'title', 'stripped', 'currency', 'amount'],
						where: {
							unique_id: current_transaction_details.course_unique_id
						},
						include: [
							{
								model: CENTERS,
								attributes: ['unique_id', 'name', 'stripped', 'acronym', 'image', 'url']
							},
						]
					});

					if (!course_details) {
						BadRequestError(res, { unique_id: user_unique_id, text: "Course not found!" }, null);
					} else {
						if (current_transaction_details.payment_method === payment_methods.card) {
							if (current_transaction_details.gateway === gateways.paystack) {
								const app_default = await APP_DEFAULTS.findOne({
									attributes: { exclude: ['id'] },
									where: {
										criteria: app_defaults.paystack_secret_key
									}
								});
	
								if (app_default) {
									try {
										const paystack_transaction_res = await axios.get(
											`${paystack_verify_payment_url}${current_transaction_details.reference}`,
											{
												headers: {
													'Authorization': `Bearer ${app_default.value}`
												}
											}
										);
	
										if (paystack_transaction_res.data.status !== true) {
											BadRequestError(res, { unique_id: user_details.unique_id, text: "Error getting payment for validation" }, null);
										} else if (paystack_transaction_res.data.data.status !== "success") {
											BadRequestError(res, { unique_id: user_details.unique_id, text: `Payment unsuccessful (Status - ${return_all_letters_uppercase(paystack_transaction_res.data.data.status)})` }, null);
										} else {
											const { email_html, email_subject, email_text } = user_complete_enrollment_fee(
												{
													center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
													center_image: course_details.center.image,
													center_url: course_details.center.url,
													currency: current_transaction_details.currency,
													amount: current_transaction_details.amount.toLocaleString(),
													reference: current_transaction_details.reference,
													username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
													course: course_details.title,
													course_certificate: course_details.certificate,
													course_image: course_details.image,
												}
											);
	
											const mailer_response = await axios.post(
												`${mailer_url}/send`,
												{
													host_type: host_type,
													smtp_host: smtp_host,
													username: cloud_mailer_username,
													password: cloud_mailer_password,
													from_email: user_details.center.acronym + " " + from_email,
													to_email: user_details.email,
													subject: email_subject,
													text: email_text,
													html: email_html
												},
												{
													headers: {
														'mailer-access-key': cloud_mailer_key
													}
												}
											);

											const enrollment_unique_id = uuidv4();

											const { email_html_2, email_subject_2, email_text_2 } = user_enrollment(
												{
													center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
													center_image: course_details.center.image,
													center_url: course_details.center.url,
													username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
													email: user_details.email,
													course: course_details.title,
													course_certificate: course_details.certificate,
													course_image: course_details.image,
													reference: current_transaction_details.reference,
													enrolled_date: today_str(),
													enrollment_status: enrollment_status.enrolled
												}
											);

											const mailer_response_2 = await axios.post(
												`${mailer_url}/send`,
												{
													host_type: host_type,
													smtp_host: smtp_host,
													username: cloud_mailer_username,
													password: cloud_mailer_password,
													from_email: user_details.center.acronym + " " + from_email,
													to_email: user_details.email,
													subject: email_subject_2,
													text: email_text_2,
													html: email_html_2,
												},
												{
													headers: {
														'mailer-access-key': cloud_mailer_key
													}
												}
											);
	
											if (mailer_response.data.success && mailer_response_2.data.success) {
												if (mailer_response.data.data === null) {
													BadRequestError(response, { unique_id: tag_root, text: "1 - Unable to send email to user" }, null);
												} else if (mailer_response_2.data.data === null) {
													BadRequestError(response, { unique_id: tag_root, text: "2 - Unable to send email to user" }, null);
												} else {
													await db.sequelize.transaction(async (transaction) => {
														const transactions = await TRANSACTIONS.update(
															{
																transaction_status: completed,
															}, {
																where: {
																	user_unique_id: user_details.unique_id,
																	center_unique_id: user_details.center.unique_id,
																	reference: current_transaction_details.reference,
																	type: transaction_types.enrollment_fee,
																	status: default_status
																},
																transaction
															}
														);
	
														if (transactions > 0) {
															const enrollment = await ENROLLMENTS.create(
																{
																	unique_id: enrollment_unique_id,
																	center_unique_id: user_details.center.unique_id,
																	user_unique_id: user_details.unique_id,
																	course_unique_id: current_transaction_details.course_unique_id,
																	reference: current_transaction_details.reference,
																	enrollment_details: course_details.enrollment_details,
																	enrolled_date: today_str(),
																	enrollment_status: enrollment_status.enrolled,
																	status: default_status
																}, { transaction }
															);

															if (enrollment) {
																SuccessResponse(res, { unique_id: user_details.unique_id, text: "Enrollment Fee was completed successfully!" });
															} else {
																throw new Error("Error adding enrollment");
															}
														} else {
															throw new Error("Error completing payment for enrollment fee");
														}
													});
												}
											} else {
												BadRequestError(res, { unique_id: user_details.unique_id, text: `1 - ${mailer_response.data.message} | 2 - ${mailer_response_2.data.message}` }, null);
											}
										}
									} catch (error) {
										BadRequestError(res, { unique_id: user_details.unique_id, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
									}
								} else {
									BadRequestError(res, { unique_id: user_details.unique_id, text: "App Default for Paystack Gateway not found!" }, null);
								}
							} else if (current_transaction_details.gateway === gateways.squad) {
								const app_default = await APP_DEFAULTS.findOne({
									attributes: { exclude: ['id'] },
									where: {
										criteria: app_defaults.squad_secret_key
									}
								});
	
								if (app_default) {
									try {
										const squad_transaction_res = await axios.get(
											`${squad_sandbox_verify_payment_url}${current_transaction_details.reference}`,
											{
												headers: {
													'Authorization': `Bearer ${app_default.value}`
												}
											}
										);
	
										if (squad_transaction_res.data.success !== true) {
											BadRequestError(res, { unique_id: user_details.unique_id, text: "Error getting payment for validation" }, null);
										} else if (squad_transaction_res.data.data.transaction_status !== "success") {
											BadRequestError(res, { unique_id: user_details.unique_id, text: `Payment unsuccessful (Status - ${squad_transaction_res.data.data.transaction_status})` }, null);
										}
										// else if (squad_transaction_res.data.data.transaction_amount < current_payments.amount) {
										// 	BadRequestError(res, { unique_id: user_details.unique_id, text: `Invalid transaction amount!` }, null);
										// } 
										else {
											const { email_html, email_subject, email_text } = user_complete_enrollment_fee(
												{
													center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
													center_image: course_details.center.image,
													center_url: course_details.center.url,
													currency: current_transaction_details.currency,
													amount: current_transaction_details.amount.toLocaleString(),
													reference: current_transaction_details.reference,
													username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
													course: course_details.title,
													course_certificate: course_details.certificate,
													course_image: course_details.image,
												}
											);

											const mailer_response = await axios.post(
												`${mailer_url}/send`,
												{
													host_type: host_type,
													smtp_host: smtp_host,
													username: cloud_mailer_username,
													password: cloud_mailer_password,
													from_email: user_details.center.acronym + " " + from_email,
													to_email: user_details.email,
													subject: email_subject,
													text: email_text,
													html: email_html
												},
												{
													headers: {
														'mailer-access-key': cloud_mailer_key
													}
												}
											);

											const enrollment_unique_id = uuidv4();

											const { email_html_2, email_subject_2, email_text_2 } = user_enrollment(
												{
													center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
													center_image: course_details.center.image,
													center_url: course_details.center.url,
													username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
													email: user_details.email,
													course: course_details.title,
													course_certificate: course_details.certificate,
													course_image: course_details.image,
													reference: current_transaction_details.reference,
													enrolled_date: today_str(),
													enrollment_status: enrollment_status.enrolled
												}
											);

											const mailer_response_2 = await axios.post(
												`${mailer_url}/send`,
												{
													host_type: host_type,
													smtp_host: smtp_host,
													username: cloud_mailer_username,
													password: cloud_mailer_password,
													from_email: user_details.center.acronym + " " + from_email,
													to_email: user_details.email,
													subject: email_subject_2,
													text: email_text_2,
													html: email_html_2,
												},
												{
													headers: {
														'mailer-access-key': cloud_mailer_key
													}
												}
											);
	
											if (mailer_response.data.success && mailer_response_2.data.success) {
												if (mailer_response.data.data === null) {
													BadRequestError(response, { unique_id: tag_root, text: "1 - Unable to send email to user" }, null);
												} else if (mailer_response_2.data.data === null) {
													BadRequestError(response, { unique_id: tag_root, text: "2 - Unable to send email to user" }, null);
												} else {
													await db.sequelize.transaction(async (transaction) => {
														const transactions = await TRANSACTIONS.update(
															{
																transaction_status: completed,
															}, {
																where: {
																	user_unique_id: user_details.unique_id,
																	center_unique_id: user_details.center.unique_id,
																	reference: current_transaction_details.reference,
																	type: transaction_types.enrollment_fee,
																	status: default_status
																},
																transaction
															}
														);

														if (transactions > 0) {
															const enrollment = await ENROLLMENTS.create(
																{
																	unique_id: enrollment_unique_id,
																	center_unique_id: user_details.center.unique_id,
																	user_unique_id: user_details.unique_id,
																	course_unique_id: current_transaction_details.course_unique_id,
																	reference: current_transaction_details.reference,
																	enrollment_details: course_details.enrollment_details,
																	enrolled_date: today_str(),
																	enrollment_status: enrollment_status.enrolled,
																	status: default_status
																}, { transaction }
															);

															if (enrollment) {
																SuccessResponse(res, { unique_id: user_details.unique_id, text: "Enrollment Fee was completed successfully!" });
															} else {
																throw new Error("Error adding enrollment");
															}
														} else {
															throw new Error("Error completing payment for enrollment fee");
														}
													});
												}
											} else {
												BadRequestError(res, { unique_id: user_details.unique_id, text: `1 - ${mailer_response.data.message} | 2 - ${mailer_response_2.data.message}` }, null);
											}
										}
									} catch (error) {
										BadRequestError(res, { unique_id: user_details.unique_id, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
									}
								} else {
									BadRequestError(res, { unique_id: user_details.unique_id, text: "App Default for Squad Gateway not found!" }, null);
								}
							} else {
								BadRequestError(res, { unique_id: user_details.unique_id, text: "Invalid transaction gateway!" }, null);
							}
						} else {
							const { email_html, email_subject, email_text } = user_complete_enrollment_fee(
								{
									center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
									center_image: course_details.center.image,
									center_url: course_details.center.url,
									currency: current_transaction_details.currency,
									amount: current_transaction_details.amount.toLocaleString(),
									reference: current_transaction_details.reference,
									username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
									course: course_details.title,
									course_certificate: course_details.certificate,
									course_image: course_details.image,
								}
							);

							const mailer_response = await axios.post(
								`${mailer_url}/send`,
								{
									host_type: host_type,
									smtp_host: smtp_host,
									username: cloud_mailer_username,
									password: cloud_mailer_password,
									from_email: user_details.center.acronym + " " + from_email,
									to_email: user_details.email,
									subject: email_subject,
									text: email_text,
									html: email_html
								},
								{
									headers: {
										'mailer-access-key': cloud_mailer_key
									}
								}
							);

							const enrollment_unique_id = uuidv4();

							const { email_html_2, email_subject_2, email_text_2 } = user_enrollment(
								{
									center_name: course_details.center.name + " (" + course_details.center.acronym + ")",
									center_image: course_details.center.image,
									center_url: course_details.center.url,
									username: user_details.firstname + (user_details.middlename ? " " + user_details.middlename + " " : " ") + user_details.lastname,
									email: user_details.email,
									course: course_details.title,
									course_certificate: course_details.certificate,
									course_image: course_details.image,
									reference: current_transaction_details.reference,
									enrolled_date: today_str(),
									enrollment_status: enrollment_status.enrolled
								}
							);

							const mailer_response_2 = await axios.post(
								`${mailer_url}/send`,
								{
									host_type: host_type,
									smtp_host: smtp_host,
									username: cloud_mailer_username,
									password: cloud_mailer_password,
									from_email: user_details.center.acronym + " " + from_email,
									to_email: user_details.email,
									subject: email_subject_2,
									text: email_text_2,
									html: email_html_2,
								},
								{
									headers: {
										'mailer-access-key': cloud_mailer_key
									}
								}
							);

							if (mailer_response.data.success && mailer_response_2.data.success) {
								if (mailer_response.data.data === null) {
									BadRequestError(response, { unique_id: tag_root, text: "1 - Unable to send email to user" }, null);
								} else if (mailer_response_2.data.data === null) {
									BadRequestError(response, { unique_id: tag_root, text: "2 - Unable to send email to user" }, null);
								} else {
									await db.sequelize.transaction(async (transaction) => {
										const transactions = await TRANSACTIONS.update(
											{
												transaction_status: completed,
											}, {
												where: {
													user_unique_id: user_details.unique_id,
													center_unique_id: user_details.center.unique_id,
													reference: current_transaction_details.reference,
													type: transaction_types.enrollment_fee,
													status: default_status
												},
												transaction
											}
										);

										if (transactions > 0) {
											const enrollment = await ENROLLMENTS.create(
												{
													unique_id: enrollment_unique_id,
													center_unique_id: user_details.center.unique_id,
													user_unique_id: user_details.unique_id,
													course_unique_id: current_transaction_details.course_unique_id,
													reference: current_transaction_details.reference,
													enrollment_details: course_details.enrollment_details,
													enrolled_date: today_str(),
													enrollment_status: enrollment_status.enrolled,
													status: default_status
												}, { transaction }
											);

											if (enrollment) {
												SuccessResponse(res, { unique_id: user_details.unique_id, text: "Enrollment Fee was completed successfully!" });
											} else {
												throw new Error("Error adding enrollment");
											}
										} else {
											throw new Error("Error completing payment for enrollment fee");
										}
									});
								}
							} else {
								BadRequestError(res, { unique_id: user_details.unique_id, text: `1 - ${mailer_response.data.message} | 2 - ${mailer_response_2.data.message}` }, null);
							}
						}
					}
				} else {
					BadRequestError(res, { unique_id: user_details.unique_id, text: "Processing Payment not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "User not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function deleteEnrollmentFee(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const transaction_res = await TRANSACTIONS.destroy(
					{
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (transaction_res > 0) {
					OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was deleted successfully!" });
				} else {
					throw new Error("Error deleting transaction");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};