import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);

	const galleries = sequelize.define("gallery", {
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
		image: {
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		image_size: {
			type: Sequelize.BIGINT,
			allowNull: false,
		},
		image_size_converted: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		image_type: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		image_public_id: {
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}galleries${db_end}`
	});
	return galleries;
};
