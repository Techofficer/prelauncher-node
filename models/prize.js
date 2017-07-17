module.exports = function(sequelize, DataTypes) {

	var Prize = sequelize.define("Prize", {
		name: {
			type: DataTypes.STRING, 
			unique: true,
			allowNull: false
		},
		number_of_referrals: {
			type: DataTypes.INTEGER, 
			defaultValue: 1,
			allowNull: false,	
			validate: {
				min: 0
			}
		},
		image: {
			type: DataTypes.STRING
		}
	});

	Prize.associate = function(models) {
		Prize.hasMany(models.Subscriber, {foreignKey: "prize_id"});
	}

	return Prize;
};