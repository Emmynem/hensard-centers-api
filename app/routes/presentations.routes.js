import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { presentations_rules } from "../rules/presentations.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addPresentation, deletePresentation, getPresentation, getPresentations, getPresentationsSpecifically, publicGetPresentation, publicGetPresentations, publicSearchPresentations, searchPresentations, updatePresentationDetails,
	updatePresentationImage, updatePresentationFile
} from "../controllers/presentations.controller.js";

export default function (app) {
	app.get("/internal/presentation/all", [checks.verifyToken, checks.isAdministratorOrStaff], getPresentations);
	app.get("/internal/search/presentations", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchPresentations);
	app.get("/internal/presentation/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forFindingViaStripped], getPresentation);
	app.get("/internal/presentation", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forFindingPresentationInternal], getPresentation);

	app.get("/presentations", [centers_rules.forFindingCenterAlt], publicGetPresentations);
	app.get("/search/presentations", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchPresentations);
	app.get("/presentation", [centers_rules.forFindingCenterAlt, presentations_rules.forFindingPresentation], publicGetPresentation);
	app.get("/presentation/via/stripped", [centers_rules.forFindingCenterAlt, presentations_rules.forFindingViaStripped], publicGetPresentation);

	app.post("/internal/presentation/add", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forAdding], addPresentation);

	app.put("/internal/presentation/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forFindingPresentation, presentations_rules.forUpdatingDetails], updatePresentationDetails);
	app.put("/internal/presentation/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forFindingPresentation, presentations_rules.forUpdatingImage], updatePresentationImage);
	app.put("/internal/presentation/edit/file", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forFindingPresentation, presentations_rules.forUpdatingFile], updatePresentationFile);

	app.delete("/internal/presentation", [checks.verifyToken, checks.isAdministratorOrStaff, presentations_rules.forFindingPresentation], deletePresentation);
};
