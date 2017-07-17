$(document).on("ready", function(e){

	$("a[data-method]").on("click hove", function(e){
		e.preventDefault();

		if ($(this).data("confirm") && !confirm("Are you sure?")){
			return false;
		}

		$.ajax({
			type: $(this).data("method"),
			url: $(this).attr("href")
		}).success(function(data) {
			console.log(data);
	       	window.location = data;
	    });
	});

});

