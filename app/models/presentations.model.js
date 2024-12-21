import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);

	const presentations = sequelize.define("presentation", {
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
		other: {
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
		file: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		file_type: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		file_public_id: {
			type: Sequelize.STRING(500),
			allowNull: true,
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
		tableName: `${db_start}presentations${db_end}`
	});
	return presentations;
};
