import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, random_uuid, zero, strip_text
} from '../config/config.js';
import db from "../models/index.js";
import { deleteImage } from '../middleware/uploads.js';

dotenv.config();

const { clouder_key, cloudy_name, cloudy_key, cloudy_secret } = process.env;

const COURSE_TYPES = db.course_types;
const Op = db.Sequelize.Op;

export async function getCourseTypes(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const total_records = await COURSE_TYPES.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	COURSE_TYPES.findAndCountAll({
		attributes: { exclude: ['id'] },
		where: {
			center_unique_id: center_unique_id || payload.center_unique_id
		}, 
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(course_types => {
		if (!course_types || course_types.length === 0) {
			SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types loaded" }, { ...course_types, pages: pagination.pages });
			// SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types loaded" }, { ...course_types });
		}
	}).catch(err => {
		ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
	});
};

export function getCourseType(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		COURSE_TYPES.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(course_type => {
			if (!course_type) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course Type not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Type loaded" }, course_type);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchCourseTypes(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_TYPES.count({
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				[Op.or]: [
					{
						title: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		COURSE_TYPES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id,
				[Op.or]: [
					{
						title: {
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
			order: [
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(course_types => {
			if (!course_types || course_types.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types loaded" }, { ...course_types, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types loaded" }, { ...course_types });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getCourseTypesSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_TYPES.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSE_TYPES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(course_types => {
			if (!course_types || course_types.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types loaded" }, { ...course_types, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Course Types loaded" }, { ...course_types });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetCourseTypes(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_TYPES.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSE_TYPES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: payload.center_unique_id
			}, 
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(course_types => {
			if (!course_types || course_types.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Course Types Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Course Types loaded" }, { ...course_types, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Course Types loaded" }, { ...course_types });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetCourseType(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		COURSE_TYPES.findOne({
			attributes: { exclude: ['id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async course_type => {
			if (!course_type) {
				NotFoundError(res, { unique_id: anonymous, text: "Course Type not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Course Type loaded" }, course_type);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchCourseTypes(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_TYPES.count({
			where: {
				center_unique_id: payload.center_unique_id, 
				[Op.or]: [
					{
						title: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		COURSE_TYPES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: payload.center_unique_id, 
				[Op.or]: [
					{
						title: {
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
			order: [
				['createdAt', 'DESC']
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(course_types => {
			if (!course_types || course_types.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Course Types Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Course Types loaded" }, { ...course_types, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Course Types loaded" }, { ...course_types });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addCourseType(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_type_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const course_type = await COURSE_TYPES.create(
					{
						unique_id: course_type_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						title: payload.title,
						stripped: strip_text(payload.title),
						status: default_status
					}, { transaction }
				);

				if (course_type) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Course Type created successfully!" }, { unique_id: course_type_unique_id });
				} else {
					throw new Error("Error adding course type");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseTypeDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const course_type = await COURSE_TYPES.update(
					{
						...payload,
						stripped: strip_text(payload.title),
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (course_type > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Course Type not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteCourseType(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_type_details = await COURSE_TYPES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!course_type_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course Type not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const course_type = await COURSE_TYPES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (course_type > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Course Type was deleted successfully!" });
					} else {
						throw new Error("Error deleting course type");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};