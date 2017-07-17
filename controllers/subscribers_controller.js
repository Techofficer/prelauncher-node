var express = require('express');
var router = express.Router();
var models  = require('../models');
var fetchers = require("../lib/fetchers");


router
	.route("/")
		.get(fetchers.subscribers, function(req, res){
			console.log(req.pageNum);
			res.render('./subscribers/index', {subscribers: req.subscribers, pageNum: req.pageNum, query: req.query});
		})
		.post(fetchers.subscriberByEmail, function(req, res) {
			let params = req.body.subscriber;
			params.ip_address = req.connection.remoteAddress;

			models.Subscriber.create(params).then(subscriber => {
				res.redirect("/refer?uid=" + subscriber.id + "&newa=1");
			}).catch(error => {
				console.log(error);
				res.redirect("/");
			});
		});

router.get("/export", fetchers.subscribers, function(req, res){
	res.setHeader('Content-Type', 'application/vnd.openxmlformats');
	res.setHeader("Content-Disposition", "attachment; filename=" + "subscribers.xlsx");
	res.end(models.Subscriber.generateXLS(req.subscribers), 'binary');
});

router.delete("/:subscriber_id", fetchers.subscriber, function(req, res) {
	let subscriber = req.subscriber;
	subscriber.destroy().then(function(){
		res.json("/subscribers/");
	});
});

module.exports = router;