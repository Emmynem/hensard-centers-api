import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { course_types_rules } from "../rules/courseTypes.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addCourseType, deleteCourseType, getCourseType, getCourseTypes, getCourseTypesSpecifically, publicGetCourseType, publicGetCourseTypes, publicSearchCourseTypes, searchCourseTypes, updateCourseTypeDetails, updateCourseTypeImage
} from "../controllers/courseTypes.controller.js";

export default function (app) {
	app.get("/internal/course/type/all", [checks.verifyToken, checks.isAdministratorOrStaff], getCourseTypes);
	app.get("/internal/search/course/types", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchCourseTypes);
	app.get("/internal/course/type/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, course_types_rules.forFindingViaStripped], getCourseType);
	app.get("/internal/course/type", [checks.verifyToken, checks.isAdministratorOrStaff, course_types_rules.forFindingCourseTypeInternal], getCourseType);

	app.get("/course/types", [centers_rules.forFindingCenterAlt], publicGetCourseTypes);
	app.get("/search/course/types", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchCourseTypes);
	app.get("/course/type", [centers_rules.forFindingCenterAlt, course_types_rules.forFindingCourseType], publicGetCourseType);
	app.get("/course/type/via/stripped", [centers_rules.forFindingCenterAlt, course_types_rules.forFindingViaStripped], publicGetCourseType);

	app.post("/internal/course/type/add", [checks.verifyToken, checks.isAdministratorOrStaff, course_types_rules.forAdding], addCourseType);

	app.put("/internal/course/type/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, course_types_rules.forFindingCourseType, course_types_rules.forUpdatingDetails], updateCourseTypeDetails);

	app.delete("/internal/course/type", [checks.verifyToken, checks.isAdministratorOrStaff, course_types_rules.forFindingCourseType], deleteCourseType);
};
