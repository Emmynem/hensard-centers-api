import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import appDefaultsModel from "./appDefaults.model.js";
import apiKeysModel from "./apiKeys.model.js";
import categoriesModel from "./categories.model.js";
import centersModel from "./centers.model.js";
import courseCategoriesModel from "./courseCategories.model.js";
import coursesModel from "./courses.model.js";
import courseTypesModel from "./courseTypes.model.js";
import enrollmentsModel from "./enrollments.model.js";
import eventsModel from "./events.model.js";
import galleriesModel from "./galleries.model.js";
import journalsModel from "./journals.model.js";
import policiesModel from "./policies.model.js";
import postsModel from "./posts.model.js";
import presentationsModel from "./presentations.model.js";
import projectsModel from "./projects.model.js";
import publicGalleryModel from "./publicGallery.model.js";
import reportsModel from "./reports.model.js";
import researchModel from "./research.model.js";
import transactionsModel from "./transactions.model.js";
import usersModel from "./users.model.js";
import teamsModel from "./teams.model.js";
import videosModel from "./videos.model.js";

const sequelize = new Sequelize(
	DB,
	USER,
	PASSWORD,
	{
		host: HOST,
		dialect: _dialect,
		logging: _logging,
		operatorsAliases: 0,
		pool: {
			max: _pool.max,
			min: _pool.min,
			acquire: _pool.acquire,
			idle: _pool.idle,
			evict: _pool.evict
		},
		dialectOptions: {
			// useUTC: _dialectOptions.useUTC, 
			dateStrings: _dialectOptions.dateStrings,
			typeCast: _dialectOptions.typeCast
		},
		timezone: timezone
	}
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.api_keys = apiKeysModel(sequelize, Sequelize);
db.app_defaults = appDefaultsModel(sequelize, Sequelize);
db.centers = centersModel(sequelize, Sequelize);
db.users = usersModel(sequelize, Sequelize);
db.transactions = transactionsModel(sequelize, Sequelize);
db.categories = categoriesModel(sequelize, Sequelize);
db.course_categories = courseCategoriesModel(sequelize, Sequelize);
db.courses = coursesModel(sequelize, Sequelize);
db.course_types = courseTypesModel(sequelize, Sequelize);
db.enrollments = enrollmentsModel(sequelize, Sequelize);
db.events = eventsModel(sequelize, Sequelize);
db.galleries = galleriesModel(sequelize, Sequelize);
db.journals = journalsModel(sequelize, Sequelize);
db.policies = policiesModel(sequelize, Sequelize);
db.posts = postsModel(sequelize, Sequelize);
db.presentations = presentationsModel(sequelize, Sequelize);
db.projects = projectsModel(sequelize, Sequelize);
db.public_gallery = publicGalleryModel(sequelize, Sequelize);
db.reports = reportsModel(sequelize, Sequelize);
db.research = researchModel(sequelize, Sequelize);
db.teams = teamsModel(sequelize, Sequelize);
db.videos = videosModel(sequelize, Sequelize);

// End - Binding models

// Associations

//    - Categories
db.centers.hasMany(db.categories, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.categories.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Course Categories
db.centers.hasMany(db.course_categories, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.course_categories.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Course Types
db.centers.hasMany(db.course_types, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.course_types.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Courses
db.centers.hasMany(db.courses, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.courses.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

db.course_categories.hasMany(db.courses, { foreignKey: 'course_category_unique_id', sourceKey: 'unique_id' });
db.courses.belongsTo(db.course_categories, { foreignKey: 'course_category_unique_id', targetKey: 'unique_id' });

db.course_types.hasMany(db.courses, { foreignKey: 'course_type_unique_id', sourceKey: 'unique_id' });
db.courses.belongsTo(db.course_types, { foreignKey: 'course_type_unique_id', targetKey: 'unique_id' });

//    - Enrollments
db.centers.hasMany(db.enrollments, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.enrollments.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

db.users.hasMany(db.enrollments, { foreignKey: 'user_unique_id', sourceKey: 'unique_id' });
db.enrollments.belongsTo(db.users, { foreignKey: 'user_unique_id', targetKey: 'unique_id' });

db.courses.hasMany(db.enrollments, { foreignKey: 'course_unique_id', sourceKey: 'unique_id' });
db.enrollments.belongsTo(db.courses, { foreignKey: 'course_unique_id', targetKey: 'unique_id' });

//    - Events
db.centers.hasMany(db.events, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.events.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Galleries
db.centers.hasMany(db.galleries, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.galleries.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Journals
db.centers.hasMany(db.journals, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.journals.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Policies
db.centers.hasMany(db.policies, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.policies.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Posts
db.centers.hasMany(db.posts, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.posts.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

db.categories.hasMany(db.posts, { foreignKey: 'category_unique_id', sourceKey: 'unique_id' });
db.posts.belongsTo(db.categories, { foreignKey: 'category_unique_id', targetKey: 'unique_id' });

//    - Presentations
db.centers.hasMany(db.presentations, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.presentations.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Projects
db.centers.hasMany(db.projects, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.projects.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Public Gallery
db.centers.hasMany(db.public_gallery, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.public_gallery.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Reports
db.centers.hasMany(db.reports, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.reports.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Research
db.centers.hasMany(db.research, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.research.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Teams
db.centers.hasMany(db.teams, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.teams.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Transactions
db.centers.hasMany(db.transactions, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.transactions.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

db.users.hasMany(db.transactions, { foreignKey: 'user_unique_id', sourceKey: 'unique_id' });
db.transactions.belongsTo(db.users, { foreignKey: 'user_unique_id', targetKey: 'unique_id' });

db.courses.hasMany(db.transactions, { foreignKey: 'course_unique_id', sourceKey: 'unique_id' });
db.transactions.belongsTo(db.courses, { foreignKey: 'course_unique_id', targetKey: 'unique_id' });

//    - Users
db.centers.hasMany(db.users, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.users.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

//    - Videos
db.centers.hasMany(db.videos, { foreignKey: 'center_unique_id', sourceKey: 'unique_id' });
db.videos.belongsTo(db.centers, { foreignKey: 'center_unique_id', targetKey: 'unique_id' });

// End - Associations

export default db;
