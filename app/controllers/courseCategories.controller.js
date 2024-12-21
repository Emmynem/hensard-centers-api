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

const COURSE_CATEGORIES = db.course_categories;
const Op = db.Sequelize.Op;

export async function getCourseCategories(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_CATEGORIES.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";
	
		COURSE_CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(course_categories => {
			if (!course_categories || course_categories.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories loaded" }, { ...course_categories, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories loaded" }, { ...course_categories });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getCourseCategory(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		COURSE_CATEGORIES.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(course_category => {
			if (!course_category) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course Category not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Category loaded" }, course_category);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchCourseCategories(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_CATEGORIES.count({
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

		COURSE_CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
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
		}).then(course_categories => {
			if (!course_categories || course_categories.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories loaded" }, { ...course_categories, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories loaded" }, { ...course_categories });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getCourseCategoriesSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_CATEGORIES.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSE_CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
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
		}).then(course_categories => {
			if (!course_categories || course_categories.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories loaded" }, { ...course_categories, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Course Categories loaded" }, { ...course_categories });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetCourseCategories(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_CATEGORIES.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSE_CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(course_categories => {
			if (!course_categories || course_categories.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Course Categories Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Course Categories loaded" }, { ...course_categories, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Course Categories loaded" }, { ...course_categories });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetCourseCategory(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		COURSE_CATEGORIES.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async course_category => {
			if (!course_category) {
				NotFoundError(res, { unique_id: anonymous, text: "Course Category not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Course Category loaded" }, course_category);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchCourseCategories(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSE_CATEGORIES.count({
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

		COURSE_CATEGORIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
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
		}).then(course_categories => {
			if (!course_categories || course_categories.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Course Categories Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Course Categories loaded" }, { ...course_categories, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Course Categories loaded" }, { ...course_categories });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addCourseCategory(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_category_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const course_category = await COURSE_CATEGORIES.create(
					{
						unique_id: course_category_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						title: payload.title,
						stripped: strip_text(payload.title),
						image: payload.image ? payload.image : null,
						image_public_id: payload.image_public_id ? payload.image_public_id : null,
						status: default_status
					}, { transaction }
				);

				if (course_category) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Course Category created successfully!" }, { unique_id: course_category_unique_id });
				} else {
					throw new Error("Error adding course category");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseCategoryDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const course_category = await COURSE_CATEGORIES.update(
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

				if (course_category > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Course Category not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseCategoryImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_category_details = await COURSE_CATEGORIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!course_category_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course Category not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const course_category = await COURSE_CATEGORIES.update(
						{
							image: payload.image ? payload.image : null,
							image_public_id: payload.image_public_id ? payload.image_public_id : null,
						}, {
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (course_category > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (course_category_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: course_category_details.image_public_id });
						}
					} else {
						throw new Error("Course Category not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteCourseCategory(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_category_details = await COURSE_CATEGORIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!course_category_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course Category not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const course_category = await COURSE_CATEGORIES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (course_category > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Course Category was deleted successfully!" });

						// Delete former image available
						if (course_category_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: course_category_details.image_public_id });
						}
					} else {
						throw new Error("Error deleting course category");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};