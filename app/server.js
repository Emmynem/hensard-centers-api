import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import fileMiddleware from 'express-multipart-file-parser';
import { SuccessResponse } from './common/index.js';
import logger from "./common/logger.js";
import { hsdc_header_key, hsdc_header_token, primary_domain } from './config/config.js';
import morganMiddleware from "./middleware/morgan.js";
import db from "./models/index.js";
import { createApiKeys, createAppDefaults, createCenters } from './config/default.config.js';
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import centersRoutes from "./routes/centers.routes.js";
import courseCategoriesRoutes from "./routes/courseCategories.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import courseTypesRoutes from "./routes/courseTypes.routes.js";
import enrollmentsRoutes from "./routes/enrollments.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import galleriesRoutes from "./routes/galleries.routes.js";
import journalsRoutes from "./routes/journals.routes.js";
import policiesRoutes from "./routes/policies.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import presentationsRoutes from "./routes/presentations.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import publicGalleryRoutes from "./routes/publicGallery.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import researchRoutes from "./routes/research.routes.js";
import teamsRoutes from "./routes/teams.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import videosRoutes from "./routes/videos.routes.js";

const app = express();

const appWhitelist = [
	primary_domain, 
	"https://hcecr.hensarduniversity.edu.ng",
	"http://localhost", 
	"http://localhost:80", 
	"http://localhost:3000", 
	"http://localhost:5173", 
	"http://localhost:5174", 
	"http://localhost:5175", 
	"http://localhost:5176", 
	"https://hensard-university-hcecr-centre.vercel.app"
];
//options for cors midddleware
const options = cors.CorsOptions = {
	allowedHeaders: [
		'Access-Control-Allow-Headers',
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		hsdc_header_key,
		hsdc_header_token
	],
	methods: 'GET,PUT,POST,DELETE',
	credentials: true,
	origin: function (origin, callback) {
		if (appWhitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	},
};

app.use(json());
app.use(urlencoded({ extended: true, limit: '100mb' }));
app.use(fileMiddleware);
app.use(helmet());
app.use(morganMiddleware);

// add cors
app.use(cors(options));

// simple route
app.get("/", (request, response) => {
	SuccessResponse(response, "Hensard Centers API activated!");
})

// Sequelize initialization
db.sequelize.sync({ alter: false }).then(() => {
	logger.info("DB Connected 🚀");
	// creating defaults
	createApiKeys();
	createAppDefaults();
	createCenters();
});

// app.use(express.static(path.join(__dirname, '../public')));

// Binding routes
authRoutes(app);
usersRoutes(app);
categoriesRoutes(app);
centersRoutes(app);
courseCategoriesRoutes(app);
coursesRoutes(app);
courseTypesRoutes(app);
enrollmentsRoutes(app);
eventsRoutes(app);
galleriesRoutes(app);
journalsRoutes(app);
policiesRoutes(app);
postsRoutes(app);
presentationsRoutes(app);
projectsRoutes(app);
publicGalleryRoutes(app);
reportsRoutes(app);
researchRoutes(app);
teamsRoutes(app);
transactionsRoutes(app);
videosRoutes(app);

// change timezone for app
process.env.TZ = "UTC";

process.on('SIGINT', function () {
	db.sequelize.close(function (err) {
		process.exit(err ? 1 : 0);
	});
});

export default app;
