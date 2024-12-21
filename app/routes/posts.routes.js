import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { categories_rules } from "../rules/categories.rules.js";
import { posts_rules } from "../rules/posts.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addPost, deletePost, getPost, getPosts, getPostsSpecifically, publicGetPost, publicGetPosts, publicSearchPosts, searchPosts, updatePostImage, publicLikePost, 
	updatePostAltText, updatePostCategory, updatePostDetails, updatePostTimestamp, updatePostTitle, publicGetPostsSpecifically
} from "../controllers/posts.controller.js";

export default function (app) {
	app.get("/internal/post/all", [checks.verifyToken, checks.isAdministratorOrStaff], getPosts);
	app.get("/internal/posts/via/category", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingCategoryAlt], getPostsSpecifically);
	app.get("/internal/search/posts", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchPosts);
	app.get("/internal/post/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingViaStripped], getPost);
	app.get("/internal/post", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPostInternal], getPost);

	app.get("/posts", [centers_rules.forFindingCenterAlt], publicGetPosts);
	app.get("/posts/via/category", [centers_rules.forFindingCenterAlt, categories_rules.forFindingCategoryAlt], publicGetPostsSpecifically);
	app.get("/search/posts", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchPosts);
	app.get("/post", [centers_rules.forFindingCenterAlt, posts_rules.forFindingPost], publicGetPost);
	app.get("/post/via/stripped", [centers_rules.forFindingCenterAlt, posts_rules.forFindingViaStripped], publicGetPost);

	app.post("/like/post", [centers_rules.forFindingCenterAlt, posts_rules.forFindingPost], publicLikePost);
	app.post("/like/post/via/stripped", [centers_rules.forFindingCenterAlt, posts_rules.forFindingViaStripped], publicLikePost);
	
	app.post("/internal/post/add", [checks.verifyToken, checks.isAdministratorOrStaff, categories_rules.forFindingCategoryAlt, posts_rules.forAdding], addPost);

	app.put("/internal/post/edit/category", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost, categories_rules.forFindingCategoryAlt], updatePostCategory);
	app.put("/internal/post/edit/title", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost, posts_rules.forUpdatingTitle], updatePostTitle);
	app.put("/internal/post/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost, posts_rules.forUpdatingDetails], updatePostDetails);
	app.put("/internal/post/edit/alt/text", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost, posts_rules.forUpdatingAltText], updatePostAltText);
	app.put("/internal/post/edit/timestamp", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost, posts_rules.forUpdatingTimestamp], updatePostTimestamp);
	app.put("/internal/post/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost, posts_rules.forUpdatingImage], updatePostImage);

	app.delete("/internal/post", [checks.verifyToken, checks.isAdministratorOrStaff, posts_rules.forFindingPost], deletePost);
};
