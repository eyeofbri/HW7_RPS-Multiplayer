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

var myPlayerNumber = "";
var initial_chat_load = false;


$(document).ready(function() {

	animateText("load");

	$("#projectorScreen-toggle").click(function(event) {
		$("#projectorScreen").toggleClass("projectorScreen-open");
	});

	$("#joinGame-submit").on("click", function (event) {
 		event.preventDefault();
 		gameFunctions("try-add-player");
 	} );


 	$("#chat-submit").on("click", function (event) {
 		event.preventDefault();
 		gameFunctions("try-to-chat");
 	} );

});




function animateText(whatToDo) {

	if(whatToDo == "load"){
		//split the game's title text up into divs...
		var titleText = [];
		titleText = $("#gameTitle-holder").text().split("");
		$("#gameTitle-holder").text("");

		//...so we can loop through them and assign classes
		for (var i = 0; i < titleText.length; i++) {
			var new_titleText_div = $("<div>");
			new_titleText_div.text(titleText[i]);
			new_titleText_div.addClass("gameTitle");
			$("#gameTitle-holder").append(new_titleText_div);
		}

		//loop through those new divs and add the glow text class
		animateText("animate");
		
		//...then set an interval that does the same
		setInterval(function(){ 
			animateText("animate");
		}, 5000);
	}

		// this makes the split  text glow
	if(whatToDo == "animate"){
		//loop through the game title text divs...
		//...and set timeouts that Add and Remove the glow text class
		var gt = document.getElementsByClassName("gameTitle");
		for (var i = 0; i < gt.length; i++) {

			setTimeout(function(g){ 
				$(".gameTitle").eq(g).addClass("gameTitle-glow");

				setTimeout(function(g2){ 
					$(".gameTitle").eq(g2).removeClass("gameTitle-glow");
				}, (200 * g),g );

			}, (100 * i),i );	
		}
	}
}

