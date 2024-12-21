import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { course_categories_rules } from "../rules/courseCategories.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addCourseCategory, deleteCourseCategory, getCourseCategory, getCourseCategories, getCourseCategoriesSpecifically, publicGetCourseCategory, publicGetCourseCategories, publicSearchCourseCategories, searchCourseCategories, updateCourseCategoryDetails, updateCourseCategoryImage
} from "../controllers/courseCategories.controller.js";

export default function (app) {
	app.get("/internal/course/category/all", [checks.verifyToken, checks.isAdministratorOrStaff], getCourseCategories);
	app.get("/internal/search/course/categories", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchCourseCategories);
	app.get("/internal/course/category/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingViaStripped], getCourseCategory);
	app.get("/internal/course/category", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingCourseCategoryInternal], getCourseCategory);

	app.get("/course/categories", [centers_rules.forFindingCenterAlt], publicGetCourseCategories);
	app.get("/search/course/categories", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchCourseCategories);
	app.get("/course/category", [centers_rules.forFindingCenterAlt, course_categories_rules.forFindingCourseCategory], publicGetCourseCategory);
	app.get("/course/category/via/stripped", [centers_rules.forFindingCenterAlt, course_categories_rules.forFindingViaStripped], publicGetCourseCategory);

	app.post("/internal/course/category/add", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forAdding], addCourseCategory);

	app.put("/internal/course/category/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingCourseCategory, course_categories_rules.forUpdatingDetails], updateCourseCategoryDetails);
	app.put("/internal/course/category/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingCourseCategory, course_categories_rules.forUpdatingImage], updateCourseCategoryImage);

	app.delete("/internal/course/category", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingCourseCategory], deleteCourseCategory);
};
