import { db_end, db_start } from "../config/config";

export default (sequelize, Sequelize) => {

	const centers = sequelize.define("center", {
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
		name: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		stripped: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		acronym: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		url: {
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
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}centers${db_end}`
	});
	return centers;
};
