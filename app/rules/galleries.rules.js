import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, strip_text, return_default_value, validate_future_date, validate_future_end_date,
	default_delete_status, return_all_letters_uppercase
} from '../config/config.js';

const GALLERIES = db.galleries;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const galleries_rules = {
	forFindingGalleryInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return GALLERIES.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Gallery not found!');
				});
			})
	],
	forFindingGallery: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return GALLERIES.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Gallery not found!');
				});
			})
	],
	forFindingGalleryFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return GALLERIES.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Gallery not found!');
				});
			})
	],
	forFindingGalleryAlt: [
		check('gallery_unique_id', "Gallery Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(gallery_unique_id => {
				return GALLERIES.findOne({ where: { unique_id: gallery_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Gallery not found!');
				});
			})
	],
	forAddingGalleryImages: [
		check('galleries', "Galleries are required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isArray({ min: 1 })
			.withMessage("Must be an array from the data response from Clouder (not empty)"), 
	]
};  