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

const POSTS = db.posts;
const CATEGORIES = db.categories;
const Op = db.Sequelize.Op;

export async function getPosts(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({ where: { center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'details', 'image_public_id'] },
			where: {
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Posts Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Posts loaded" }, { ...posts });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export function getPost(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		POSTS.findOne({
			attributes: { exclude: ['id', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
		}).then(post => {
			if (!post) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Post not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Post loaded" }, post);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function searchPosts(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({
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

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'details', 'image_public_id'] },
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
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
			order: [
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Posts Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Posts loaded" }, { ...posts });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function getPostsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({ where: { ...payload, center_unique_id: center_unique_id || payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'details', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: center_unique_id || payload.center_unique_id
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Posts Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
				// SuccessResponse(res, { unique_id: user_unique_id, text: "Posts loaded" }, { ...posts });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetPosts(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({ where: { center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'details', 'image_public_id'] },
			where: {
				center_unique_id: payload.center_unique_id
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicGetPostsSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({ where: { ...payload, center_unique_id: payload.center_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'details', 'image_public_id'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
			order: [
				[orderBy, sortBy]
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export function publicGetPost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		POSTS.findOne({
			attributes: { exclude: ['id', 'image_public_id', 'status'] },
			where: {
				...payload,
				center_unique_id: payload.center_unique_id
			},
			include: [
				{
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
		}).then(async post => {
			if (!post) {
				NotFoundError(res, { unique_id: anonymous, text: "Post not found" }, null);
			} else {
				const post_view_update = await POSTS.increment({ views: 1 }, { where: { ...payload } });
				SuccessResponse(res, { unique_id: anonymous, text: "Post loaded" }, post);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicLikePost(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const post_view_update = await POSTS.increment({ likes: 1 }, { where: { ...payload } });

		if (post_view_update.length > 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Post liked" }, null);
		} else {
			BadRequestError(res, { unique_id: anonymous, text: "Error liking post" }, null);
		}
	}
};

export async function publicSearchPosts(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await POSTS.count({
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

		POSTS.findAndCountAll({
			attributes: { exclude: ['id', 'details', 'image_public_id'] },
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
					model: CATEGORIES,
					attributes: ['unique_id', 'name', 'stripped', 'image']
				},
			], 
			order: [
				['createdAt', 'DESC']
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(posts => {
			if (!posts || posts.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Posts Not found" }, []);
			} else {
				// SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts, pages: pagination.pages });
				SuccessResponse(res, { unique_id: anonymous, text: "Posts loaded" }, { ...posts });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addPost(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const post_unique_id = uuidv4();

			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.create(
					{
						unique_id: post_unique_id,
						center_unique_id: center_unique_id || payload.center_unique_id,
						category_unique_id: payload.category_unique_id,
						title: payload.title,
						stripped: strip_text(payload.title),
						alt_text: payload.alt_text,
						details: payload.details,
						image: payload.image ? payload.image : null,
						image_public_id: payload.image_public_id ? payload.image_public_id : null,
						views: zero,
						likes: zero,
						status: default_status
					}, { transaction }
				);

				if (post) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Post created successfully!" }, { unique_id: post_unique_id });
				} else {
					throw new Error("Error adding post");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePostTitle(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
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

				if (post > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePostDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						details: payload.details,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePostAltText(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						alt_text: payload.alt_text,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePostCategory(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						category_unique_id: payload.category_unique_id,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePostTimestamp(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const post = await POSTS.update(
					{
						createdAt: payload.createdAt,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (post > 0) {
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Post not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updatePostImage(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const post_details = await POSTS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!post_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Post not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const post = await POSTS.update(
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

					if (post > 0) {
						SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);

						// Delete former image available
						if (post_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: post_details.image_public_id });
						}
					} else {
						throw new Error("Post not found");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deletePost(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const center_unique_id = req.CENTER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const post_details = await POSTS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!post_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Post not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const post = await POSTS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (post > 0) {
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Post was deleted successfully!" });

						// Delete former image available
						if (post_details.image_public_id !== null) {
							await deleteImage(clouder_key, { cloudinary_name: cloudy_name, cloudinary_key: cloudy_key, cloudinary_secret: cloudy_secret, public_id: post_details.image_public_id });
						}
					} else {
						throw new Error("Error deleting post");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};