function gameFunctions(whatToDo) {

	var whatToDo_Split = whatToDo.split("_");

	if(whatToDo == "try-add-player" 
		&& $("#joinGame-input").val().trim() != "" ){

		var playerName = capitalizeFirstLetter( $("#joinGame-input").val().trim() );

		var player1 = once("players").val().player1;
		var player2 = once("players").val().player2;
		var whichPlayer = "";
		if(!player1){ whichPlayer = "player1";
		}else if(!player2){ whichPlayer = "player2"; }

		if(whichPlayer !=""){
			myPlayerNumber = whichPlayer;
			dataRef.ref().child("players").child(whichPlayer).update({ 
		  	name: playerName, 
		  	wins: 0,
		    losses: 0
		});

		$("#joinGame").remove();
		$("#display-text-top").removeClass("hide");
	  	$("#display-text-top").text("Hi "+playerName+"! You Are "+whichPlayer.substring(0, whichPlayer.length -1)+" "+ whichPlayer.slice(-1)+".");
	  	
	  	shakeThings("display-text-top");
		  	setTimeout(function(){ 
				if(myPlayerNumber == "player1"){
			  		shakeThings("combatant-one-data");
			  	}else{
			  		shakeThings("combatant-two-data");
			  	}
			}, (100) ); 	
		}
	}

	if(whatToDo == "append-atk"){
		var atk = $("<div>");
		atk.attr("id", "atk");
		atk.addClass("attackSelect");

		var rock_btn = $("<button>");
		rock_btn.text("👊");
		atk.append(rock_btn);

		var paper_btn = $("<button>");
		paper_btn.text("✋");
		atk.append(paper_btn);

		var scissors_btn = $("<button>");
		scissors_btn.text("✌️️");
		atk.append(scissors_btn);

		rock_btn.unbind().click(function(event) {
	   		event.preventDefault();
	   		gameFunctions("atk_rock");
		});
		paper_btn.unbind().click(function(event) {
	   		event.preventDefault();
	   		gameFunctions("atk_paper");
		});
		scissors_btn.unbind().click(function(event) {
	   		event.preventDefault();
	   		gameFunctions("atk_scissors");
		});

		if(myPlayerNumber == "player1"){ 
			atk.insertBefore( $( "#combatant-one-data .stats" ) );
			$("#display-text-sub").removeClass("hide").text("It is your turn!");
			
		}else if(myPlayerNumber == "player2"){ 
			atk.insertBefore( $( "#combatant-two-data .stats" ) );
			$("#display-text-sub").removeClass("hide").text("It is your turn!");
		}

		shakeThings("atk");

		$("#combatant-ONE .screenDisplay").text( returnEmoji( "question" ) );
		$("#combatant-TWO .screenDisplay").text( returnEmoji( "question" ) );
		
	}

	if(whatToDo_Split[0] == "atk"){
		var whichAttack = whatToDo_Split[1];

   		dataRef.ref().child("players").child(myPlayerNumber).update({ choice: whichAttack });
		
		var currentTurn = once("players").val().turn;
		dataRef.ref().child("players").update({ turn: (currentTurn+1) });

		if(myPlayerNumber == "player1"){
			$("#combatant-ONE .screenDisplay").text( returnEmoji( whichAttack ) );
		}else{ $("#combatant-TWO .screenDisplay").text( returnEmoji( whichAttack ) ); }
	}


 	if(whatToDo == "try-to-chat" 
 		&& $("#chat-input").val().trim() != "" ){
		if(myPlayerNumber == "player1" || myPlayerNumber == "player2"){

			//grab the current chat log number from firebase
			var currentChat_number = once("players").child("chatLog").child("currentCount").val() ;
			
			//update it right away
			var newChat_number = (currentChat_number + 1);
			dataRef.ref().child("players").child("chatLog").update({ 
				currentCount: newChat_number 
			});

			//use it to create a new chat item
			var newChat_name = once("players").child(myPlayerNumber).child("name").val();
			newChat_name = newChat_number + "_" + newChat_name + "_" + myPlayerNumber;

			//grab the actualy chat log line
 			var chatText = $("#chat-input").val().trim();
			$("#chat-input").val("");

			//feed ALL that data to firebase, as a new chat log item
			var updatedObj = {};
			updatedObj[newChat_name] = chatText;
			dataRef.ref().child("players").child("chatLog").update(updatedObj);
		}
 	}

 	//game alerts pop up in the chat through this
 	if(whatToDo_Split[0] == "chat-log"){

		var currentChat_number = once("players").child("chatLog").child("currentCount").val() ;
		
		//update it right away
		var newChat_number = (currentChat_number + 1);
		dataRef.ref().child("players").child("chatLog").update({ 
			currentCount: newChat_number 
		});

		//use it to create the new chat item
		//create the quit chat log line
		var chatText = whatToDo_Split[1];

		//format the name for the chat log
		var newChat_name = newChat_number + "_alert";

		//feed ALL that data to firebase, as a new chat log item
		var updatedObj = {};
		updatedObj[newChat_name] = chatText;
		dataRef.ref().child("players").child("chatLog").update(updatedObj);
	}

}



