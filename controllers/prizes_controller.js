var express = require('express');
var fetchers = require("../lib/fetchers");
var router = express.Router();
var models = require("../models");

router
	.route("/")
		.get(fetchers.prizes, function(req, res) {
			res.render('./prizes/index', {prizes: req.prizes});
		})
		.post(function(req, res){
			let params = req.body.prize
			if (req.files.image) {params.image = "/uploads/" + req.files.image.name;}

			models.Prize.create(params).then(prize => {
				res.redirect("/prizes");
			}).catch(error => {
				console.log(error);
				res.redirect("/prizes");
			});
		});

router.get('/new', function(req, res) {
	let prize = models.Prize.build();
	res.render('./prizes/new', {prize: prize});
});

router.get('/:prize_id/edit', fetchers.prize, function(req, res) {
	res.render('./prizes/edit', {prize: req.prize});
});

router
	.route("/:prize_id")
		.put(fetchers.prize, function(req, res) {
			let params = req.body.prize
			let prize = req.prize;

			if (req.files.image) {params.image = "/uploads/" + req.files.image.name;}

			prize.update(params).then(() => {
				res.redirect("/prizes/");
			}).catch(error => {
				console.log(error);
				res.render('./prizes/edit', {prize: prize});
			});
		})
		.delete(fetchers.prize, function(req, res) {
			let prize = req.prize;
			prize.destroy().then(function(){
				res.json("/prizes/");
			});
		});


module.exports = router;
