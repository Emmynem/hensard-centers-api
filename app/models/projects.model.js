import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);

	const projects = sequelize.define("project", {
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
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		stripped: {
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		alt_text: {
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		type: {
			type: Sequelize.STRING(500),
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
		details: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		views: {
			type: Sequelize.BIGINT,
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}projects${db_end}`
	});
	return projects;
};