import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import { 
    default_status, check_length_TEXT, strip_text, return_default_value, validate_future_date, validate_future_end_date,
    default_delete_status, validate_payment_method, payment_methods, transaction_types, validate_past_date, validate_gateway, gateways
} from '../config/config.js';

const USERS = db.users;
const TRANSACTIONS = db.transactions;
const Op = db.Sequelize.Op;

export const transaction_rules = {
    forFindingTransaction: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return TRANSACTIONS.findOne({
                    where: {
                        unique_id,
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forFindingTransactionFalsy: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return TRANSACTIONS.findOne({
                    where: {
                        unique_id,
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forFindingTransactionAlt: [
        check('transaction_unique_id', "Transaction Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(transaction_unique_id => {
                return TRANSACTIONS.findOne({ where: { unique_id: transaction_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forAdding: [
        check('type', "Type is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('gateway', "Gateway is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(gateway => !!validate_gateway(gateway))
            .withMessage(`Invalid gateway, accepts - ${gateways.paystack}, ${gateways.squad} & ${gateways.internal}`),
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_payment_method(payment_method))
            .withMessage(`Invalid payment method, accepted methods (${payment_methods.card}, ${payment_methods.transfer} & ${payment_methods.wallet})`),
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('reference')
            .optional({ checkFalsy: false }),
        check('transaction_status', "Transaction Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('details', "Details is required")
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 500 })
            .withMessage("Invalid length (3 - 500) characters"),
    ],
    forUpdatingDetails: [
        check('details', "Details is required")
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 500 })
            .withMessage("Invalid length (3 - 500) characters")
    ],
    forUpdatingStatus: [
        check('transaction_status', "Transaction Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forDeposit: [
        check('gateway', "Gateway is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(gateway => !!validate_gateway(gateway))
            .withMessage(`Invalid gateway, accepts - ${gateways.paystack}, ${gateways.squad} & ${gateways.internal}`),
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount === 0) return false;
                else if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_payment_method(payment_method))
            .withMessage(`Invalid payment method, accepted methods (${payment_methods.card} & ${payment_methods.transfer})`),
        check('reference')
            .optional({ checkFalsy: false })
    ],
    forEnrollmentFee: [
        check('gateway', "Gateway is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(gateway => !!validate_gateway(gateway))
            .withMessage(`Invalid gateway, accepts - ${gateways.paystack}, ${gateways.squad} & ${gateways.internal}`),
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_payment_method(payment_method))
            .withMessage(`Invalid payment method, accepted methods (${payment_methods.card} & ${payment_methods.transfer})`),
    ],
    forWithdrawal: [
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount === 0) return false;
                else if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('otp', "OTP is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt().isLength({ min: 6, max: 6 })
            .withMessage("Invalid OTP"),
    ],
    forFindingViaType: [
        check('type', "Type is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forFindingViaGateway: [
        check('gateway', "Gateway is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(gateway => !!validate_gateway(gateway))
            .withMessage(`Invalid gateway, accepts - ${gateways.paystack}, ${gateways.squad} & ${gateways.internal}`),
    ],
    forFindingViaCurrency: [
        check('currency', "Currency is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 2, max: 5 })
            .withMessage("Invalid length (2 - 5) characters"),
    ],
    forFindingViaTransactionStatus: [
        check('transaction_status', "Transaction Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forFindingViaReference: [
        check('reference', "Reference is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
    ],
    forFiltering: [
        check('start_date', "Start Date is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(start_date => {
                const later = moment(start_date, "YYYY-MM-DD", true);
                return later.isValid();
            })
            .withMessage("Invalid start datetime format (YYYY-MM-DD)")
            .bail()
            .custom(start_date => !!validate_past_date(start_date))
            .withMessage("Invalid start datetime"),
        check('end_date', "End Date is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(end_date => {
                const later = moment(end_date, "YYYY-MM-DD", true);
                return later.isValid();
            })
            .withMessage("Invalid end datetime format (YYYY-MM-DD)")
            .bail()
            .custom((end_date, { req }) => !!validate_future_end_date(req.query.start_date || req.body.start_date || '', end_date))
            .withMessage("Invalid end datetime"),
    ],
};  