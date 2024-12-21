import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { categories_rules } from "../rules/categories.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addCategory, deleteCategory, getCategory, getCategories, getCategoriesSpecifically, publicGetCategory, publicGetCategories, publicSearchCategories, searchCategories, updateCategoryDetails, updateCategoryImage
} from "../controllers/categories.controller.js";

export default function (app) {
	app.get("/internal/category/all", [checks.verifyToken, checks.isAdministratorOrStaff], getCategories);
	app.get("/internal/search/categories", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchCategories);
	app.get("/internal/category/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingViaStripped], getCategory);
	app.get("/internal/category", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingCategoryInternal], getCategory);

	app.get("/categories", [centers_rules.forFindingCenterAlt], publicGetCategories);
	app.get("/search/categories", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchCategories);
	app.get("/category", [centers_rules.forFindingCenterAlt, categories_rules.forFindingCategory], publicGetCategory);
	app.get("/category/via/stripped", [centers_rules.forFindingCenterAlt, categories_rules.forFindingViaStripped], publicGetCategory);

	app.post("/internal/category/add", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forAdding], addCategory);

	app.put("/internal/category/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingCategory, categories_rules.forUpdatingDetails], updateCategoryDetails);
	app.put("/internal/category/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingCategory, categories_rules.forUpdatingImage], updateCategoryImage);

	app.delete("/internal/category", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingCategory], deleteCategory);
};
