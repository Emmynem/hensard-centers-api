import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { course_categories_rules } from "../rules/courseCategories.rules.js";
import { course_types_rules } from "../rules/courseTypes.rules.js";
import { courses_rules } from "../rules/courses.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addCourse, deleteCourse, getCourse, getCourses, getCoursesSpecifically, publicGetCourse, publicGetCourses, publicSearchCourses, searchCourses, 
	toggleCourseActiveEnrollment, updateCourseCertificateTemplate, updateCourseDetails, updateCourseEnrollmentDetails, updateCourseImage, updateCourseOtherDetails, 
	publicGetCoursesSpecifically
} from "../controllers/courses.controller.js";

export default function (app) {
	app.get("/internal/course/all", [checks.verifyToken, checks.isAdministratorOrStaff], getCourses);
	app.get("/internal/courses/via/all", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingCourseCategoryAltOptional, course_types_rules.forFindingCourseTypeAltOptional], getCoursesSpecifically);
	app.get("/internal/search/courses", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchCourses);
	app.get("/internal/course/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingViaStripped], getCourse);
	app.get("/internal/course", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourseInternal], getCourse);
	
	app.get("/courses", [centers_rules.forFindingCenterAlt], publicGetCourses);
	app.get("/courses/via/all", [centers_rules.forFindingCenterAlt, course_categories_rules.forFindingCourseCategoryAltOptional, course_types_rules.forFindingCourseTypeAltOptional], publicGetCoursesSpecifically);
	app.get("/search/courses", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchCourses);
	app.get("/course", [centers_rules.forFindingCenterAlt, courses_rules.forFindingCourse], publicGetCourse);
	app.get("/course/via/stripped", [centers_rules.forFindingCenterAlt, courses_rules.forFindingViaStripped], publicGetCourse);

	app.post("/internal/course/add", [checks.verifyToken, checks.isAdministratorOrStaff, course_categories_rules.forFindingCourseCategoryAlt, course_types_rules.forFindingCourseTypeAlt, courses_rules.forAdding], addCourse);

	app.put("/internal/course/edit/details", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse, courses_rules.forUpdatingDetails], updateCourseDetails);
	app.put("/internal/course/edit/enrollment/details", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse, courses_rules.forUpdatingEnrollmentDetails], updateCourseEnrollmentDetails);
	app.put("/internal/course/edit/certificate_template", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse, courses_rules.forUpdatingCertificateTemplate], updateCourseCertificateTemplate);
	app.put("/internal/course/edit/other/details", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse, course_categories_rules.forFindingCourseCategoryAlt, course_types_rules.forFindingCourseTypeAlt], updateCourseOtherDetails);
	app.put("/internal/course/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse, courses_rules.forUpdatingImage], updateCourseImage);
	app.put("/internal/toggle/course/active/enrollment", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse], toggleCourseActiveEnrollment);

	app.delete("/internal/course", [checks.verifyToken, checks.isAdministratorOrStaff, courses_rules.forFindingCourse], deleteCourse);
};
