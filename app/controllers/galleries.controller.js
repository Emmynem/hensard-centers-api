import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, random_uuid, zero, strip_text, return_bulk_gallery_array
} from '../config/config.js';
import db from "../models/index.js";
import { deleteImage } from '../middleware/uploads.js';

dotenv.config();

const { clouder_key, cloudy_name, cloudy_key, cloudy_secret } = process.env;

const GALLERIES = db.galleries;
const Op = db.Sequelize.Op;

export async function getGalleries(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await GALLERIES.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		GALLERIES.findAndCountAll({
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
		}).then(galleries => {
			if (!galleries || galleries.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Galleries Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Galleries loaded" }, { ...galleries, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Galleries loaded" }, { ...galleries });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getGallery(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		GALLERIES.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(gallery => {
			if (!gallery) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Gallery not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Gallery loaded" }, gallery);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetGalleries(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await GALLERIES.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		GALLERIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(galleries => {
			if (!galleries || galleries.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Galleries Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Galleries loaded" }, { ...galleries, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Galleries loaded" }, { ...galleries });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetGallery(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		GALLERIES.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async gallery => {
			if (!gallery) {
				NotFoundError(res, { unique_id: anonymous, text: "Gallery not found" }, null);
			} else {
				const gallery_view_update = await GALLERIES.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Gallery loaded" }, gallery);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function uploadGalleryImages(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const data = {
				center_unique_id: center_unique_id || payload.center_unique_id
			};

			await db.sequelize.transaction(async (transaction) => {
				const galleries = await GALLERIES.bulkCreate(return_bulk_gallery_array(payload.galleries, data), { transaction });

				if (galleries.length > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Gallery images created successfully!" });
				} else {
					throw new Error("Error adding gallery images");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteGalleryImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const gallery_details = await GALLERIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!gallery_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Gallery not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const gallery = await GALLERIES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (gallery > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Gallery image was deleted successfully!" });

						// Delete former image available
						if (gallery_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: gallery_details.image_public_id });
						}
					} else {
						throw new Error("Error deleting gallery image");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};