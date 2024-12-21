import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { courses_rules } from "../rules/courses.rules.js";
import { enrollments_rules } from "../rules/enrollments.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addEnrollment, deleteEnrollment, getEnrollment, getEnrollments, getEnrollmentsSpecifically, getUserEnrollment, getUserEnrollments, issueCertification, publicGetEnrollment, 
	publicGetEnrollments, publicSearchEnrollments, searchEnrollments, updateEnrollmentDetails, updateEnrollmentStatusCancelled, updateEnrollmentStatusCompleted, 
	filterEnrollmentsByCertificationDate, filterEnrollmentsByCompletionDate, filterEnrollmentsByEnrolledDate
} from "../controllers/enrollments.controller.js";

export default function (app) {
	app.get("/internal/enrollment/all", [checks.verifyToken, checks.isAdministratorOrStaff], getEnrollments);
	app.get("/internal/enrollments/via/reference", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingViaReference], getEnrollmentsSpecifically);
	app.get("/internal/enrollments/via/enrollment/status", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingViaEnrollmentStatus], getEnrollmentsSpecifically);
	app.get("/internal/enrollments/via/course", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourseAlt], getEnrollmentsSpecifically);
	app.get("/internal/filter/enrollments/via/enrolled/date", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFiltering], filterEnrollmentsByEnrolledDate);
	app.get("/internal/filter/enrollments/via/completion/date", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFiltering], filterEnrollmentsByCompletionDate);
	app.get("/internal/filter/enrollments/via/certification/date", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFiltering], filterEnrollmentsByCertificationDate);
	app.get("/internal/search/enrollments", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchEnrollments);
	app.get("/internal/enrollment", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingEnrollmentInternal], getEnrollment);

	app.get("/profile/enrollments", [checks.verifyToken, checks.isUser], getUserEnrollments);
	app.get("/profile/enrollment", [checks.verifyToken, checks.isUser, enrollments_rules.forFindingEnrollment], getUserEnrollment);
	
	// app.get("/enrollments", [centers_rules.forFindingCenterAlt], publicGetEnrollments);
	// app.get("/search/enrollments", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchEnrollments);
	// app.get("/enrollment", [centers_rules.forFindingCenterAlt, enrollments_rules.forFindingEnrollment], publicGetEnrollment);

	app.post("/internal/enrollment/add", [checks.verifyToken, checks.isAdministratorOrStaff, user_rules.forFindingUserAlt, courses_rules.forFindingCourseAlt], addEnrollment);

	app.put("/profile/enrollment/complete", [checks.verifyToken, checks.isUser, enrollments_rules.forFindingEnrollment], updateEnrollmentStatusCompleted);
	app.put("/profile/enrollment/cancel", [checks.verifyToken, checks.isUser, enrollments_rules.forFindingEnrollment], updateEnrollmentStatusCancelled);
	
	app.put("/internal/enrollment/complete", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingEnrollment], updateEnrollmentStatusCompleted);
	app.put("/internal/enrollment/cancel", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingEnrollment], updateEnrollmentStatusCancelled);
	app.put("/internal/enrollment/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingEnrollment], updateEnrollmentDetails);
	app.put("/internal/enrollment/issue/certification", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingEnrollment, enrollments_rules.forIssuingCertificate], issueCertification);
	
	app.delete("/internal/enrollment", [checks.verifyToken, checks.isAdministratorOrStaff, enrollments_rules.forFindingEnrollment], deleteEnrollment);
};
