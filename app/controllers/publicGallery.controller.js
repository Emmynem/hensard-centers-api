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

const PUBLIC_GALLERY = db.public_gallery;
const Op = db.Sequelize.Op;

export async function getAllPublicGallery(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PUBLIC_GALLERY.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PUBLIC_GALLERY.findAndCountAll({
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
		}).then(public_gallery => {
			if (!public_gallery || public_gallery.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, { ...public_gallery, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, { ...public_gallery });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getPublicGallery(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		PUBLIC_GALLERY.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(public_gallery => {
			if (!public_gallery) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Public Gallery not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, public_gallery);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchPublicGallery(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PUBLIC_GALLERY.count({
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

		PUBLIC_GALLERY.findAndCountAll({
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
		}).then(public_gallery => {
			if (!public_gallery || public_gallery.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, { ...public_gallery, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, { ...public_gallery });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getPublicGallerySpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PUBLIC_GALLERY.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PUBLIC_GALLERY.findAndCountAll({
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
		}).then(public_gallery => {
			if (!public_gallery || public_gallery.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, { ...public_gallery, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery loaded" }, { ...public_gallery });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetAllPublicGallery(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PUBLIC_GALLERY.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PUBLIC_GALLERY.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(public_gallery => {
			if (!public_gallery || public_gallery.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery loaded" }, { ...public_gallery, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery loaded" }, { ...public_gallery });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetPublicGallery(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		PUBLIC_GALLERY.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async public_gallery => {
			if (!public_gallery) {
				NotFoundError(res, { unique_id: anonymous, text: "Public Gallery not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery loaded" }, public_gallery);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchPublicGallery(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PUBLIC_GALLERY.count({
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

		PUBLIC_GALLERY.findAndCountAll({
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
		}).then(public_gallery => {
			if (!public_gallery || public_gallery.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery loaded" }, { ...public_gallery, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Public Gallery loaded" }, { ...public_gallery });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addPublicGallery(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const public_gallery_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const public_gallery = await PUBLIC_GALLERY.create(
					{
						unique_id: public_gallery_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						title: payload.title,
						stripped: strip_text(payload.title),
						details: payload.details ? payload.details : null,
						image: payload.image ? payload.image : null,
						image_public_id: payload.image_public_id ? payload.image_public_id : null,
						status: default_status
					}, { transaction }
				);

				if (public_gallery) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery created successfully!" }, { unique_id: public_gallery_unique_id });
				} else {
					throw new Error("Error adding public gallery");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePublicGalleryDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const public_gallery = await PUBLIC_GALLERY.update(
					{
						...payload,
						stripped: strip_text(payload.title),
						details: payload.details ? payload.details : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (public_gallery > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Public Gallery not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePublicGalleryImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const public_gallery_details = await PUBLIC_GALLERY.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!public_gallery_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Public Gallery not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const public_gallery = await PUBLIC_GALLERY.update(
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

					if (public_gallery > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (public_gallery_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: public_gallery_details.image_public_id });
						}
					} else {
						throw new Error("Public Gallery not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deletePublicGallery(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const public_gallery_details = await PUBLIC_GALLERY.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!public_gallery_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Public Gallery not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const public_gallery = await PUBLIC_GALLERY.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (public_gallery > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Public Gallery was deleted successfully!" });

						// Delete former image available
						if (public_gallery_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: public_gallery_details.image_public_id });
						}
					} else {
						throw new Error("Error deleting public_gallery");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};