dataRef.ref().on("child_changed", function(snapshot) {

	//dealing with players joining the game, and quiting
	var maybePlayer1 = snapshot.child("player1").child("name").val();
	var maybePlayer2 = snapshot.child("player2").child("name").val();

	if( maybePlayer1 ){ 
		$("#combatant-one-data .combatant-name").text( maybePlayer1 ); 
		//show p1 stats
		$("#combatant-one-data .stats").removeClass("hide");
		//fill it with stats
		var wins_p1 = snapshot.child("player1").child("wins").val();
		var losses_p1 = snapshot.child("player1").child("losses").val();
		$("#combatant-one-data .stats .wins").text(wins_p1);
		$("#combatant-one-data .stats .losses").text(losses_p1);

	}else{ 
		$("#combatant-one-data .combatant-name").text("Waiting for Player 1"); 
		$("#combatant-one-data .stats").addClass("hide");
	}

	if( maybePlayer2 ){ 
		$("#combatant-two-data .combatant-name").text( maybePlayer2 ); 
		//shjow p2 stats
		$("#combatant-two-data .stats").removeClass("hide");
		//fill it with stats
		var wins_p2 = snapshot.child("player2").child("wins").val();
		var losses_p2 = snapshot.child("player2").child("losses").val();
		$("#combatant-two-data .stats .wins").text(wins_p2);
		$("#combatant-two-data .stats .losses").text(losses_p2);

	}else{ 
		$("#combatant-two-data .combatant-name").text("Waiting for Player 2"); 
		$("#combatant-two-data .stats").addClass("hide");
	}

	//if One of the two players is missing...
	//...show the join game input to people who arent yet a player
	if(!maybePlayer1 || !maybePlayer2){
		$("#joinGame").removeClass("hide");

		$("#combatant-one-data").removeClass("combantant-turn-highlight");
		$("#combatant-two-data").removeClass("combantant-turn-highlight");

		$("#overlay-display-holder").addClass("hide");
		$("#overlay-display").addClass("hide").text("");
	}

	//if both player exist...
	//...then lets start the game!
	if(maybePlayer1 && maybePlayer2){
		$("#joinGame").addClass("hide");

		//if turn zero (or turns dont exist yet)
		//start up the turns! and player 1 attacks!
		var currentTurn = snapshot.child("turn").val();
		if(!currentTurn){
			dataRef.ref().child("players").update({ turn: 1 });
			currentTurn = 1;
		}

		//player1's turn!
		if( currentTurn == 1 ){
			$("#combatant-one-data").addClass("combantant-turn-highlight");
			$("#combatant-two-data").removeClass("combantant-turn-highlight");

			if(myPlayerNumber == "player1"){
				if( document.getElementById('atk') === null ){
					gameFunctions("append-atk");
				}
			}
			if(myPlayerNumber =="player2"){
				$("#atk").remove();
			}

			// $("#combatant-ONE .screenDisplay").text( "" );
			// $("#combatant-TWO .screenDisplay").text( "" );
			$("#combatant-ONE .screenDisplay").text( returnEmoji( "question" ) );
			$("#combatant-TWO .screenDisplay").text( returnEmoji( "question" ) );
		}

		//player2's turn!
		if( currentTurn == 2 ){
			$("#combatant-one-data").removeClass("combantant-turn-highlight");
			$("#combatant-two-data").addClass("combantant-turn-highlight");

			if(myPlayerNumber == "player2"){
				if( document.getElementById('atk') === null ){
					gameFunctions("append-atk");
				}
			}
			if(myPlayerNumber =="player1"){
				$("#atk").remove();
				$("#display-text-sub").addClass("hide").text("");
			}
		}

		//time to calculate...
		//...the winner of this round!
		if( currentTurn == 3 ){

			//update turn to 4...
			//..im using it as a sort of "End Game State"
			dataRef.ref().child("players").update({ turn: 4 });	

			//player two jsut got done attacking...
			//..so lets reset their page
			$("#combatant-two-data").removeClass("combantant-turn-highlight");	
			if(myPlayerNumber =="player2"){
				$("#atk").remove();
				$("#display-text-sub").addClass("hide").text("");
			}

			//DO R,P,S logic..
			//THEN SHOW THE RESULTS

			var p1_choice = snapshot.child("player1").child("choice").val();
			var p2_choice = snapshot.child("player2").child("choice").val();
			//you need to store the choice vars....
			//..but only need to show the OTHER PLAYERS choice..
			//..your choice was loaded when you picked it
			if(myPlayerNumber == "player2"){
				$("#combatant-ONE .screenDisplay").text( returnEmoji( p1_choice ) );
			}else{
				$("#combatant-TWO .screenDisplay").text( returnEmoji( p2_choice ) );
			}

			//do the RPS logic!
			var endDisplay = "";
			var roundWinner = returnWinner(p1_choice, p2_choice); 

			if(roundWinner == "p1"){
				endDisplay = snapshot.child("player1").child("name").val() 
				+ " beat "
				+ snapshot.child("player2").child("name").val() +".";
			
				//doing this part through player 1...
				//..so it only triggers once
				if(myPlayerNumber == "player1"){
					var p1_wins = snapshot.child("player1").child("wins").val();
					p1_wins = (p1_wins+1);
					dataRef.ref().child("players").child("player1").update({ wins: p1_wins });
				
					var p2_losses = snapshot.child("player2").child("losses").val();
					p2_losses = (p2_losses+1);
					dataRef.ref().child("players").child("player2").update({ losses: p2_losses });

				}
			}
			if(roundWinner == "p2"){
				endDisplay = snapshot.child("player2").child("name").val()
				+ " beat "
				+ snapshot.child("player1").child("name").val() +".";

				//doing this part through player 1...
				//..so it only triggers once
				if(myPlayerNumber == "player1"){
					var p2_wins = snapshot.child("player2").child("wins").val();
					p2_wins = (p2_wins+1);
					dataRef.ref().child("players").child("player2").update({ wins: p2_wins });
					
					var p1_losses = snapshot.child("player1").child("losses").val();
					p1_losses = (p1_losses+1);
					dataRef.ref().child("players").child("player1").update({ losses: p1_losses });
				}
			}
			if( roundWinner == "tie" ){
				endDisplay = "Tie Game!";
			}


			///push the winner into the chat log..
			//..push it from once instance... (player1)
			if(myPlayerNumber == "player1"){
				gameFunctions("chat-log_"+endDisplay);
			}

			//show the people who won!
			$("#overlay-display-holder").removeClass("hide");
			$("#overlay-display").removeClass("hide").text(endDisplay);

			//set time-out to start new round!
			setTimeout(function(){ 
				$("#overlay-display-holder").addClass("hide");
				$("#overlay-display").addClass("hide").text("");

				if(myPlayerNumber == "player1"){
					dataRef.ref().child("players").update({ turn: 1 });
				}
				$("#combatant-ONE .screenDisplay").text( returnEmoji( "question" ) );
				$("#combatant-TWO .screenDisplay").text( returnEmoji( "question" ) );

			}, (1000) );
				
		}
		

		//Chat display!
		if(myPlayerNumber == "player1" || myPlayerNumber =="player2"){
			$("#chat-holder").removeClass("hide");
		}
		//removing the chat
		if(!maybePlayer1 || !maybePlayer2){
			dataRef.ref().child("players").child("chatLog").update({ currentCount: 0 });
		}

	}

	if(!maybePlayer1 && !maybePlayer2){
		$("#chat-display").text("");
	}
});




