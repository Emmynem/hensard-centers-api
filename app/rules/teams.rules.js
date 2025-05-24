import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value,
	validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const TEAMS = db.teams;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const teams_rules = {
	forFindingTeamInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return TEAMS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Team not found!');
				});
			})
	],
	forFindingTeam: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return TEAMS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Team not found!');
				});
			})
	],
	forFindingTeamFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return TEAMS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Team not found!');
				});
			})
	],
	forFindingTeamAlt: [
		check('team_unique_id', "Team Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(team_unique_id => {
				return TEAMS.findOne({ where: { unique_id: team_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Team not found!');
				});
			})
	],
	forFindingTeamAltOptional: [
		check('team_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(team_unique_id => {
				return TEAMS.findOne({ where: { unique_id: team_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Team not found!');
				});
			})
	],
	forAdding: [
		check('title', "Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
		check('fullname', "Fullname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('email')
			.optional({ checkFalsy: false })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('alt_email')
			.optional({ checkFalsy: false })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('qualifications')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('profile_link')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('details')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 3000 })
			.withMessage("Invalid length (3 - 3000) characters"),
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
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('fullname', "Fullname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('alt_email')
			.optional({ checkFalsy: false })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('phone_number', "Phone Number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('alt_phone_number')
			.optional({ checkFalsy: false })
			.bail()
			.isMobilePhone()
			.withMessage("Invalid phone number"),
		check('qualifications')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('profile_link')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('details')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 3, max: 3000 })
			.withMessage("Invalid length (3 - 3000) characters"),
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
};  