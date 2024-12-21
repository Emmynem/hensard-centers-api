import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const VIDEOS = db.videos;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const videos_rules = {
	forFindingVideoInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return VIDEOS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Video not found!');
				});
			})
	],
	forFindingVideo: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return VIDEOS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Video not found!');
				});
			})
	],
	forFindingVideoFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return VIDEOS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Video not found!');
				});
			})
	],
	forFindingVideoAlt: [
		check('video_unique_id', "Video Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(video_unique_id => {
				return VIDEOS.findOne({ where: { unique_id: video_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Video not found!');
				});
			})
	],
	forFindingVideoAltOptional: [
		check('video_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(video_unique_id => {
				return VIDEOS.findOne({ where: { unique_id: video_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Video not found!');
				});
			})
	],
	forAddingAndUpdating: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('watchCode', "Watch Code is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 6, max: 11 })
			.withMessage("Invalid length (6 - 11) characters"),
	],
};  