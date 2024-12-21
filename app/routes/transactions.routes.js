import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { courses_rules } from "../rules/courses.rules.js";
import { transaction_rules } from "../rules/transactions.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addDeposit, addDepositExternally, addEnrollmentFee, addTransaction, addTransactionInternally, addWithdrawal, addWithdrawalExternally, cancelDeposit, cancelDepositExternally, 
	cancelEnrollmentFee, cancelWithdrawal, cancelWithdrawalExternally, completeDeposit, completeEnrollmentFee, completeWithdrawal, deleteEnrollmentFee, filterTransactions, 
	getPaystackPublicKey, getPaystackSecretKey, getSquadPublicKey, getSquadSecretKey, getTransaction, getTransactions, getTransactionsSpecifically, internalCompleteDeposit, 
	internalCompleteWithdrawal, searchTransactions, userFilterTransactions, userGetTransaction, userGetTransactions, userGetTransactionsSpecifically, userSearchTransactions 
} from "../controllers/transactions.controller.js";

export default function (app) {
	app.get("/internal/transactions", [checks.verifyToken, checks.isAdministratorOrStaff], getTransactions);
	app.get("/internal/transactions/via/user", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUserAlt], getTransactionsSpecifically);
	app.get("/internal/transactions/via/type", [checks.verifyToken, checks.isAdministratorOrStaff, transaction_rules.forFindingViaType], getTransactionsSpecifically);
	app.get("/internal/transactions/via/gateway", [checks.verifyToken, checks.isAdministratorOrStaff, transaction_rules.forFindingViaGateway], getTransactionsSpecifically);
	app.get("/internal/transactions/via/transaction/status", [checks.verifyToken, checks.isAdministratorOrStaff, transaction_rules.forFindingViaTransactionStatus], getTransactionsSpecifically);
	app.get("/internal/transactions/via/currency", [checks.verifyToken, checks.isAdministratorOrStaff, transaction_rules.forFindingViaCurrency], getTransactionsSpecifically);
	app.get("/internal/filter/transactions", [checks.verifyToken, checks.isAdministratorOrStaff, transaction_rules.forFiltering], filterTransactions);
	app.get("/internal/search/transactions", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchTransactions);
	app.get("/internal/transaction", [checks.verifyToken, checks.isAdministratorOrStaff, transaction_rules.forFindingTransaction], getTransaction);

	app.get("/secret/key/paystack", [checks.verifyKey, checks.isInternalKey], getPaystackSecretKey);
	app.get("/public/key/paystack", [checks.verifyKey, checks.isInternalKey], getPaystackPublicKey);
	app.get("/secret/key/squad", [checks.verifyKey, checks.isInternalKey], getSquadSecretKey);
	app.get("/public/key/squad", [checks.verifyKey, checks.isInternalKey], getSquadPublicKey);

	app.get("/transactions", [checks.verifyToken, checks.isUser], userGetTransactions);
	app.get("/filter/transactions", [checks.verifyToken, checks.isUser, transaction_rules.forFiltering], userFilterTransactions);
	app.get("/search/transactions", [checks.verifyToken, checks.isUser, default_rules.forSearching], userSearchTransactions);
	app.get("/transaction", [checks.verifyToken, checks.isUser, transaction_rules.forFindingTransaction], userGetTransaction);

	// app.post("/transaction", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forAdding], addTransaction); // Will use later, maybe
	app.post("/transaction/payment/deposit", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forDeposit], addDeposit);
	app.post("/transaction/payment/deposit/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forDeposit], addDepositExternally);
	app.post("/transaction/payment/withdrawal", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forWithdrawal], addWithdrawal); // For when logged in
	app.post("/transaction/payment/withdrawal/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forWithdrawal], addWithdrawalExternally); // For when not logged in, external use only

	app.post("/transaction/payment/enrollment/fee", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, courses_rules.forFindingCourseAlt, transaction_rules.forEnrollmentFee], addEnrollmentFee); // For when logged in

	app.post("/transaction/cancel/deposit", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forFindingTransaction], cancelDeposit);
	app.post("/transaction/cancel/deposit/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forFindingTransaction], cancelDepositExternally);
	app.post("/transaction/cancel/withdrawal", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forFindingTransaction], cancelWithdrawal);
	app.post("/transaction/cancel/withdrawal/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forFindingTransaction], cancelWithdrawalExternally);
	app.post("/transaction/cancel/enrollment/fee", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forFindingTransaction], cancelEnrollmentFee);

	app.post("/transaction/complete/deposit", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forFindingTransaction], completeDeposit);
	app.post("/transaction/complete/deposit/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forFindingTransaction], completeDeposit);
	app.post("/internal/transaction/complete/deposit", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUserAlt, transaction_rules.forFindingTransaction], internalCompleteDeposit);

	app.post("/transaction/complete/withdrawal", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forFindingTransaction], completeWithdrawal);
	app.post("/transaction/complete/withdrawal/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forFindingTransaction], completeWithdrawal);
	app.post("/internal/transaction/complete/withdrawal", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUserAlt, transaction_rules.forFindingTransaction], internalCompleteWithdrawal);

	app.post("/transaction/complete/enrollment/fee", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, transaction_rules.forFindingViaReference], completeEnrollmentFee);
	app.post("/transaction/complete/enrollment/fee/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, transaction_rules.forFindingViaReference], completeEnrollmentFee);
	app.post("/internal/transaction/complete/enrollment/fee", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUserAlt, transaction_rules.forFindingViaReference], completeEnrollmentFee);
	
};
