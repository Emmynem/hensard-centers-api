import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const CENTERS = db.centers;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const centers_rules = {
	forFindingCenterInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return CENTERS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Center not found!');
				});
			})
	],
	forFindingCenter: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return CENTERS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Center not found!');
				});
			})
	],
	forFindingCenterFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return CENTERS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Center not found!');
				});
			})
	],
	forFindingCenterAlt: [
		check('center_unique_id', "Center Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(center_unique_id => {
				return CENTERS.findOne({ where: { unique_id: center_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Center not found!');
				});
			})
	],
	forFindingCenterAltOptional: [
		check('center_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(center_unique_id => {
				return CENTERS.findOne({ where: { unique_id: center_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Center not found!');
				});
			})
	],
	forAdding: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((name, { req }) => {
				return CENTERS.findOne({
					where: {
						[Op.or]: [
							{
								name: {
									[Op.like]: `%${name}`
								}
							},
							{
								stripped: strip_text(name),
							}
						],
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Center already exists!');
				});
			}),
		check('acronym', "Acronym is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters")
			.bail()
			.custom((acronym, { req }) => {
				return CENTERS.findOne({
					where: {
						[Op.or]: [
							{
								acronym: {
									[Op.like]: `%${acronym}`
								}
							},
						],
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Center with acronym already exists!');
				});
			}),
		check('url')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url"),
		check('image')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		check('image_public_id')
			.optional({ checkFalsy: false }),
	],
	forUpdatingDetails: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((name, { req }) => {
				return CENTERS.findOne({
					where: {
						[Op.or]: [
							{
								name: {
									[Op.like]: `%${name}`
								}
							},
							{
								stripped: strip_text(name),
							}
						],
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || '',
						},
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Center already exists!');
				});
			}),
		check('acronym', "Acronym is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters")
			.bail()
			.custom((acronym, { req }) => {
				return CENTERS.findOne({
					where: {
						[Op.or]: [
							{
								acronym: {
									[Op.like]: `%${acronym}`
								}
							},
						],
						unique_id: {
							[Op.ne]: req.query.unique_id || req.body.unique_id || '',
						},
						status: default_status
					}
				}).then(data => {
					if (data) return Promise.reject('Center with acronym already exists!');
				});
			}),
		check('url')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url"),
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
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((stripped, { req }) => {
				return CENTERS.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Center not found!');
				});
			}),
	]
};  