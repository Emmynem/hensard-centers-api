import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { centers_rules } from "../rules/centers.rules.js";
import {
	staffPasswordRecovery, staffResendVerificationEmail, staffSignIn, staffSignInViaEmail, staffSignInViaOther, staffSignUp, staffSignUpViaOther, userPasswordRecovery, 
	userResendVerificationEmail, userSignIn, userSignInViaEmail, userSignInViaOther, userSignUp, userSignUpViaOther, verifyEmail
} from "../controllers/auth.controller.js";
import { userChangePassword } from "../controllers/users.controller.js";

export default function (app) {
	// User Auth Routes 
	app.post("/auth/user/signin/email", [centers_rules.forFindingCenterAlt, user_rules.forEmailLogin], userSignInViaEmail);
	app.post("/auth/user/signin", [centers_rules.forFindingCenterAlt, user_rules.forGeneralLogin], userSignIn);
	app.post("/auth/user/signin/via/other", [centers_rules.forFindingCenterAlt, user_rules.forEmailLoginAlt], userSignInViaOther);
	app.post("/auth/user/signup", [centers_rules.forFindingCenterAlt, user_rules.forAddingStudent], userSignUp);
	app.post("/auth/user/signup/via/other", [centers_rules.forFindingCenterAlt, user_rules.forAddingStudentViaOther], userSignUpViaOther);

	// Staff Auth Routes
	app.post("/auth/staff/signin/email", [centers_rules.forFindingCenterAlt, user_rules.forEmailLogin], staffSignInViaEmail);
	app.post("/auth/staff/signin", [centers_rules.forFindingCenterAlt, user_rules.forGeneralLogin], staffSignIn);
	app.post("/auth/staff/signin/via/other", [centers_rules.forFindingCenterAlt, user_rules.forEmailLoginAlt], staffSignInViaOther);
	app.post("/auth/staff/signup", [centers_rules.forFindingCenterAlt, user_rules.forAddingStaff], staffSignUp);
	app.post("/auth/staff/signup/via/other", [centers_rules.forFindingCenterAlt, user_rules.forAddingStaffViaOther], staffSignUpViaOther);
	
	// User password change routes
	app.post("/user/password/change", [checks.verifyToken, checks.isUser, user_rules.forChangingPassword], userChangePassword);	

	// Staff password change routes
	app.post("/staff/password/change", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forChangingPassword], userChangePassword);
	
	// User recovery routes
	app.post("/user/password/recover", [centers_rules.forFindingCenterAlt, user_rules.forGeneralPasswordReset], userPasswordRecovery);
	
	// Staff recovery routes
	app.post("/staff/password/recover", [centers_rules.forFindingCenterAlt, user_rules.forGeneralPasswordReset], staffPasswordRecovery);
	
	// User resend verification email
	app.post("/user/resend/email/verification", [centers_rules.forFindingCenterAlt, user_rules.forGeneralPasswordReset], userResendVerificationEmail);

	// Staff resend verification email
	app.post("/staff/resend/email/verification", [centers_rules.forFindingCenterAlt, user_rules.forGeneralPasswordReset], staffResendVerificationEmail);

	// User & Staff verify email routes
	app.post("/user/email/verify", [centers_rules.forFindingCenterAlt, user_rules.forFindingUserEmailForVerification], verifyEmail);
};