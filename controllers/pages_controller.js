var express = require('express');
var sitemap = require("../config/sitemap");
var querystring = require("querystring");
var fetchers = require("../lib/fetchers");
var router = express.Router();

router.get('/', fetchers.referrer, function(req, res) {
	res.render('./subscribers/new', {referrer_id: req.referrer_id});
});

router.get("/refer", fetchers.subscriber, fetchers.prizes, function(req, res){
	res.render('./subscribers/show', {querystring: querystring, subscriber: req.subscriber, prizes: req.prizes, newa: req.query.newa});
});

router.get('/sitemap.xml', function(req, res) {
    sitemap.toXML(function (xml) {
		res.header('Content-Type', 'application/xml');
		res.send(xml);
	});
});


module.exports = router;
