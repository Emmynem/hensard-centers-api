import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { teams_rules } from "../rules/teams.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addTeam, deleteTeam, getTeam, getTeams, getTeamsSpecifically, publicGetTeam, publicGetTeams, publicSearchTeams, searchTeams, updateTeamDetails, updateTeamImage
} from "../controllers/teams.controller.js";

export default function (app) {
	app.get("/internal/team/all", [checks.verifyToken, checks.isAdministratorOrStaff], getTeams);
	app.get("/internal/search/teams", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchTeams);
	app.get("/internal/team", [checks.verifyToken, checks.isAdministratorOrStaff, teams_rules.forFindingTeamInternal], getTeam);

	app.get("/teams", [centers_rules.forFindingCenterAlt], publicGetTeams);
	app.get("/search/teams", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchTeams);
	app.get("/team", [centers_rules.forFindingCenterAlt, teams_rules.forFindingTeam], publicGetTeam);

	app.post("/internal/team/add", [checks.verifyToken, checks.isAdministratorOrStaff, teams_rules.forAdding], addTeam);

	app.put("/internal/team/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, teams_rules.forFindingTeam, teams_rules.forUpdatingDetails], updateTeamDetails);
	app.put("/internal/team/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, teams_rules.forFindingTeam, teams_rules.forUpdatingImage], updateTeamImage);

	app.delete("/internal/team", [checks.verifyToken, checks.isAdministratorOrStaff, teams_rules.forFindingTeam], deleteTeam);
};
