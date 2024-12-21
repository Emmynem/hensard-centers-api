import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";
import usersModel from "./users.model.js";
import coursesModel from "./courses.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);
	const users = usersModel(sequelize, Sequelize);
	const courses = coursesModel(sequelize, Sequelize);

	const enrollments = sequelize.define("enrollment", {
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
		user_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: users,
				key: "unique_id"
			}
		},
		course_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: courses,
				key: "unique_id"
			}
		},
		reference: {
			type: Sequelize.STRING(20),
			allowNull: false,
			unique: true
		},
		enrollment_details: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		certificate: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		certificate_type: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		certificate_public_id: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		enrolled_date: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},
		completion_date: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},
		certification_date: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},
		enrollment_status: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}enrollments${db_end}`
	});
	return enrollments;
};
