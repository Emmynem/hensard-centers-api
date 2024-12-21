import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	getUser, getUserProfile, getUsers, searchUsers, updateUserAccessGranted, updateUserAccessRevoked, updateUserAccessSuspended, updateUserAddressDetails, 
	updateUserDetails, updateUserEmail, updateUserNames, updateUserProfileImage, userChangePassword
} from "../controllers/users.controller.js";

export default function (app) {
	app.get("/internal/users", [checks.verifyToken, checks.isAdministratorOrStaff], getUsers);
	app.get("/internal/search/users", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchUsers);
	app.get("/internal/user/via/email", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forEmail], getUser);
	app.get("/internal/user", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUser], getUser);

	app.get("/profile", [checks.verifyToken, checks.isUser], getUserProfile);
	app.get("/staff/profile", [checks.verifyToken, checks.isAdministratorOrStaff], getUserProfile);

	app.post("/password/change", [checks.verifyToken, checks.isUser, user_rules.forChangingPassword], userChangePassword);
	app.post("/profile/image", [checks.verifyToken, checks.isUser, user_rules.forProfileImageUpload], updateUserProfileImage);

	app.post("/staff/password/change", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forChangingPassword], userChangePassword);
	app.post("/staff/profile/image", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forProfileImageUpload], updateUserProfileImage);

	app.put("/profile/names", [checks.verifyToken, checks.isUser, user_rules.forUpdatingNames], updateUserNames);
	app.put("/profile/details", [checks.verifyToken, checks.isUser, user_rules.forUpdatingDetails], updateUserDetails);
	app.put("/profile/address/details", [checks.verifyToken, checks.isUser, user_rules.forUpdatingAddressDetails], updateUserAddressDetails);

	app.put("/staff/profile/names", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forUpdatingNames], updateUserNames);
	app.put("/staff/profile/details", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forUpdatingDetails], updateUserDetails);
	app.put("/staff/profile/address/details", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forUpdatingAddressDetails], updateUserAddressDetails);
	
	app.put("/internal/user/email", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUser, user_rules.forEmail], updateUserEmail);

	app.put("/internal/user/access/grant", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUser], updateUserAccessGranted);
	app.put("/internal/user/access/suspend", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUser], updateUserAccessSuspended);
	app.put("/internal/user/access/revoke", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUser], updateUserAccessRevoked);
};
