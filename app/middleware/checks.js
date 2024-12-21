import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import db from "../models/index.js";
import { 
    access_granted, access_suspended, default_delete_status, hsdc_header_key, hsdc_header_token, tag_root, tag_internal_api_key,
    user_types,
} from "../config/config.js";

dotenv.config();

const { secret } = process.env;

const { verify } = jwt;

const USERS = db.users;
const API_KEYS = db.api_keys;
const Op = db.Sequelize.Op;

const verifyKey = (req, res, next) => {
    const key = req.headers[hsdc_header_key] || req.query.key || req.body.key || '';
    if (!key) {
        ForbiddenError(res, "No key provided!", null);
    } else {
        req.API_KEY = key;
        next();
    }
};

const isRootKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_root,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_root} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const isInternalKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_internal_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_internal_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const verifyToken = (req, res, next) => {
    let token = req.headers[hsdc_header_token] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.user_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.USER_UNIQUE_ID = decoded.user_unique_id;
                    req.CENTER_UNIQUE_ID = decoded.center_unique_id;
                    next();
                }
            }
        });
    }
};

const isUser = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.USER_UNIQUE_ID,
            type: user_types.student,
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            // req.body.user_unique_id = user.unique_id;
            req.body.center_unique_id = user.center_unique_id;
            next();
        }
    });
};

const isStaff = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.USER_UNIQUE_ID,
            type: user_types.staff,
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require Staff!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            // req.body.user_unique_id = user.unique_id;
            req.body.center_unique_id = user.center_unique_id;
            next();
        }
    });
};

const isAdministrator = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.USER_UNIQUE_ID,
            type: user_types.administrator,
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require Administrator!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            // req.body.user_unique_id = user.unique_id;
            req.body.center_unique_id = user.center_unique_id;
            next();
        }
    });
};

const isAdministratorOrStaff = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.USER_UNIQUE_ID,
            [Op.or]: [
                {
                    type: user_types.staff
                },
                {
                    type: user_types.administrator
                }
            ],
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require Administrator or Staff!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            // req.body.user_unique_id = user.unique_id;
            req.body.center_unique_id = user.center_unique_id;
            next();
        }
    });
};

export default {
    verifyKey, verifyToken, isUser, isRootKey, isInternalKey, isStaff, isAdministrator, isAdministratorOrStaff
};