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

const POLICIES = db.policies;
const Op = db.Sequelize.Op;

export async function getPolicies(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POLICIES.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POLICIES.findAndCountAll({
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
		}).then(policies => {
			if (!policies || policies.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policies Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policies loaded" }, { ...policies, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Policies loaded" }, { ...policies });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getPolicy(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		POLICIES.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(policy => {
			if (!policy) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Policy not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policy loaded" }, policy);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchPolicies(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POLICIES.count({
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

		POLICIES.findAndCountAll({
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
		}).then(policies => {
			if (!policies || policies.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policies Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policies loaded" }, { ...policies, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Policies loaded" }, { ...policies });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getPoliciesSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POLICIES.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POLICIES.findAndCountAll({
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
		}).then(policies => {
			if (!policies || policies.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policies Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Policies loaded" }, { ...policies, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Policies loaded" }, { ...policies });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetPolicies(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POLICIES.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POLICIES.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(policies => {
			if (!policies || policies.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Policies Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Policies loaded" }, { ...policies, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Policies loaded" }, { ...policies });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetPolicy(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		POLICIES.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async policy => {
			if (!policy) {
				NotFoundError(res, { unique_id: anonymous, text: "Policy not found" }, null);
			} else {
				const policy_view_update = await POLICIES.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Policy loaded" }, policy);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchPolicies(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POLICIES.count({
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

		POLICIES.findAndCountAll({
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
		}).then(policies => {
			if (!policies || policies.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Policies Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Policies loaded" }, { ...policies, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Policies loaded" }, { ...policies });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addPolicy(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const policy_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const policy = await POLICIES.create(
					{
						unique_id: policy_unique_id,
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

				if (policy) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Policy created successfully!" }, { unique_id: policy_unique_id });
				} else {
					throw new Error("Error adding policy");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePolicyDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const policy = await POLICIES.update(
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

				if (policy > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Policy not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePolicyImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const policy_details = await POLICIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!policy_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Policy not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const policy = await POLICIES.update(
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

					if (policy > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (policy_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: policy_details.image_public_id });
						}
					} else {
						throw new Error("Policy not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePolicyFile(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const policy_details = await POLICIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!policy_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Policy not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const policy = await POLICIES.update(
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

					if (policy > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former file available
						if (policy_details.file_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: policy_details.file_public_id });
						}
					} else {
						throw new Error("Policy not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deletePolicy(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const policy_details = await POLICIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!policy_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Policy not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const policy = await POLICIES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (policy > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Policy was deleted successfully!" });

						// Delete former image available
						if (policy_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: policy_details.image_public_id });
						}

						// Delete former file available
						if (policy_details.file_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: policy_details.file_public_id });
						}
					} else {
						throw new Error("Error deleting policy");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};