import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { projects_rules } from "../rules/projects.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addProject, deleteProject, getProject, getProjects, getProjectsSpecifically, publicGetProject, publicGetProjects, publicSearchProjects, searchProjects, updateProjectImage,
	updateProjectAltText, updateProjectType, updateProjectDetails, updateProjectTimestamp, updateProjectTitle,
} from "../controllers/projects.controller.js";

export default function (app) {
	app.get("/internal/project/all", [checks.verifyToken, checks.isAdministratorOrStaff], getProjects);
	app.get("/internal/search/projects", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchProjects);
	app.get("/internal/project/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingViaStripped], getProject);
	app.get("/internal/project", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProjectInternal], getProject);

	app.get("/projects", [centers_rules.forFindingCenterAlt], publicGetProjects);
	app.get("/search/projects", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchProjects);
	app.get("/project", [centers_rules.forFindingCenterAlt, projects_rules.forFindingProject], publicGetProject);
	app.get("/project/via/stripped", [centers_rules.forFindingCenterAlt, projects_rules.forFindingViaStripped], publicGetProject);

	app.post("/internal/project/add", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forAdding], addProject);

	app.put("/internal/project/edit/title", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject, projects_rules.forUpdatingTitle], updateProjectTitle);
	app.put("/internal/project/edit/type", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject, projects_rules.forUpdatingType], updateProjectType);
	app.put("/internal/project/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject, projects_rules.forUpdatingDetails], updateProjectDetails);
	app.put("/internal/project/edit/alt/text", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject, projects_rules.forUpdatingAltText], updateProjectAltText);
	app.put("/internal/project/edit/timestamp", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject, projects_rules.forUpdatingTimestamp], updateProjectTimestamp);
	app.put("/internal/project/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject, projects_rules.forUpdatingImage], updateProjectImage);

	app.delete("/internal/project", [checks.verifyToken, checks.isAdministratorOrStaff, projects_rules.forFindingProject], deleteProject);
};
