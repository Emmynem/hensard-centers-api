import { currency, db_end, db_start } from "../config/config.js";
import centersModel from "./centers.model.js";
import courseCategoriesModel from "./courseCategories.model.js";
import courseTypesModel from "./courseTypes.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);
	const course_categories = courseCategoriesModel(sequelize, Sequelize);
	const course_types = courseTypesModel(sequelize, Sequelize);

	const courses = sequelize.define("course", {
		id: {
			type: Sequelize.BIGINT,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			unique: true
		},
		center_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: centers,
				key: "unique_id"
			}
		},
		course_category_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: course_categories,
				key: "unique_id"
			}
		},
		course_type_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: course_types,
				key: "unique_id"
			}
		},
		reference: {
			type: Sequelize.STRING(20),
			allowNull: false,
			unique: true
		},
		title: {
			type: Sequelize.STRING(200),
			allowNull: false,
		},
		stripped: {
			type: Sequelize.STRING(200),
			allowNull: false,
		},
		description: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		enrollment_details: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		currency: {
			type: Sequelize.STRING(10),
			allowNull: true,
		},
		amount: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		certificate: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		certificate_template: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		image: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		image_public_id: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		views: {
			type: Sequelize.BIGINT,
			allowNull: false,
		},
		active_enrollment: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}courses${db_end}`
	});
	return courses;
};
