import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import youtubeThumbnail from 'youtube-thumbnail';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, 
} from '../config/config.js';
import db from "../models/index.js";

const VIDEOS = db.videos;
const Op = db.Sequelize.Op;

export async function getVideos(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VIDEOS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		VIDEOS.findAndCountAll({
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
		}).then(videos => {
			if (!videos || videos.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Videos Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Videos loaded" }, { ...videos, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Videos loaded" }, { ...videos });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getVideo(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		VIDEOS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
		}).then(video => {
			if (!video) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Video not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Video loaded" }, video);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetVideos(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VIDEOS.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		VIDEOS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(videos => {
			if (!videos || videos.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Videos Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Videos loaded" }, { ...videos, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Videos loaded" }, { ...videos });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetVideo(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		VIDEOS.findOne({
			attributes: { exclude: ['id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
		}).then(async video => {
			if (!video) {
				NotFoundError(res, { unique_id: anonymous, text: "Video not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Video loaded" }, video);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addVideo(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const video_unique_id = uuidv4();
			var url = `https://www.youtube.com/watch?v=${payload.watchCode}`;
			var data = youtubeThumbnail(url);
			var thumbnail = data.high.url;

			await db.sequelize.transaction(async (transaction) => {
				const video = await VIDEOS.create(
					{
						unique_id: video_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						title: payload.title,
						youtube_url: url,
						thumbnail: thumbnail,
						status: default_status
					}, { transaction }
				);

				if (video) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Video created successfully!" }, { unique_id: video_unique_id });
				} else {
					throw new Error("Error adding video");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateVideoDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			var url = `https://www.youtube.com/watch?v=${payload.watchCode}`;
			var data = youtubeThumbnail(url);
			var thumbnail = data.high.url;

			await db.sequelize.transaction(async (transaction) => {
				const video = await VIDEOS.update(
					{
						title: payload.title,
						youtube_url: url,
						thumbnail: thumbnail,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (video > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Video not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteVideo(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const video = await VIDEOS.destroy(
					{
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (video > 0) {
					OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Video was deleted successfully!" });
				} else {
					throw new Error("Error deleting video");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};