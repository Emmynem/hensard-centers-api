import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const EVENTS = db.events;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const events_rules = {
	forFindingEventInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return EVENTS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Event not found!');
				});
			})
	],
	forFindingEvent: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return EVENTS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Event not found!');
				});
			})
	],
	forFindingEventFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return EVENTS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Event not found!');
				});
			})
	],
	forFindingEventAlt: [
		check('event_unique_id', "Event Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(event_unique_id => {
				return EVENTS.findOne({ where: { unique_id: event_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Event not found!');
				});
			})
	],
	forFindingEventAltOptional: [
		check('event_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(event_unique_id => {
				return EVENTS.findOne({ where: { unique_id: event_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Event not found!');
				});
			})
	],
	forAdding: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters")
			.bail()
			.custom((name, { req }) => {
				return EVENTS.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
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
					if (data) return Promise.reject('Event already exists!');
				});
			}),
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: 20 })
			.withMessage(`Invalid length (3 - ${20}) characters`),
		check('location', "Location is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: 300 })
			.withMessage(`Invalid length (3 - ${300}) characters`),
		check('start', "Start Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(start => {
				const later = moment(start, "YYYY-MM-DD HH:mm", true);
				return later.isValid();
			})
			.withMessage("Invalid start datetime format (YYYY-MM-DD HH:mm)"),
			// .bail()
			// .custom(start => !!validate_future_date(start))
			// .withMessage("Invalid start datetime"),
		check('end')
			.optional({ checkFalsy: false })
			.bail()
			.custom(end => {
				const later = moment(end, "YYYY-MM-DD HH:mm", true);
				return later.isValid();
			})
			.withMessage("Invalid end datetime format (YYYY-MM-DD HH:mm)"),
			// .bail()
			// .custom((end, { req }) => !!validate_future_end_date(req.query.start || req.body.start || '', end))
			// .withMessage("Invalid end datetime"),
		check('description')
			.optional({ checkFalsy: false })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
		check('image')
			.optional({ checkFalsy: false })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url path to an image"),
		check('image_public_id')
			.optional({ checkFalsy: false }),
	],
	forUpdatingName: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters")
			.bail()
			.custom((name, { req }) => {
				return EVENTS.findOne({
					where: {
						center_unique_id: req.query.center_unique_id || req.body.center_unique_id || '',
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
					if (data) return Promise.reject('Event already exists!');
				});
			}),
	],
	forUpdatingOthers: [
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: 20 })
			.withMessage(`Invalid length (3 - ${20}) characters`),
		check('location', "Location is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: 300 })
			.withMessage(`Invalid length (3 - ${300}) characters`),
	],
	forUpdatingDuration: [
		check('start', "Start Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(start => {
				const later = moment(start, "YYYY-MM-DD HH:mm", true);
				return later.isValid();
			})
			.withMessage("Invalid start datetime format (YYYY-MM-DD HH:mm)"),
			// .bail()
			// .custom(start => !!validate_future_date(start))
			// .withMessage("Invalid start datetime"),
		check('end')
			.optional({ checkFalsy: false })
			.bail()
			.custom(end => {
				const later = moment(end, "YYYY-MM-DD HH:mm", true);
				return later.isValid();
			})
			.withMessage("Invalid end datetime format (YYYY-MM-DD HH:mm)"),
			// .bail()
			// .custom((end, { req }) => !!validate_future_end_date(req.query.start || req.body.start || '', end))
			// .withMessage("Invalid end datetime"),
	],
	forUpdatingDescription: [
		check('description')
			.optional({ checkFalsy: false })
			.bail()
			.isLength({ min: 3, max: check_length_TEXT })
			.withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
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
		// check('updatedAt', "Updated At is required")
		// 	.exists({ checkNull: true, checkFalsy: true })
		// 	.bail()
		// 	.custom(updatedAt => {
		// 		const later = moment(updatedAt, "YYYY-MM-DD HH:mm", true);
		// 		return later.isValid();
		// 	})
		// 	.withMessage("Invalid updatedAt datetime format (YYYY-MM-DD HH:mm)"),
	],
	forFindingViaStripped: [
		check('stripped', "Stripped is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters")
			.bail()
			.custom((stripped, { req }) => {
				return EVENTS.findOne({
					where: {
						stripped: stripped,
						// status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Event not found!');
				});
			}),
	]
};  