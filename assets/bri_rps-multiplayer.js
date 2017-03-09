
$(document).ready(function() {

	$("#projectorScreen-toggle").click(function(event) {
		$("#projectorScreen").toggleClass("projectorScreen-open");
	});

	gameFunctions("titleText_GlowStart");
});


function gameFunctions(whatToDo) {
	if(whatToDo == "titleText_GlowStart"){
		var titleText = [];
		titleText = $("#gameTitle-holder").text().split("");
		$("#gameTitle-holder").text("");

		for (var i = 0; i < titleText.length; i++) {
			var new_titleText_div = $("<div>");
			new_titleText_div.text(titleText[i]);
			new_titleText_div.addClass("gameTitle");
			$("#gameTitle-holder").append(new_titleText_div);
		}

		gameFunctions("titleText_Glow");
		setInterval(function(){ 
			gameFunctions("titleText_Glow");
		}, 5000);

	}
	if(whatToDo == "titleText_Glow"){
		var gt = document.getElementsByClassName("gameTitle");
			for (var i = 0; i < gt.length; i++) {

				setTimeout(function(g){ 
					$(".gameTitle").eq(g).addClass("gameTitle-glow");

					setTimeout(function(g2){ 
						$(".gameTitle").eq(g2).removeClass("gameTitle-glow");
					}, (70 * g),g );

				}, (50 * i),i );	
		}
	}
}