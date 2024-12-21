import { checks } from "../middleware/index.js";
import { centers_rules } from "../rules/centers.rules.js";
import { events_rules } from "../rules/events.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addEvent, deleteEvent, getEvent, getEvents, getEventsSpecifically, publicGetEvent, publicGetEvents, publicSearchEvents, searchEvents, updateEventImage, updateEventDescription, 
	updateEventDuration, updateEventName, updateEventOtherDetails, updateEventTimestamp
} from "../controllers/events.controller.js";

export default function (app) {
	app.get("/internal/event/all", [checks.verifyToken, checks.isAdministratorOrStaff], getEvents);
	app.get("/internal/search/events", [checks.verifyToken, checks.isAdministratorOrStaff, default_rules.forSearching], searchEvents);
	app.get("/internal/event/via/stripped", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingViaStripped], getEvent);
	app.get("/internal/event", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEventInternal], getEvent);

	app.get("/events", [centers_rules.forFindingCenterAlt], publicGetEvents);
	app.get("/search/events", [centers_rules.forFindingCenterAlt, default_rules.forSearching], publicSearchEvents);
	app.get("/event", [centers_rules.forFindingCenterAlt, events_rules.forFindingEvent], publicGetEvent);
	app.get("/event/via/stripped", [centers_rules.forFindingCenterAlt, events_rules.forFindingViaStripped], publicGetEvent);

	app.post("/internal/event/add", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forAdding], addEvent);

	app.put("/internal/event/edit/name", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent, events_rules.forUpdatingName], updateEventName);
	app.put("/internal/event/edit/description", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent, events_rules.forUpdatingDescription], updateEventDescription);
	app.put("/internal/event/edit/duration", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent, events_rules.forUpdatingDuration], updateEventDuration);
	app.put("/internal/event/edit/others", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent, events_rules.forUpdatingOthers], updateEventOtherDetails);
	app.put("/internal/event/edit/timestamp", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent, events_rules.forUpdatingTimestamp], updateEventTimestamp);
	app.put("/internal/event/edit/image", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent, events_rules.forUpdatingImage], updateEventImage);

	app.delete("/internal/event", [checks.verifyToken, checks.isAdministratorOrStaff, events_rules.forFindingEvent], deleteEvent);
};
