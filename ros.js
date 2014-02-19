var WebSocket=require('ws');

function ros(url , cb){
	if (!(this instanceof ros)){
		return new ros(url, cb);
	}

	this._ws = new WebSocket(url);
	var self=this;
	this._ws.on('open', function() {
		cb(null, self); 
	});


	this._ws.on('message', function(datastring, flags) {
		var data = JSON.parse(datastring);

		if(data.op ==="publish"){
			if(data.topic in self._subscribed){
				self._subscribed[data.topic].forEach(function(el){
					el(data);
				})
			}
		}
	});
}

ros.prototype._subscribed = {};
ros.prototype._published = {};

ros.prototype._buildID = function(type , topic){
	return type+":"+topic+":"+Math.random();
}
ros.prototype.send = function( obj ){
	obj.id = obj.id || this._buildID(obj.type, obj.topic);
	obj.compression = obj.compression || "none";

	this._ws.send( JSON.stringify( obj));
}
ros.prototype.subscribe = function(opt , onmesage){
	var type , topic;
	if(typeof opt == "string"){
		topic = opt;
		type = "std_msgs/String";
	}else{
		topic = opt.topic;
		type = opt.type;
	}
		this._subscribed[topic] = this._subscribed[topic] || [];
		this._subscribed[topic].push(onmesage);
		if(this._subscribed[topic].length ===1 ){
			this.send( {op:"subscribe",type:type,topic:topic,throttle_rate:0});
		}
}

ros.prototype.publish = function( opt, message){
	var topic , type; 
	if(typeof opt == "string"){
		topic = opt;
		type = "std_msgs/String";
	}else{
		topic = opt.topic;
		type = opt.type;
	}

	if(!this._published[topic]){
		this._published[topic] = 0;
		this.send( { op :"advertise" , topic:topic , type:type } );
	}
	this._published[topic]++;

	if(type =="std_msgs/String"){
		message = { data : message};
	}
	this.send( { op :"publish" , topic:topic , type:type, msg : message})

}
module.exports= ros;
