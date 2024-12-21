import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { journals_rules } from "../rules/journals.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addJournal, deleteJournal, getJournal, getJournals, getJournalsSpecifically, publicGetJournal, publicGetJournals, publicSearchJournals, searchJournals, updateJournalDetails, 
	updateJournalImage, updateJournalFile
} from "../controllers/journals.controller.js";

export default function (app) {
	app.get("/internal/journal/all", [checks.verifyToken, checks.isAdministratorOrStaff], getJournals);
	app.get("/internal/search/journals", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchJournals);
	app.get("/internal/journal/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forFindingViaStripped], getJournal);
	app.get("/internal/journal", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forFindingJournalInternal], getJournal);

	app.get("/journals", [centers_rules.forFindingCenterAlt], publicGetJournals);
	app.get("/search/journals", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchJournals);
	app.get("/journal", [centers_rules.forFindingCenterAlt, journals_rules.forFindingJournal], publicGetJournal);
	app.get("/journal/via/stripped", [centers_rules.forFindingCenterAlt, journals_rules.forFindingViaStripped], publicGetJournal);

	app.post("/internal/journal/add", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forAdding], addJournal);

	app.put("/internal/journal/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forFindingJournal, journals_rules.forUpdatingDetails], updateJournalDetails);
	app.put("/internal/journal/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forFindingJournal, journals_rules.forUpdatingImage], updateJournalImage);
	app.put("/internal/journal/edit/file", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forFindingJournal, journals_rules.forUpdatingFile], updateJournalFile);

	app.delete("/internal/journal", [checks.verifyToken, checks.isAdministratorOrStaff, journals_rules.forFindingJournal], deleteJournal);
};
