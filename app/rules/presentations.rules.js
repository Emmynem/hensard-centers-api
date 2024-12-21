import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const PRESENTATIONS = db.presentations;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const presentations_rules = {
	forFindingPresentationInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PRESENTATIONS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Presentation not found!');
				});
			})
	],
	forFindingPresentation: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PRESENTATIONS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Presentation not found!');
				});
			})
	],
	forFindingPresentationFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PRESENTATIONS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Presentation not found!');
				});
			})
	],
	forFindingPresentationAlt: [
		check('presentation_unique_id', "Presentation Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(presentation_unique_id => {
				return PRESENTATIONS.findOne({ where: { unique_id: presentation_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Presentation not found!');
				});
			})
	],
	forFindingPresentationAltOptional: [
		check('presentation_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(presentation_unique_id => {
				return PRESENTATIONS.findOne({ where: { unique_id: presentation_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Presentation not found!');
				});
			})
	],
	forAdding: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((title, { req }) => {
				return PRESENTATIONS.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						[Op.or]: [
							{
								title: {
									[Op.like]: `%${title}`
								}
							},
							{
								stripped: strip_text(title),
							}
						],
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Presentation already exists!');
				});
			}),
		check('other')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('file')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to a file"),
		check('file_type')
			.optional({ checkFalsy: false }),
		check('file_public_id')
			.optional({ checkFalsy: false }),
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
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((title, { req }) => {
				return PRESENTATIONS.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
						[Op.or]: [
							{
								title: {
									[Op.like]: `%${title}`
								}
							},
							{
								stripped: strip_text(title),
							}
						],
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || '',
						},
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Presentation already exists!');
				});
			}),
		check('other')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
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
	forUpdatingFile: [
		check('file')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to a file"),
		check('file_type')
			.optional({ checkFalsy: false }),
		check('file_public_id')
			.optional({ checkFalsy: false }),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((stripped, { req }) => {
				return PRESENTATIONS.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Presentation not found!');
				});
			}),
	]
};  