dataRef.ref().child("players").child("chatLog").on('value', function(snapshot) {

   	var currentChat_number = snapshot.child("currentCount").val() ;

	//clear empty chats from firebase
	if(currentChat_number == 0){		
		snapshot.forEach(function(chat) {
		  	if(chat.key !="currentCount"){
		  		dataRef.ref().child("players").child("chatLog").child(chat.key).remove();
		  	}
		});
	}

	snapshot.forEach(function(snapshotItem) {
	    // console.log(snapshotItem.key + "-"+snapshotItem.val() );
	    
	    //using this to load up the full chat ONLY when your first join it
	    var keyCompare = 0;
	    if(!initial_chat_load){ initial_chat_load = true;
	    }else{ keyCompare = $("#"+snapshotItem.key).length; }


	    if(snapshotItem.key.split("_")[0] == currentChat_number 
	    	&& keyCompare == 0){

	    	// add this item to the chat display
	    	var newChat_Line = $("<p>");

 			var newChat_Class = "";
 			if(snapshotItem.key.split("_")[2] == "player1"){ newChat_Class = "chat-p1";
 			}else (newChat_Class = "chat-p2");
			newChat_Line.addClass(newChat_Class);

			newChat_Line.attr("key", snapshotItem.key);
			newChat_Line.text(snapshotItem.key.split("_")[1] +": "+ snapshotItem.val() );

			//account for disconnecting players
			var dc = snapshotItem.val().split(" ");
			if(dc[dc.length-1] == "Quit." 
				&& snapshotItem.key.split("_")[1] == "Quit"){
				newChat_Line.removeClass(newChat_Class).addClass("chat-disconnect");
				newChat_Line.text( snapshotItem.val() );
			}

			//account for alerts
			var a = snapshotItem.val().split("_");
			if(snapshotItem.key.split("_")[1] == "alert"){
				newChat_Line.removeClass(newChat_Class).addClass("chat-alert");
				newChat_Line.text( snapshotItem.val() );
			}

			$("#chat-display").append(newChat_Line);
			
			//scroll the chat display to the bottom...
			//..in case its overflowing
			$('#chat-display').scrollTop($('#chat-display')[0].scrollHeight);
	    }
	});

});



