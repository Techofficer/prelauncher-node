var routes = [
	{path: "/", controller: "pages_controller"},
	{path: "/subscribers", controller: "subscribers_controller"},
	{path: "/prizes", controller: "prizes_controller"}
]

exports.activate = function(app){
	routes.forEach(function(route) {
		controller = require("../controllers/" + route.controller)
		app.use(route.path, controller);
	});	
}
