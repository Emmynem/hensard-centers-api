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

const CENTERS = db.centers;
const Op = db.Sequelize.Op;

export async function getCenters(req, res) {
	const total_records = await CENTERS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	CENTERS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(centers => {
		if (!centers || centers.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Centers Not found" }, []);
		} else {
			// SuccessResponse(res, { unique_id: tag_root, text: "Centers loaded" }, { ...centers, pages: pagination.pages });
			SuccessResponse(res, { unique_id: tag_root, text: "Centers loaded" }, { ...centers });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function getCenter(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		CENTERS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload
			},
		}).then(center => {
			if (!center) {
				NotFoundError(res, { unique_id: tag_root, text: "Center not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Center loaded" }, center);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function searchCenters(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await CENTERS.count({
			where: {
				[Op.or]: [
					{
						name: {
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

		CENTERS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				[Op.or]: [
					{
						name: {
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
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(centers => {
			if (!centers || centers.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Centers Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: tag_root, text: "Centers loaded" }, { ...centers, pages: pagination.pages });
				SuccessResponse(res, { unique_id: tag_root, text: "Centers loaded" }, { ...centers });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function getCentersSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await CENTERS.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		CENTERS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload
			},
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(centers => {
			if (!centers || centers.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Centers Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: tag_root, text: "Centers loaded" }, { ...centers, pages: pagination.pages });
				SuccessResponse(res, { unique_id: tag_root, text: "Centers loaded" }, { ...centers });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetCenters(req, res) {
	const total_records = await CENTERS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	CENTERS.findAndCountAll({
		attributes: { exclude: ['id', 'image_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(centers => {
		if (!centers || centers.length === 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Centers Not found" }, []);
		} else {
			// SuccessResponse(res, { unique_id: anonymous, text: "Centers loaded" }, { ...centers, pages: pagination.pages });
			SuccessResponse(res, { unique_id: anonymous, text: "Centers loaded" }, { ...centers });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function publicGetCenter(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		CENTERS.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'status'] },
			where: {
				...payload,
			},
		}).then(async center => {
			if (!center) {
				NotFoundError(res, { unique_id: anonymous, text: "Center not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Center loaded" }, center);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchCenters(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await CENTERS.count({
			where: {
				[Op.or]: [
					{
						name: {
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

		CENTERS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				[Op.or]: [
					{
						name: {
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
		}).then(centers => {
			if (!centers || centers.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Centers Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Centers loaded" }, { ...centers, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Centers loaded" }, { ...centers });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addCenter(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const center_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const center = await CENTERS.create(
					{
						unique_id: center_unique_id,
						name: payload.name,
						stripped: strip_text(payload.name),
						acronym: payload.acronym,
						url: payload.url ? payload.url : null,
						image: payload.image ? payload.image : null,
						image_public_id: payload.image_public_id ? payload.image_public_id : null,
						status: default_status
					}, { transaction }
				);

				if (center) {
					SuccessResponse(res, { unique_id: tag_root, text: "Center created successfully!" }, { unique_id: center_unique_id });
				} else {
					throw new Error("Error adding center");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateCenterDetails(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const center = await CENTERS.update(
					{
						...payload,
						stripped: strip_text(payload.name),
						url: payload.url ? payload.url : null,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (center > 0) {
					SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Center not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function updateCenterImage(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const center_details = await CENTERS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!center_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Center not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const center = await CENTERS.update(
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

					if (center > 0) {
						SuccessResponse(res, { unique_id: tag_root, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (center_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: center_details.image_public_id });
						}
					} else {
						throw new Error("Center not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function deleteCenter(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const center_details = await CENTERS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!center_details) {
				NotFoundError(res, { unique_id: tag_root, text: "Center not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const center = await CENTERS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (center > 0) {
						OtherSuccessResponse(res, { unique_id: tag_root, text: "Center was deleted successfully!" });

						// Delete former image available
						if (center_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: center_details.image_public_id });
						}
					} else {
						throw new Error("Error deleting center");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};