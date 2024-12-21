import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);

	const courseTypes = sequelize.define("course_type", {
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
		title: {
			type: Sequelize.STRING(200),
			allowNull: false,
		},
		stripped: {
			type: Sequelize.STRING(200),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}course_type${db_end}`
	});
	return courseTypes;
};
