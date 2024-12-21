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

const PRESENTATIONS = db.presentations;
const Op = db.Sequelize.Op;

export async function getPresentations(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PRESENTATIONS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PRESENTATIONS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(presentations => {
			if (!presentations || presentations.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations loaded" }, { ...presentations, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations loaded" }, { ...presentations });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getPresentation(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		PRESENTATIONS.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(presentation => {
			if (!presentation) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Presentation not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentation loaded" }, presentation);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchPresentations(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PRESENTATIONS.count({
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

		PRESENTATIONS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
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
		}).then(presentations => {
			if (!presentations || presentations.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations loaded" }, { ...presentations, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations loaded" }, { ...presentations });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getPresentationsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PRESENTATIONS.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PRESENTATIONS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
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
		}).then(presentations => {
			if (!presentations || presentations.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations loaded" }, { ...presentations, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Presentations loaded" }, { ...presentations });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetPresentations(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PRESENTATIONS.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PRESENTATIONS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(presentations => {
			if (!presentations || presentations.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Presentations Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Presentations loaded" }, { ...presentations, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Presentations loaded" }, { ...presentations });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetPresentation(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		PRESENTATIONS.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async presentation => {
			if (!presentation) {
				NotFoundError(res, { unique_id: anonymous, text: "Presentation not found" }, null);
			} else {
				const presentation_view_update = await PRESENTATIONS.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Presentation loaded" }, presentation);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchPresentations(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PRESENTATIONS.count({
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

		PRESENTATIONS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
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
		}).then(presentations => {
			if (!presentations || presentations.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Presentations Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Presentations loaded" }, { ...presentations, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Presentations loaded" }, { ...presentations });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addPresentation(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const presentation_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const presentation = await PRESENTATIONS.create(
					{
						unique_id: presentation_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						title: payload.title,
						stripped: strip_text(payload.title),
						other: payload.other ? payload.other : null,
						image: payload.image ? payload.image : null,
						image_public_id: payload.image_public_id ? payload.image_public_id : null,
						file: payload.file ? payload.file : null,
						file_type: payload.file_type ? payload.file_type : null,
						file_public_id: payload.file_public_id ? payload.file_public_id : null,
						views: zero,
						status: default_status
					}, { transaction }
				);

				if (presentation) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Presentation created successfully!" }, { unique_id: presentation_unique_id });
				} else {
					throw new Error("Error adding presentation");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePresentationDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const presentation = await PRESENTATIONS.update(
					{
						...payload,
						stripped: strip_text(payload.title),
						other: payload.other ? payload.other : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (presentation > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Presentation not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePresentationImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const presentation_details = await PRESENTATIONS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!presentation_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Presentation not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const presentation = await PRESENTATIONS.update(
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

					if (presentation > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (presentation_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: presentation_details.image_public_id });
						}
					} else {
						throw new Error("Presentation not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePresentationFile(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const presentation_details = await PRESENTATIONS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!presentation_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Presentation not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const presentation = await PRESENTATIONS.update(
						{
							file: payload.file ? payload.file : null,
							file_type: payload.file_type ? payload.file_type : null,
							file_public_id: payload.file_public_id ? payload.file_public_id : null,
						}, {
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (presentation > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former file available
						if (presentation_details.file_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: presentation_details.file_public_id });
						}
					} else {
						throw new Error("Presentation not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deletePresentation(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const presentation_details = await PRESENTATIONS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!presentation_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Presentation not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const presentation = await PRESENTATIONS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (presentation > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Presentation was deleted successfully!" });

						// Delete former image available
						if (presentation_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: presentation_details.image_public_id });
						}

						// Delete former file available
						if (presentation_details.file_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: presentation_details.file_public_id });
						}
					} else {
						throw new Error("Error deleting presentation");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};