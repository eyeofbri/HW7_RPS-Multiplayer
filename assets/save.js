// Initialize Firebase
var config = {
	apiKey: "AIzaSyCO8qO3fu10LojbrZYLCUhsGnO0iX-nZzQ",
	authDomain: "hw7-rps-multiplayer.firebaseapp.com",
	databaseURL: "https://hw7-rps-multiplayer.firebaseio.com",
	storageBucket: "hw7-rps-multiplayer.appspot.com",
	messagingSenderId: "4888347072"
};	
firebase.initializeApp(config);
var dataRef = firebase.database();

var myPlayerKey = "";
var myPlayerNumber = 0;

var activePlayer = false;

$(document).ready(function() {

	gameFunctions("titleText-Glow-start");

	$("#projectorScreen-toggle").click(function(event) {
		$("#projectorScreen").toggleClass("projectorScreen-open");
	});

	$("#joinGame-submit").on("click", function (event) {
 		event.preventDefault();
 		gameFunctions("try-add-player");
 	} );

});


function gameFunctions(whatToDo) {

	if(whatToDo == "titleText-Glow-start"){
		//split the game's title text up into divs...
		//...so we can loop through them and assign classes later

		var titleText = [];
		titleText = $("#gameTitle-holder").text().split("");
		$("#gameTitle-holder").text("");


		for (var i = 0; i < titleText.length; i++) {
			var new_titleText_div = $("<div>");
			new_titleText_div.text(titleText[i]);
			new_titleText_div.addClass("gameTitle");
			$("#gameTitle-holder").append(new_titleText_div);
		}

		//loop through those new divs and add the glow text class
		gameFunctions("titleText-Glow");
		
		//...then set an interval that does the same
		setInterval(function(){ 
			gameFunctions("titleText-Glow");
		}, 5000);
	}

	if(whatToDo == "titleText-Glow"){
		//loop through the game title text divs...
		//...and set timeouts that Add and Remove the glow text class
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

	if(whatToDo == "try-add-player"){
		if($("#joinGame-input").val().trim() != "" ){
 			var players_loggedIN = once("players").val().loggedIn;
 			if(players_loggedIN <=1){
 				//add ME as a new player!
 				$("#joinGame").addClass("hide");

 				activePlayer = true;

 				dataRef.ref().child( "players" ).update({ loggedIn: (players_loggedIN+1) });
 				
 				if( (players_loggedIN+1) == 1){ myPlayerNumber = 1;
 				} else{ myPlayerNumber = 2;}

 				var playerName = capitalizeFirstLetter( $("#joinGame-input").val().trim() );

 				// dataRef.ref().child( "players" ).push({
 				// 	name: playerName,
			  //       playerNumber: myPlayerNumber,
			  //       wins: 0,
			  //       loses: 0
			  //   }).then((snap) => {
			  //      myPlayerKey = snap.key;
			  // 	});



			  	$("#display-text-top").removeClass("hide");
			  	$("#display-text-top").text("Hi "+playerName+"! You Are Player "+myPlayerNumber+".");

			  	dataRef.ref().child("players").child("player"+myPlayerNumber).update({ 
			  		name: playerName, 
			  		wins: 0,
			        loses: 0
			  	});

			  	$("#joinGame-input").val("");



 			}
 			
	   	}
	}

}

function once(keyName) {
	var sendBack;
	dataRef.ref().once("value", function(snapshot) {
		snapshot.forEach(function(itemSnapshot) {
	  	if(itemSnapshot.key == keyName){
	  		sendBack = itemSnapshot;
	  	}
	  });
	});
	return sendBack;
}



dataRef.ref().on("child_changed", function(snapshot) {
	if( snapshot.child("player1").child("name").val() ){ 
		$("#combatant-one-data .combatant-name").text( snapshot.child("player1").child("name").val() ); 
	}else{ $("#combatant-one-data .combatant-name").text("Waiting for Player 1"); }


	if( snapshot.child("player2").child("name").val() ){ 
		$("#combatant-two-data .combatant-name").text( snapshot.child("player2").child("name").val() ); 
	}else{ $("#combatant-two-data .combatant-name").text("Waiting for Player 2"); }


	
	// console.log( snapshot.child( myPlayerKey ).child("name").val() );
	// if(myPlayerNumber === 0 ){
	// 	console.log(myPlayerNumber);

	if(snapshot.child("loggedIn").val() == 2){
		$("#joinGame").addClass("hide");
	} else{
		console.log(activePlayer);
		if(!activePlayer){
			$("#joinGame").removeClass("hide");
		}
	}


});



//INITIAL LOAD 
dataRef.ref().once("value", function(snapshot) {
  //var list = snapshot.val();

  	if(snapshot.child("players").child("loggedIn").val() <=1){
		$("#joinGame").removeClass("hide");
  	}
  	var maybePlayer1 = snapshot.child("players").child("player1").child("name").val();
	if( maybePlayer1 ){ $("#combatant-one-data .combatant-name").text( maybePlayer1 ); 
	}else{ $("#combatant-one-data .combatant-name").text("Waiting for Player 1"); }

	var maybePlayer2 = snapshot.child("players").child("player2").child("name").val();
	if( maybePlayer2 ){ $("#combatant-two-data .combatant-name").text( maybePlayer2 ); 
	}else{ $("#combatant-two-data .combatant-name").text("Waiting for Player 2"); }

});





window.onbeforeunload = closingCode;
function closingCode(){
   if(activePlayer){
   		$("#display-text-top").addClass("hide");
		$("#display-text-top").text("");

   		// dataRef.ref().child("players").child( myPlayerKey ).remove();

   		dataRef.ref().child("players").child( "player"+ myPlayerNumber ).remove();

   		var players_loggedIN =  once("players").val().loggedIn;
		dataRef.ref().child( "players" ).update({ loggedIn: (players_loggedIN-1) });
   }
   return null;
}





function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}