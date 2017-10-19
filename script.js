//==============================================================================================
//WEBSOCKET STUFF
//==============================================================================================
var socket = io('http://app-chat-room-server-dev.us-east-2.elasticbeanstalk.com');
var roomToJoin = "app-paint-splatter";
console.log("joining room ..." + roomToJoin + "...");
socket.emit('roomToJoin', roomToJoin);

socket.on('paint-splatter-control', function(msg){
	console.log("message received " + msg);
	//document.body.innerHTML += "<p>"+msg+"</p>";
	let data = JSON.parse(msg);
	splatter(data);
	splatter(data);
});
//==============================================================================================
//END OF WEBSOCKET STUFF
//==============================================================================================

/*window.onload = function() {
	for (let i = 0; i < 20; i++) {
		splatterPaint(Math.random() * 360,100,50);
	}
}*/

var logo;
var logoRatio = 3952.0/697.0;
var logoW = window.innerWidth/2;
var logoH = logoW/logoRatio;
var numSplats = 0;

function splatter(data) {
	var offsetX, offsetY;
	if (data.axis == "z" && data.dir == 1) {
		offsetX = Math.random() * window.innerWidth;
		offsetY = Math.random() * window.innerHeight * 0.5;
	}
	if (data.axis == "x" && data.dir == 1) {
		offsetX = Math.random() * window.innerWidth * 0.5 + window.innerWidth * 0.5;
		offsetY = Math.random() * window.innerHeight;
	}
	if (data.axis == "z" && data.dir == -1) {
		offsetX = Math.random() * window.innerWidth;
		offsetY = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.5;
	}
	if (data.axis == "x" && data.dir == -1) {
		offsetX = Math.random() * window.innerWidth * 0.5;
		offsetY = Math.random() * window.innerHeight;
	}
	splatterPaint(offsetX, offsetY, data.colorH, data.colorS, data.colorL);
}

function splatterPaint(offsetX, offsetY, h,s,l) {

	let xRadius = Math.random() * 40 + 40; //40-80
	let yRadius = Math.random() * 40 + 40; //40-80

	splatShape(.1, offsetX, offsetY, xRadius, yRadius, h,s,l);

	for (let i = 0; i < 3+Math.floor(Math.random() * 5); i++) {
		newXRadius = Math.random() * 8 + 3;
		newYRadius = Math.random() * 8 + 3;
		let range = 50;
		var newOffsetX, newOffsetY;
		var xDir = Math.random() > 0.5 ? 1 : -1;
		var yDir = Math.random() > 0.5 ? 1 : -1;
		newOffsetX = offsetX + 80 * (xDir) + Math.random() * range/2
		newOffsetY = offsetY + 80 * (yDir) + Math.random() * range/2;
		splatShape(.05, newOffsetX, newOffsetY, newXRadius, newYRadius, h,s,l);
	}

	//blendMode(SCREEN);
	image(logo, window.innerWidth/2 - logoW/2, window.innerHeight/2 - logoH/2, logoW, logoH);
	numSplats++;
	console.log(numSplats);

	if (numSplats > 30) {
		document.getElementById("qr-code").style.visibility = "hidden";
	    document.getElementById("scan-to-play").style.visibility = "hidden";
	    document.getElementById("link").style.visibility = "hidden";
	}
}

function splatShape(noiseIncr, offsetX, offsetY, xRadius, yRadius, h,s,l) {

	var noiseStep = Math.random() * 100;

	beginShape();
	fill(h,s,l);
	//blendMode(BLEND);
	stroke(0,0,0,0);

	Math.random() > 0.5 ? xRadius*=0.75 : yRadius*=0.75;

	for(var degree = 0; degree < 360; degree += 8) {
		let x = offsetX + cos(radians(degree)) * xRadius + noise(noiseStep) * xRadius;
		let y = offsetY + sin(radians(degree)) * yRadius + noise(noiseStep) * yRadius;
		vertex(x, y);
		noiseStep += noiseIncr;
	}

	endShape();
}

function preload() {
  logo = loadImage("outernets-logo.png");
}

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	colorMode(HSL);
	noiseDetail(4, 0.75);
	noiseSeed(3);

	background(98);
	image(logo, window.innerWidth/2 - logoW/2, window.innerHeight/2 - logoH/2, logoW, logoH);
}