import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addCenter, deleteCenter, getCenter, getCenters, getCentersSpecifically, publicGetCenter, publicGetCenters, publicSearchCenters, searchCenters, updateCenterDetails, updateCenterImage	
} from "../controllers/centers.controller.js";

export default function (app) {
	app.get("/internal/center/all", [checks.verifyToken, checks.isAdministratorOrStaff], getCenters);
	app.get("/internal/search/centers", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchCenters);
	app.get("/internal/center/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, centers_rules.forFindingViaStripped], getCenter);
	app.get("/internal/center", [checks.verifyToken, checks.isAdministratorOrStaff, centers_rules.forFindingCenterInternal], getCenter);

	app.get("/centers", publicGetCenters);
	app.get("/search/centers", [default_rules.forSearching], publicSearchCenters);
	app.get("/center", [centers_rules.forFindingCenter], publicGetCenter);
	app.get("/center/via/stripped", [centers_rules.forFindingViaStripped], publicGetCenter);

	app.post("/internal/center/add", [checks.verifyToken, checks.isAdministrator, centers_rules.forAdding], addCenter);

	app.put("/internal/center/edit/details", [checks.verifyToken, checks.isAdministrator, centers_rules.forFindingCenter, centers_rules.forUpdatingDetails], updateCenterDetails);
	app.put("/internal/center/edit/image", [checks.verifyToken, checks.isAdministrator, centers_rules.forFindingCenter, centers_rules.forUpdatingImage], updateCenterImage);

	app.delete("/internal/center", [checks.verifyToken, checks.isAdministrator, centers_rules.forFindingCenter], deleteCenter);
};