//INITIAL LOAD 
dataRef.ref().once("value", function(snapshot) {
  //var list = snapshot.val();

 
  	var maybePlayer1 = snapshot.child("players").child("player1").child("name").val();
	var maybePlayer2 = snapshot.child("players").child("player2").child("name").val();

	if( maybePlayer1 ){ 
		$("#combatant-one-data .combatant-name").text( maybePlayer1 ); 
		//show p1 stats
		$("#combatant-one-data .stats").removeClass("hide");
		$("#combatant-one-data .stats .wins").text(snapshot.child("players").child("player1").child("wins").val());
		$("#combatant-one-data .stats .losses").text(snapshot.child("players").child("player1").child("losses").val());
	}else{ 
		$("#combatant-one-data .combatant-name").text("Waiting for Player 1"); 
		$("#combatant-one-data .stats").addClass("hide");
	}

	if( maybePlayer2 ){ 
		$("#combatant-two-data .combatant-name").text( maybePlayer2 ); 
		//shjow p2 stats
		$("#combatant-two-data .stats").removeClass("hide");
		$("#combatant-two-data .stats .wins").text(snapshot.child("players").child("player2").child("wins").val());
		$("#combatant-two-data .stats .losses").text(snapshot.child("players").child("player2").child("losses").val());
	}else{ 
		$("#combatant-two-data .combatant-name").text("Waiting for Player 2"); 
		$("#combatant-two-data .stats").addClass("hide");
	}

	if(!maybePlayer1 || !maybePlayer2){
		$("#joinGame").removeClass("hide");
	}

	if(maybePlayer1 && maybePlayer2){
		$("#joinGame").addClass("hide");

		var currentTurn = snapshot.child("players").child("turn").val();
		
		//..the game is underway, load it up for the spectator
		if( currentTurn == 1 ){
			$("#combatant-one-data").addClass("combantant-turn-highlight");
			$("#combatant-two-data").removeClass("combantant-turn-highlight");
		}
		if( currentTurn == 2 ){
			$("#combatant-one-data").removeClass("combantant-turn-highlight");
			$("#combatant-two-data").addClass("combantant-turn-highlight");
		}
		if( currentTurn == 3 ){
			//show this spectator the results!
			var p1_choice = snapshot.child("players").child("player1").child("choice").val();
			$("#combatant-ONE .screenDisplay").text( returnEmoji( p1_choice ) );

			var p2_choice = snapshot.child("players").child("player2").child("choice").val();
			$("#combatant-TWO .screenDisplay").text( returnEmoji( p2_choice ) );


			var endDisplay = "";
			var roundWinner = returnWinner(p1_choice, p2_choice); 

			if(roundWinner == "p1"){
				endDisplay = snapshot.child("players").child("player1").child("name").val() 
				+ " Won against"
				+ snapshot.child("players").child("player2").child("name").val() +".";
			}
			if(roundWinner == "p2"){
				endDisplay = snapshot.child("players").child("player2").child("name").val()
				+ " Won against"
				+ snapshot.child("players").child("player1").child("name").val() +".";
			}
			if( roundWinner == "tie" ){
				endDisplay = "Tie Game!";
			}

			$("#overlay-display-holder").removeClass("hide");
			$("#overlay-display").removeClass("hide").text(endDisplay);

			//set time out to start new round!
			setTimeout(function(){ 
				$("#overlay-display-holder").addClass("hide");
				$("#overlay-display").addClass("hide").text("");
			}, (1000) );
		}
		

	}
});


