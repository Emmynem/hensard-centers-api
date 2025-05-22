import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);

	const teams = sequelize.define("team", {
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
		fullname: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: true
		},
		alt_email: {
			type: Sequelize.STRING(255),
			allowNull: true
		},
		phone_number: {
			type: Sequelize.STRING(20),
			allowNull: true
		},
		alt_phone_number: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		qualifications: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		profile_link: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		details: {
			type: Sequelize.STRING(5000),
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
		tableName: `${db_start}teams${db_end}`
	});
	return teams;
};
