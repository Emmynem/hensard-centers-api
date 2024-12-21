import { db_end, db_start } from "../config/config";
import categoriesModel from "./categories.model.js";
import centersModel from "./centers.model.js";

export default (sequelize, Sequelize) => {

	const categories = categoriesModel(sequelize, Sequelize);
	const centers = centersModel(sequelize, Sequelize);

	const posts = sequelize.define("post", {
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
		category_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: categories,
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
		likes: {
			type: Sequelize.BIGINT,
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}posts${db_end}`
	});
	return posts;
};
