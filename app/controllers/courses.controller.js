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

const COURSES = db.courses;
const COURSE_CATEGORIES = db.course_categories;
const COURSE_TYPES = db.course_types;
const Op = db.Sequelize.Op;

export async function getCourses(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSES.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";
	
		COURSES.findAndCountAll({
			attributes: { exclude: ['id', 'description', 'image_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				}, 
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(courses => {
			if (!courses || courses.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Courses Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Courses loaded" }, { ...courses, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Courses loaded" }, { ...courses });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getCourse(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		COURSES.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
		}).then(course => {
			if (!course) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Course loaded" }, course);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchCourses(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSES.count({
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

		COURSES.findAndCountAll({
			attributes: { exclude: ['id', 'description', 'image_public_id'] },
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
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
			order: [
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(courses => {
			if (!courses || courses.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Courses Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Courses loaded" }, { ...courses, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Courses loaded" }, { ...courses });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getCoursesSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSES.count({ 
			where: { 
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id,
				course_category_unique_id: !payload.course_category_unique_id ? { [Op.ne]: "all" } : payload.course_category_unique_id,
				course_type_unique_id: !payload.course_type_unique_id ? { [Op.ne]: "all" } : payload.course_type_unique_id,
				active_enrollment: !payload.active_enrollment ? { [Op.ne]: "all" } : payload.active_enrollment,
			} 
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSES.findAndCountAll({
			attributes: { exclude: ['id', 'description', 'image_public_id'] },
			where: {
				...payload, 
				center_unique_id: center_unique_id || payload.center_unique_id, 
				course_category_unique_id: !payload.course_category_unique_id ? { [Op.ne]: "all" } : payload.course_category_unique_id,
				course_type_unique_id: !payload.course_type_unique_id ? { [Op.ne]: "all" } : payload.course_type_unique_id,
				active_enrollment: !payload.active_enrollment ? { [Op.ne]: "all" } : payload.active_enrollment,
			},
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(courses => {
			if (!courses || courses.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Courses Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Courses loaded" }, { ...courses, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Courses loaded" }, { ...courses });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetCourses(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSES.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSES.findAndCountAll({
			attributes: { exclude: ['id', 'description', 'image_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			}, 
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(courses => {
			if (!courses || courses.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Courses Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Courses loaded" }, { ...courses, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Courses loaded" }, { ...courses });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicGetCoursesSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSES.count({ 
			where: { 
				...payload,
				center_unique_id: payload.center_unique_id,
				course_category_unique_id: !payload.course_category_unique_id ? { [Op.ne]: "all" } : payload.course_category_unique_id,
				course_type_unique_id: !payload.course_type_unique_id ? { [Op.ne]: "all" } : payload.course_type_unique_id,
				active_enrollment: !payload.active_enrollment ? { [Op.ne]: "all" } : payload.active_enrollment,
			} 
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		COURSES.findAndCountAll({
			attributes: { exclude: ['id', 'description', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id, 
				course_category_unique_id: !payload.course_category_unique_id ? { [Op.ne]: "all" } : payload.course_category_unique_id,
				course_type_unique_id: !payload.course_type_unique_id ? { [Op.ne]: "all" } : payload.course_type_unique_id,
				active_enrollment: !payload.active_enrollment ? { [Op.ne]: "all" } : payload.active_enrollment,
			}, 
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(courses => {
			if (!courses || courses.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Courses Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Courses loaded" }, { ...courses, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Courses loaded" }, { ...courses });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetCourse(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		COURSES.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
		}).then(async course => {
			if (!course) {
				NotFoundError(res, { unique_id: anonymous, text: "Course not found" }, null);
			} else {
				const course_view_update = await COURSES.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Course loaded" }, course);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchCourses(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await COURSES.count({
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

		COURSES.findAndCountAll({
			attributes: { exclude: ['id', 'description', 'image_public_id'] },
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
			include: [
				{
					model: COURSE_CATEGORIES,
					attributes: ['unique_id', 'title', 'stripped', 'image']
				},
				{
					model: COURSE_TYPES,
					attributes: ['unique_id', 'title', 'stripped']
				}
			], 
			order: [
				['createdAt', 'DESC']
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(courses => {
			if (!courses || courses.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Courses Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Courses loaded" }, { ...courses, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Courses loaded" }, { ...courses });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addCourse(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_unique_id = uuidv4();
			const reference = random_uuid(4);

			await db.sequelize.transaction(async (transaction) => {
				const course = await COURSES.create(
					{
						unique_id: course_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						course_category_unique_id: payload.course_category_unique_id,
						course_type_unique_id: payload.course_type_unique_id,
						title: payload.title,
						stripped: strip_text(payload.title),
						reference: reference,
						description: payload.description,
						currency: payload.currency,
						amount: parseInt(payload.amount),
						certificate: payload.certificate ? payload.certificate : null,
						certificate_template: null,
						enrollment_details: null,
						image: payload.image ? payload.image : null,
						image_public_id: payload.image_public_id ? payload.image_public_id : null,
						views: zero,
						active_enrollment: false_status,
						status: default_status
					}, { transaction }
				);

				if (course) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Course created successfully!" }, { unique_id: course_unique_id, reference });
				} else {
					throw new Error("Error adding course");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const course = await COURSES.update(
					{
						...payload,
						stripped: strip_text(payload.title),
						amount: parseInt(payload.amount),
						certificate: payload.certificate ? payload.certificate : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (course > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Course not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseCertificateTemplate(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const course = await COURSES.update(
					{
						certificate_template: payload.certificate_template,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (course > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Course not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseEnrollmentDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const course = await COURSES.update(
					{
						enrollment_details: payload.enrollment_details,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (course > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Course not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseOtherDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const course = await COURSES.update(
					{
						course_category_unique_id: payload.course_category_unique_id,
						course_type_unique_id: payload.course_type_unique_id,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (course > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Course not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function toggleCourseActiveEnrollment(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_details = await COURSES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!course_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Enrollment not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const course = await COURSES.update(
						{
							active_enrollment: course_details.active_enrollment ? false_status : true_status
						}, {
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (course > 0) {
						SuccessResponse(res, {
							unique_id: user_unique_id, text: `Course Enrollment ${course_details.active_enrollment ? "deactivated" : "activated"} successfully!` }, null);
					} else {
						throw new Error("Course not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateCourseImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_details = await COURSES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!course_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const course = await COURSES.update(
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

					if (course > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (course_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: course_details.image_public_id });
						}
					} else {
						throw new Error("Course not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteCourse(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const course_details = await COURSES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!course_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Course not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const course = await COURSES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (course > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Course was deleted successfully!" });

						// Delete former image available
						if (course_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: course_details.image_public_id });
						}
					} else {
						throw new Error("Error deleting course");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};