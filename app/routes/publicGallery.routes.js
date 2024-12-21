import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { public_gallery_rules } from "../rules/publicGallery.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addPublicGallery, deletePublicGallery, getAllPublicGallery, getPublicGallery, getPublicGallerySpecifically, publicGetAllPublicGallery, publicGetPublicGallery, publicSearchPublicGallery, searchPublicGallery, 
	updatePublicGalleryDetails, updatePublicGalleryImage
} from "../controllers/publicGallery.controller.js";

export default function (app) {
	app.get("/internal/public/gallery/all", [checks.verifyToken, checks.isAdministratorOrStaff], getAllPublicGallery);
	app.get("/internal/search/public/gallery", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchPublicGallery);
	app.get("/internal/public/gallery/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, public_gallery_rules.forFindingViaStripped], getPublicGallery);
	app.get("/internal/public/gallery", [checks.verifyToken, checks.isAdministratorOrStaff, public_gallery_rules.forFindingPublicGalleryInternal], getPublicGallery);

	app.get("/public/gallery/all", [centers_rules.forFindingCenterAlt], publicGetAllPublicGallery);
	app.get("/search/public/gallery", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchPublicGallery);
	app.get("/public/gallery", [centers_rules.forFindingCenterAlt, public_gallery_rules.forFindingPublicGallery], publicGetPublicGallery);
	app.get("/public/gallery/via/stripped", [centers_rules.forFindingCenterAlt, public_gallery_rules.forFindingViaStripped], publicGetPublicGallery);

	app.post("/internal/public/gallery/add", [checks.verifyToken, checks.isAdministratorOrStaff, public_gallery_rules.forAdding], addPublicGallery);

	app.put("/internal/public/gallery/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, public_gallery_rules.forFindingPublicGallery, public_gallery_rules.forUpdatingDetails], updatePublicGalleryDetails);
	app.put("/internal/public/gallery/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, public_gallery_rules.forFindingPublicGallery, public_gallery_rules.forUpdatingImage], updatePublicGalleryImage);

	app.delete("/internal/public/gallery", [checks.verifyToken, checks.isAdministratorOrStaff, public_gallery_rules.forFindingPublicGallery], deletePublicGallery);
};
