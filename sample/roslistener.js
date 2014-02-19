var ros = require('../ros');

var myros = new ros( "ws://127.0.0.1:9090", function( err, ros){
	ros.subscribe("/listener", function(message){ console.log(message.msg.data) });


	setInterval( function(){

	ros.publish("/toto", "worldl");


	} , 1000) ; 
});