function returnWinner(p1_pick, p2_pick) {
	returnThis = "";
	if( p1_pick == "scissors" && p2_pick == "paper"
		|| p1_pick == "rock" && p2_pick == "scissors"
		|| p1_pick == "paper" && p2_pick == "rock"){
		returnThis = "p1";
	}

	if( p1_pick == "rock" && p2_pick == "paper"
		|| p1_pick == "paper" && p2_pick == "scissors"
		|| p1_pick == "scissors" && p2_pick == "rock"){
		returnThis = "p2";
	}
	
	if( p1_pick == p2_pick){
		returnThis = "tie";
	}
	return returnThis;
}


function returnEmoji(which) {
	var returnThis = "";
	if(which == "rock"){ returnThis = "👊"; }
	if(which == "paper"){ returnThis = "✋️️"; }
	if(which == "scissors"){ returnThis = "✌️️"; }
	if(which == "question"){ returnThis = "❓"; }
	return returnThis;
}




//Adding ALL this to try and get unload events on mobile devices

var canUnload = true;
window.onunload = function() {page_unload();}
window.onbeforeunload = page_unload;
window.addEventListener ("beforeunload", page_unload, false);

function page_unload(){
   if(myPlayerNumber !="" && canUnload){
   		canUnload = false;
   		//RESTART the player system for this player
   		dataRef.ref().child("players").child( myPlayerNumber ).remove();
   		dataRef.ref().child("players").child("turn").remove();

   		//restart the chat...
   		//..but first, send out a player disconnected into the chat...
   		//...so the other player sees that

   		//grab the current chat log number from firebase
		var currentChat_number = once("players").child("chatLog").child("currentCount").val() ;
		
		//update it right away
		var newChat_number = (currentChat_number + 1);
		dataRef.ref().child("players").child("chatLog").update({ 
			currentCount: newChat_number 
		});

		//use it to create the new chat item
		//create the quit chat log line
		var chatText = myPlayerNumber+" Has Quit.";

		//format the name for the chat log
		var newChat_name = newChat_number + "_Quit";

		//feed ALL that data to firebase, as a new chat log item
		var updatedObj = {};
		updatedObj[newChat_name] = chatText;
		dataRef.ref().child("players").child("chatLog").update(updatedObj);
				
   		dataRef.ref().child("players").child("chatLog").update({ currentCount: 0 });
   	
   }
   return null;
}








/*BEGIN */
/*FIREBASE SPECIFIC, COMMON JAVASCRIPT*/
/*///////*/

function once(keyName) {
	var sendBack;
	firebase.database().ref().once("value", function(snapshot) {
		snapshot.forEach(function(itemSnapshot) {
	  	if(itemSnapshot.key == keyName){
	  		sendBack = itemSnapshot;
	  	}
	  });
	});
	return sendBack;
}

/*END */
/*FIREBASE SPECIFIC, COMMON JAVASCRIPT*/
/*///////*/








/*BEGIN */
/*NON SPECIFIC, COMMON JAVASCRIPT*/
/*///////*/

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



function oddOrEven(x) {
  return ( x & 1 ) ? "odd" : "even";
}



console.todo = function( msg){
 	console.log( '%c %s %s %s ', 'color: yellow; background-color: black;', '--', msg, '--');
}

console.important = function( msg){
        console.log( '%c%s %s %s', 'color: white; font-weight: bold; background-color: brown', '--', msg, '--');
}



function shakeThings(el) {
    var thingToShake = document.getElementById(el);

    var elClasses = thingToShake.classList;
    if (elClasses.contains("shake")) { 
    	elClasses.remove("shake"); 
    }

	thingToShake.classList.add("shake");
	setTimeout(function(){ elClasses.remove("shake"); }, 500);
}

/*END */
/*NON SPECIFIC, USUAL JAVASCRIPT*/
/*///////*/