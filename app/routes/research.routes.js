import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { research_rules } from "../rules/research.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addResearch, deleteResearch, getAllResearch, getResearch, getResearchSpecifically, publicGetResearch, publicSearchResearch, searchResearch, updateResearchDetails,
	updateResearchImage, updateResearchFile, publicGetAllResearch
} from "../controllers/research.controller.js";

export default function (app) {
	app.get("/internal/research/all", [checks.verifyToken, checks.isAdministratorOrStaff], getAllResearch);
	app.get("/internal/search/research", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchResearch);
	app.get("/internal/research/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forFindingViaStripped], getResearch);
	app.get("/internal/research", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forFindingResearchInternal], getResearch);

	app.get("/research/all", [centers_rules.forFindingCenterAlt], publicGetAllResearch);
	app.get("/search/research", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchResearch);
	app.get("/research", [centers_rules.forFindingCenterAlt, research_rules.forFindingResearch], publicGetResearch);
	app.get("/research/via/stripped", [centers_rules.forFindingCenterAlt, research_rules.forFindingViaStripped], publicGetResearch);

	app.post("/internal/research/add", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forAdding], addResearch);

	app.put("/internal/research/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forFindingResearch, research_rules.forUpdatingDetails], updateResearchDetails);
	app.put("/internal/research/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forFindingResearch, research_rules.forUpdatingImage], updateResearchImage);
	app.put("/internal/research/edit/file", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forFindingResearch, research_rules.forUpdatingFile], updateResearchFile);

	app.delete("/internal/research", [checks.verifyToken, checks.isAdministratorOrStaff, research_rules.forFindingResearch], deleteResearch);
};
