import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from "../models/index.js";
import { logger } from '../common/index.js';
import { default_status, default_app_values, default_centers, random_uuid } from './config.js';

const APP_DEFAULTS = db.app_defaults;
const API_KEYS = db.api_keys;
const CENTERS = db.centers;

export async function createAppDefaults() {

    const count = await APP_DEFAULTS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const appDefaults = APP_DEFAULTS.bulkCreate(default_app_values, { transaction: t });
                return appDefaults;
            })
            logger.info('Added app defaults');
        } catch (error) {
            logger.error(error)
            logger.error('Error adding app defaults');
        }
    }

};

export async function createApiKeys() {

    const details = [
        {
            unique_id: uuidv4(),
            type: "Root",
            api_key: random_uuid(20),
            status: default_status
        },
        {
            unique_id: uuidv4(),
            type: "Internal",
            api_key: random_uuid(20),
            status: default_status
        }, 
        {
            unique_id: uuidv4(),
            type: "External",
            api_key: random_uuid(20),
            status: default_status
        }
    ];

    const count = await API_KEYS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const apikey = API_KEYS.bulkCreate(details, {transaction: t});
                return apikey;
            })
            logger.info('Added api keys');
        } catch (error) {
            logger.error('Error adding api keys');
        }
    }
};

export async function createCenters() {

    const count = await CENTERS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const centers = CENTERS.bulkCreate(default_centers, { transaction: t });
                return centers;
            })
            logger.info('Added centers');
        } catch (error) {
            logger.error(error)
            logger.error('Error adding centers');
        }
    }

};
