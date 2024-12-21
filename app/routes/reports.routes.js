import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { reports_rules } from "../rules/reports.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addReport, deleteReport, getReport, getReports, getReportsSpecifically, publicGetReport, publicGetReports, publicSearchReports, searchReports, updateReportDetails,
	updateReportImage, updateReportFile
} from "../controllers/reports.controller.js";

export default function (app) {
	app.get("/internal/report/all", [checks.verifyToken, checks.isAdministratorOrStaff], getReports);
	app.get("/internal/search/reports", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchReports);
	app.get("/internal/report/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forFindingViaStripped], getReport);
	app.get("/internal/report", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forFindingReportInternal], getReport);

	app.get("/reports", [centers_rules.forFindingCenterAlt], publicGetReports);
	app.get("/search/reports", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchReports);
	app.get("/report", [centers_rules.forFindingCenterAlt, reports_rules.forFindingReport], publicGetReport);
	app.get("/report/via/stripped", [centers_rules.forFindingCenterAlt, reports_rules.forFindingViaStripped], publicGetReport);

	app.post("/internal/report/add", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forAdding], addReport);

	app.put("/internal/report/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forFindingReport, reports_rules.forUpdatingDetails], updateReportDetails);
	app.put("/internal/report/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forFindingReport, reports_rules.forUpdatingImage], updateReportImage);
	app.put("/internal/report/edit/file", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forFindingReport, reports_rules.forUpdatingFile], updateReportFile);

	app.delete("/internal/report", [checks.verifyToken, checks.isAdministratorOrStaff, reports_rules.forFindingReport], deleteReport);
};
