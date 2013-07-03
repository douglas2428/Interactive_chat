var io=require('socket.io').listen(8056);
var querystring = require('querystring');
var http= require('http');


/*io.configure(function(){
	  io.set('transports', ['websocket']);
	});*/
 
var connectedClients = [];
var userList = [];

var options = {
		hostname: 'localhost',
		port: '8000',
		path: '/',
		method: 'GET',
		
	};

/*comunication_django:
 parametros:
 data (json): datos del cliente enviada mediante socket
 options (json): configuracion para el http.request, para enviar el request a una url de django
 
 callback:
 chunk(json): datos de respuesta q envia django a node
 
 Uso:
 comunication_django(data,options,function(res_django){
		//hacer algo con res_django;
	}) 
 */
function comunication_django(data,options,callback){
	
	var values = querystring.stringify(data);
	
	if(options.method=='POST')
		options.headers= {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': values.length
			}
	var req = http.request(options, function(res){
			res.setEncoding('utf8');
			res.on('data', function(chunk){
				chunk=JSON.parse(chunk);
				callback(chunk);
				
			});
			/*res.on('end', function () {
			});*/
			res.on('error', function(e) {
		        console.log("Got error: " + e.message);
		    });
		});
	    
		req.write(values);
		req.end();
}



function newMsg(socket, data) { 
	if(connectedClients.hasOwnProperty(socket.id)) {
		var clientFrom = connectedClients[socket.id];
		if(data.from == clientFrom.userName) {
			data.message=unescape(data.message);
			
			if(data.type == 'PRIVATE') {  
				options.path='/conversation/';
				options.method='POST';
				
				comunication_django(data,options,function(res_dj){
					for(client in connectedClients) {
						console.log("fecha "+res_dj.date)
						if(connectedClients[client].userName == data.to && data.to != data.from) {   
							connectedClients[client].socket.emit('msg', res_dj);
							socket.emit('msg',data);
							
						}
					}
				});
				
				
			} else {
				socket.broadcast.emit('msg', data); 
				socket.emit('msg',data);
			}
			
			 
		}
	}
}
 
 
function assignUserName(userName, idSocket) {
	connectedClients[idSocket].userName = userName;
}
 
function isUserNameAvailable(userName) {
	for(var client in connectedClients) {
		if(connectedClients[client].userName == userName) {
			return false;  
		}
	}
	return true;
}
 
function makeUserList() {
	userList = [];
	var i = 0;
	for(var client in connectedClients) {   
		userList[i] = {"userName" : connectedClients[client].userName};
		i++;
	}
}

io.sockets.on('connection', function(socket) {
	
	connectedClients[socket.id] = {};
	connectedClients[socket.id].socket = socket;
	
  
	 socket.on('authData', function(data) {
		 	options.path='/prueba/';
			options.method='POST';
			
			comunication_django(data,options,function(res_dj){
				if(isUserNameAvailable(data.userName) == true) {
					//userList.push({"userName" : data.userName});
					 userList.push({"userName" : res_dj.userName});
					 assignUserName(data.userName, socket.id);
					 socket.emit('userList', userList);
					 socket.broadcast.emit('userList', userList);
				 } else {
					 socket.emit('authData', {"isAvailable" : false});  
				 }
			});
			
	 });
  
	 socket.on('msg', function(data) {
		 newMsg(socket, data); 
	 });
	 
	 socket.on('showMessages',function(data){
		options.path='/messages/';
		options.method='POST';
		
		comunication_django(data,options,function(res_dj){
			socket.emit('showMessages',res_dj.messages);
			
		})
	 });
  
	 socket.on('disconnect', function(data) {
		 if(connectedClients.hasOwnProperty(socket.id)) {
			 var userDisconnect=connectedClients[socket.id].userName;
			 delete connectedClients[socket.id];
		 }   
		 makeUserList();
		 var msg = {};
		 msg.type='PUBLIC'
		 msg.from='System'
		 msg.message=userDisconnect+" is disconnected"
		 socket.broadcast.emit('msg', msg);
		 socket.broadcast.emit('userList', userList);
	 });
	 
	 //pizarra
	// Start listening for mouse move events
	    socket.on('mousemove', function (data) {

	        // This line sends the event (broadcasts it)
	        // to everyone except the originating client.
	        socket.broadcast.emit('moving', data);
	    });
});