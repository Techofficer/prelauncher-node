var crypto = require("crypto");
var path = require("path");
var config = require(path.join(__dirname, '../config/config.json'));
var models = require("./index");

var json2csv = require('json2csv');
const REF_CODE_LENGTH = 6;

module.exports = function(sequelize, DataTypes) {

	var Prize = sequelize['import'](path.join(__dirname, "./prize"));

	var Subscriber = sequelize.define("Subscriber", {
		email: { 
			type: DataTypes.STRING, 
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true
			}
		},
		ip_address: { 
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIP: true,
			}
		},
		referral_code: { 
			type: DataTypes.STRING, 
			unique: true,
			allowNull: false,
			validate: {
				len: REF_CODE_LENGTH
			}
		},
		number_of_referrals: {
			type: DataTypes.INTEGER, 
			defaultValue: 0,	
			allowNull: false,		
			validate: {
				min: 0
			}
		}
	});

	Subscriber.hook('beforeValidate', (subscriber, options) => {
		subscriber.referral_code = crypto.randomBytes(10).toString('hex').substring(0, REF_CODE_LENGTH);
	});

	Subscriber.hook('afterCreate', (subscriber, options) => {
		subscriber.getReferrer().then(referrer => {
			if (referrer){
				referrer.number_of_referrals += 1;
				referrer.findPrize().then(prize => {
					referrer.prize_id = prize ? prize.id : null;
					referrer.save().then(() => {});
				});
			}
		});
	});

	Subscriber.hook('beforeDestroy', (subscriber, options) => {
		subscriber.getReferrer().then(referrer => {
			if (referrer){
				referrer.number_of_referrals -= 1;
				referrer.findPrize().then(prize => {
					referrer.prize_id = prize ? prize.id : null;
					referrer.save().then(() => {});
				});
			}
		});
	});


	Subscriber.associate = function(models) {
		Subscriber.belongsTo(Subscriber, {as: 'Referrer', foreignKey: 'referrer_id'});
		Subscriber.hasMany(Subscriber, {as: 'Referrals', foreignKey: 'referrer_id'});

		Subscriber.belongsTo(models.Prize, {foreignKey: "prize_id"});
	}

	Subscriber.prototype.referralURL = function() {
		let subscriber = this;
		return config.server.root_url + "/?ref=" + subscriber.referral_code;
	};

	Subscriber.prototype.subscriberURL = function() {
		let subscriber = this;
		return config.server.root_url + "/refer?uid=" + subscriber.id;
	};

	Subscriber.prototype.findPrize = function() {
		let subscriber = this;
    	return new Promise((resolve, reject) => {
        	Prize.findAll({
				where: { 
					number_of_referrals: {
						$lte: subscriber.number_of_referrals
					}
				},
				order: [
					['number_of_referrals', 'ASC']
				]
			}).then(prizes => {
				resolve(prizes[0]);
			});
    	});
	}

	Subscriber.prototype.calculateProgress = function(prizes){
		let subscriber = this;

		if (prizes.length == 0) return 100;

		let unit = subscriber.prize_id ? 100 / parseFloat(prizes.length) : 100 / parseFloat(2 * prizes.length);
		let base = 0;
        let targets = prizes.map(function(prize) {return prize.number_of_referrals;});
        

        if (!subscriber.prize_id) return unit * (subscriber.number_of_referrals / parseFloat(targets[0]));


        for (let index = 0; index < targets.length; index++){
        	let value = targets[index]
            if (subscriber.number_of_referrals >= value && value > 0){
                base += unit 
            } else if (index > 0){
            	base += unit * (subscriber.number_of_referrals - targets[index - 1]) / parseFloat(value - targets[index - 1]);
                break;
            }
        }

        base -= unit / parseFloat(2)

        return base;
	}

	Subscriber.generateXLS = function(subscribers, nodeExcel){
		let data = []
	    let columns = ["ID", "Email", "Code", "IP address", "Referrer", "Referrals", "Prize"];
	    let fields = ["id", "email", "referral_code", "ip_address", "referrer_id", "number_of_referrals", "prize"];
	    
	    for (var subscriber of subscribers){
	        data.push({
	        	id: subscriber.id.toString(), 
	        	email: subscriber.email, 
	        	referral_code: subscriber.referral_code, 
	        	ip_address: subscriber.ip_address, 
	        	referrer_id: subscriber.referrer_id ? subscriber.referrer_id.toString() : "-",
	        	number_of_referrals: subscriber.number_of_referrals ? subscriber.number_of_referrals.toString() : "-",
	        	prize: subscriber.Prize ? subscriber.Prize.name : "-"
	        });
	    }
	    
	    return json2csv({ data: data, fields: fields, fieldNames: columns });
	}

	return Subscriber;
};