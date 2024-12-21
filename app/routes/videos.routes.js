import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { videos_rules } from "../rules/videos.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addVideo, deleteVideo, getVideo, getVideos, publicGetVideo, publicGetVideos, updateVideoDetails
} from "../controllers/videos.controller.js";

export default function (app) {
	app.get("/internal/video/all", [checks.verifyToken, checks.isAdministratorOrStaff], getVideos);
	app.get("/internal/video", [checks.verifyToken, checks.isAdministratorOrStaff, videos_rules.forFindingVideoInternal], getVideo);

	app.get("/videos", [centers_rules.forFindingCenterAlt], publicGetVideos);
	app.get("/video", [centers_rules.forFindingCenterAlt, videos_rules.forFindingVideo], publicGetVideo);

	app.post("/internal/video/add", [checks.verifyToken, checks.isAdministratorOrStaff, videos_rules.forAddingAndUpdating], addVideo);

	app.put("/internal/video/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, videos_rules.forFindingVideo, videos_rules.forAddingAndUpdating], updateVideoDetails);
	
	app.delete("/internal/video", [checks.verifyToken, checks.isAdministratorOrStaff, videos_rules.forFindingVideo], deleteVideo);
};
