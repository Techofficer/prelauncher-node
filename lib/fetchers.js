var models  = require('../models');

const PAGE_SIZE = 100;

exports.subscriber = function (req, res, next){

	models.Subscriber.findById(req.query.uid || req.params.subscriber_id).then(subscriber => {
		if (subscriber){
			req.subscriber = subscriber;
			next();
		} else {
			res.sendStatus(404);
		}
	});
}

exports.referrer = function (req, res, next){
	if (!req.query.ref){
		next();
	} else {
		models.Subscriber.findOne({where: {referral_code: req.query.ref}}).then(referrer => {
			if (referrer){
				req.referrer_id = referrer.id;
			}
			next();
		});
	}
}

exports.subscriberByEmail = function (req, res, next){
	models.Subscriber.findOne({where: {email: req.body.subscriber.email}}).then(subscriber => {
		if (!subscriber){
			res.subscriber = subscriber;
			next();
		} else {
			res.redirect("/refer?uid=" + subscriber.id);
		}
	});
}

exports.subscribers = function (req, res, next){
	var options = {include: [models.Prize], order: [['createdAt', 'DESC']]}

	if (req.query.q){
		options.where = {email: req.query.q}
	}

	if (req.query.page){
		options.offset = (req.query.page - 1) * PAGE_SIZE;
		options.limit = PAGE_SIZE;
	}

	models.Subscriber.findAndCountAll(options).then(result => {
		req.pageNum = (result.count / PAGE_SIZE) + 1;
		req.subscribers = result.rows;
		next();
	});
}

exports.prizes = function (req, res, next){
	models.Prize.findAll({
		order: [['number_of_referrals', 'ASC']],
		include: [models.Subscriber]
	}).then(prizes => {
		req.prizes = prizes;
		next();
	});
}

exports.prize = function (req, res, next){

	models.Prize.findById(req.params.prize_id).then(prize => {
		if (prize){
			req.prize = prize;
			next();
		} else {
			res.sendStatus(404);
		}
	});
}