import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { galleries_rules } from "../rules/galleries.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	deleteGalleryImage, getGalleries, getGallery, publicGetGalleries, publicGetGallery, uploadGalleryImages
} from "../controllers/galleries.controller.js";

export default function (app) {
	app.get("/internal/gallery/all", [checks.verifyToken, checks.isAdministratorOrStaff], getGalleries);
	app.get("/internal/gallery", [checks.verifyToken, checks.isAdministratorOrStaff, galleries_rules.forFindingGalleryInternal], getGallery);

	app.get("/galleries", [centers_rules.forFindingCenterAlt], publicGetGalleries);
	app.get("/gallery", [centers_rules.forFindingCenterAlt, galleries_rules.forFindingGalleryInternal], publicGetGallery);

	app.post("/internal/gallery/add/images", [checks.verifyToken, checks.isAdministratorOrStaff, galleries_rules.forAddingGalleryImages], uploadGalleryImages);

	app.delete("/internal/gallery", [checks.verifyToken, checks.isAdministratorOrStaff, galleries_rules.forFindingGallery], deleteGalleryImage);
};
