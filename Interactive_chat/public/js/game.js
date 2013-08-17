window.addEventListener('load',init,false);

var canvas=null,ctx=null;

var lastKey=null;
var PAUSE=true;
var players = {};
var colors=["green","red","blue"];
//var id = Math.round($.now()*Math.random());
var socket_id=null;

var speed=10;
var p1 = {x:50,y:50};
var angle = 35;
var radians = 0;
var xmove = 0;
var ymove = 0;
var ball = {x:p1.x, y:p1.y};
updateBall();

function init(){
 canvas=document.getElementById('canvas');
 canvas.style.background='#fff';
 ctx=canvas.getContext('2d');
 canva = $('#canvas');
 
 canva.on('mouseover',function(e){
	    e.preventDefault();
	    
	    
	    if(! (socket_id in players)){
	    	
            socket.emit('newPlayer',{
                'x': e.pageX-canvas.offsetParent.offsetLeft,
                'y': e.pageY-canvas.offsetParent.offsetTop
                
            });
           
        }
	    
 });
 
 socket.on('newPlayer',function(data){
	 socket_id=data;
 })
 
 socket.on('updatePlayers',function(data){
	 players = data;
	 
 })
 
 socket.on('updateVar',function(data){
	 //dir=data.dir;
	 PAUSE=data.pause;
 })
 
 
 canva.on('mousemove',function(e){
	    e.preventDefault();
	    if(!PAUSE){
		    socket.emit('movePlayer',{
	            'x': e.pageX-canvas.offsetParent.offsetLeft,
	            'y': e.pageY-canvas.offsetParent.offsetTop
	            
	        });
	    }
	   
 });
 run();
}

function run(){
 setTimeout(run,50);
 game();
 paint(ctx);
}



function updateBall() {
    radians = angle * Math.PI/ 180;
    xmove = Math.cos(radians) * speed;
    ymove = Math.sin(radians) * speed;
 }

function game(){
 if(!PAUSE){
  	 
 ball.x += xmove;
 ball.y += ymove;

  //rebote con el jugador (version de prueba hay q corregir)
	 
	 for(var p in players){
		 if(ball.y<=players[p].y && ball.y+10>=players[p].y && (ball.x>=players[p].x && ball.x<=players[p].x+20)){
			 
			 angle = 360 - angle;
			 console.log(angle);
		     updateBall();
			 
		  }
		 
	 }
	 
	  
    //rebote con las paredes
	 if (ball.x > canvas.width || ball.x < 0 ) {
	        angle = 180 - angle;
	        updateBall();
	     } else if (ball.y > canvas.height || ball.y < 0) {
	        angle = 360 - angle;
	        updateBall();
	     }
  
 
  
}
 
 
 
  
 // Pause/Unpause (letra "p")
 if(lastKey==80){
  PAUSE=!PAUSE;
  lastKey=null;
 }
 
 socket.emit('updateVar',{'pause':PAUSE});
}

function drawPlayers(ctx){
	var i=0;
	for(var p in players){
		
		ctx.beginPath(); 
		 ctx.lineWidth="5";
		 ctx.strokeStyle=colors[i]; 
		 ctx.moveTo(players[p].x,players[p].y);
		 ctx.lineTo(players[p].x+20,players[p].y);
		 ctx.stroke();
		 
		 if(i<colors.length-1)
			 ++i;
	}
	 
}

function paint(ctx){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 
 ctx.beginPath();
 ctx.arc(ball.x,ball.y,5,0,Math.PI*2,true);
 ;
 ctx.fillStyle='#660000';
 ctx.fill();
 ctx.closePath();
 
 drawPlayers(ctx);
 
 ctx.fillStyle='#ff0000';
 
 if(PAUSE)
  ctx.fillText('PAUSE',140,75);
}


document.addEventListener('keydown',function(evt){
	
 lastKey=evt.keyCode;

},false);