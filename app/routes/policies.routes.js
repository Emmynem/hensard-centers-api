import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { policies_rules } from "../rules/policies.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addPolicy, deletePolicy, getPolicy, getPolicies, getPoliciesSpecifically, publicGetPolicy, publicGetPolicies, publicSearchPolicies, searchPolicies, updatePolicyDetails,
	updatePolicyImage, updatePolicyFile
} from "../controllers/policies.controller.js";

export default function (app) {
	app.get("/internal/policy/all", [checks.verifyToken, checks.isAdministratorOrStaff], getPolicies);
	app.get("/internal/search/policies", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchPolicies);
	app.get("/internal/policy/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forFindingViaStripped], getPolicy);
	app.get("/internal/policy", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forFindingPolicyInternal], getPolicy);

	app.get("/policies", [centers_rules.forFindingCenterAlt], publicGetPolicies);
	app.get("/search/policies", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchPolicies);
	app.get("/policy", [centers_rules.forFindingCenterAlt, policies_rules.forFindingPolicy], publicGetPolicy);
	app.get("/policy/via/stripped", [centers_rules.forFindingCenterAlt, policies_rules.forFindingViaStripped], publicGetPolicy);

	app.post("/internal/policy/add", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forAdding], addPolicy);

	app.put("/internal/policy/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forFindingPolicy, policies_rules.forUpdatingDetails], updatePolicyDetails);
	app.put("/internal/policy/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forFindingPolicy, policies_rules.forUpdatingImage], updatePolicyImage);
	app.put("/internal/policy/edit/file", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forFindingPolicy, policies_rules.forUpdatingFile], updatePolicyFile);

	app.delete("/internal/policy", [checks.verifyToken, checks.isAdministratorOrStaff, policies_rules.forFindingPolicy], deletePolicy);
};
