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

const JOURNALS = db.journals;
const Op = db.Sequelize.Op;

export async function getJournals(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await JOURNALS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		JOURNALS.findAndCountAll({
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
		}).then(journals => {
			if (!journals || journals.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journals Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journals loaded" }, { ...journals, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Journals loaded" }, { ...journals });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getJournal(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		JOURNALS.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(journal => {
			if (!journal) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Journal not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journal loaded" }, journal);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchJournals(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await JOURNALS.count({
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

		JOURNALS.findAndCountAll({
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
		}).then(journals => {
			if (!journals || journals.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journals Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journals loaded" }, { ...journals, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Journals loaded" }, { ...journals });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getJournalsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await JOURNALS.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		JOURNALS.findAndCountAll({
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
		}).then(journals => {
			if (!journals || journals.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journals Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Journals loaded" }, { ...journals, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Journals loaded" }, { ...journals });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetJournals(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await JOURNALS.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		JOURNALS.findAndCountAll({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(journals => {
			if (!journals || journals.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Journals Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Journals loaded" }, { ...journals, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Journals loaded" }, { ...journals });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetJournal(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		JOURNALS.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'file_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async journal => {
			if (!journal) {
				NotFoundError(res, { unique_id: anonymous, text: "Journal not found" }, null);
			} else {
				const journal_view_update = await JOURNALS.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Journal loaded" }, journal);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchJournals(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await JOURNALS.count({
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

		JOURNALS.findAndCountAll({
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
		}).then(journals => {
			if (!journals || journals.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Journals Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Journals loaded" }, { ...journals, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Journals loaded" }, { ...journals });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addJournal(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const journal_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const journal = await JOURNALS.create(
					{
						unique_id: journal_unique_id,
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

				if (journal) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Journal created successfully!" }, { unique_id: journal_unique_id });
				} else {
					throw new Error("Error adding journal");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateJournalDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const journal = await JOURNALS.update(
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

				if (journal > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Journal not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateJournalImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const journal_details = await JOURNALS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!journal_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Journal not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const journal = await JOURNALS.update(
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

					if (journal > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (journal_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: journal_details.image_public_id });
						}
					} else {
						throw new Error("Journal not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateJournalFile(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const journal_details = await JOURNALS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!journal_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Journal not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const journal = await JOURNALS.update(
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

					if (journal > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former file available
						if (journal_details.file_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: journal_details.file_public_id });
						}
					} else {
						throw new Error("Journal not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteJournal(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const journal_details = await JOURNALS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!journal_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Journal not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const journal = await JOURNALS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (journal > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Journal was deleted successfully!" });

						// Delete former image available
						if (journal_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: journal_details.image_public_id });
						}

						// Delete former file available
						if (journal_details.file_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: journal_details.file_public_id });
						}
					} else {
						throw new Error("Error deleting journal");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};