import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const PUBLIC_GALLERY = db.public_gallery;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const public_gallery_rules = {
	forFindingPublicGalleryInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PUBLIC_GALLERY.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Public Gallery not found!');
				});
			})
	],
	forFindingPublicGallery: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PUBLIC_GALLERY.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Public Gallery not found!');
				});
			})
	],
	forFindingPublicGalleryFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PUBLIC_GALLERY.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Public Gallery not found!');
				});
			})
	],
	forFindingPublicGalleryAlt: [
		check('public_gallery_unique_id', "Public Gallery Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(public_gallery_unique_id => {
				return PUBLIC_GALLERY.findOne({ where: { unique_id: public_gallery_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Public Gallery not found!');
				});
			})
	],
	forFindingPublicGalleryAltOptional: [
		check('public_gallery_unique_id', "Public Gallery Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(public_gallery_unique_id => {
				return PUBLIC_GALLERY.findOne({ where: { unique_id: public_gallery_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Public Gallery not found!');
				});
			})
	],
	forAdding: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters"),
		check('details')
			.optional({ checkFalsy: false })
			.bail()
			.isLength({ min: 3, max: 3000 })
			.withMessage(`Invalid length (3 - ${3000}) characters`),
		check('image')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		check('image_public_id')
			.optional({ checkFalsy: false }),
	],
	forUpdatingDetails: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters"),
		check('details')
			.optional({ checkFalsy: false })
			.bail()
			.isLength({ min: 3, max: 3000 })
			.withMessage(`Invalid length (3 - ${3000}) characters`),
	],
	forUpdatingImage: [
		check('image')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		check('image_public_id')
			.optional({ checkFalsy: false }),
	],
	forUpdatingTimestamp: [
		check('createdAt', "Created At is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(createdAt => {
				const later = moment(createdAt, "YYYY-MM-DD HH:mm", true);
				return later.isValid();
			})
			.withMessage("Invalid createdAt datetime format (YYYY-MM-DD HH:mm)"),
		check('updatedAt', "Updated At is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(updatedAt => {
				const later = moment(updatedAt, "YYYY-MM-DD HH:mm", true);
				return later.isValid();
			})
			.withMessage("Invalid updatedAt datetime format (YYYY-MM-DD HH:mm)"),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((stripped, { req }) => {
				return PUBLIC_GALLERY.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Public Gallery not found!');
				});
			}),
	]
};  