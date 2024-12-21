import { db_end, db_start } from "../config/config";
import centersModel from "./centers.model.js";
import usersModel from "./users.model.js";
import coursesModel from "./courses.model.js";

export default (sequelize, Sequelize) => {

	const centers = centersModel(sequelize, Sequelize);
	const users = usersModel(sequelize, Sequelize);
	const courses = coursesModel(sequelize, Sequelize);

	const transactions = sequelize.define("transaction", {
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
			allowNull: true,
			references: {
				model: users,
				key: "unique_id"
			}
		},
		course_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: true,
			references: {
				model: courses,
				key: "unique_id"
			}
		},
		type: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		gateway: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		payment_method: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		currency: {
			type: Sequelize.STRING(5),
			allowNull: false,
		},
		amount: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		reference: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		other: {
			type: Sequelize.STRING(1000),
			allowNull: true,
			get() {
				const _other = this.getDataValue('other');
				return (_other === null || _other === undefined ? null : JSON.parse(_other));
			},
			set(value) {
				const _other = JSON.stringify(value);
				this.setDataValue('other', value === null ? null : _other);
			}
		},
		transaction_status: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		details: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}transactions${db_end}`
	});
	return transactions;
};