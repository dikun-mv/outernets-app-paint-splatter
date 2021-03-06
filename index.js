const controllerURL = 'http://outernets-app-paint-splatter-controller-dev.s3-website-us-west-2.amazonaws.com';
const serverURL = 'http://app-chat-room-server-dev.us-east-2.elasticbeanstalk.com';
let clients = 0;

function refresh(socket) {
	socket.disconnect();
	window.onload();
	noCanvas();
	setup();
}

function onConnect(socket) {
	clients++;
	socket.session.openedAt = Number(new Date());

	if (clients > 1) {
		document.getElementById("qr-code").innerHTML = "";
	}

	if (!socket.session.timer) {
		socket.session.timer = setTimeout(refresh.bind(null, socket), 30 * 1000);
	}
}

function onDisconnect(socket) {
	clients = 0;
	socket.session.closedAt = Number(new Date());

	clearTimeout(socket.session.timer);

	Outernets.sendMetrics([
		{
			name: 'session_duration',
			value: socket.session.closedAt - socket.session.openedAt
		},
		{
			name: 'number_of_splashes',
			value: numSplats
		},
		{
			name: 'number_of_colors',
			value: colors.length
		}
	]).then(refresh.bind(null, socket), refresh.bind(null, socket));
}

function onData(socket, data) {
	splatter(JSON.parse(data));

	if (socket.session.timer) {
		clearTimeout(socket.session.timer);
		socket.session.timer = setTimeout(onDisconnect.bind(null, socket), 30 * 1000);
	}

	Outernets.holdScheduler(10);
}

function connect(url) {
	const socket = io(url);

	socket.session = {
		id: uuidv1(),
		openedAt: null,
		closedAt: null,
		timer: null
	};

	socket.on('user-connected', onConnect.bind(null, socket));
	socket.on('user-disconnected', onDisconnect.bind(null, socket));
	socket.on('paint-splatter-control', onData.bind(null, socket));

	socket.emit('roomToJoin', socket.session.id);

	return socket;
}

let logo;
let logoRatio = 3952.0 / 697.0;
let logoW = window.innerWidth / 2;
let logoH = logoW / logoRatio;

let numSplats = 0;
let colors = [];

function splatter(data) {
	let offsetX, offsetY;

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

	colors = colors.reduce(
		(acc, color) => acc.includes(color) ? acc : acc.concat([color]),
		[`${data.colorH}:${data.colorS}:${data.colorL}`]
	);

	splatterPaint(offsetX, offsetY, data.colorH, data.colorS, data.colorL);
	splatterPaint(offsetX, offsetY, data.colorH, data.colorS, data.colorL);
}

function splatterPaint(offsetX, offsetY, h, s, l) {
	let xRadius = Math.random() * 40 + 40;
	let yRadius = Math.random() * 40 + 40;

	splatShape(.1, offsetX, offsetY, xRadius, yRadius, h, s, l);

	for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
		newXRadius = Math.random() * 8 + 3;
		newYRadius = Math.random() * 8 + 3;
		let range = 50;
		let newOffsetX, newOffsetY;
		let xDir = Math.random() > 0.5 ? 1 : -1;
		let yDir = Math.random() > 0.5 ? 1 : -1;
		newOffsetX = offsetX + 80 * (xDir) + Math.random() * range / 2
		newOffsetY = offsetY + 80 * (yDir) + Math.random() * range / 2;
		splatShape(.05, newOffsetX, newOffsetY, newXRadius, newYRadius, h, s, l);
	}

	image(logo, window.innerWidth / 2 - logoW / 2, window.innerHeight / 2 - logoH / 2, logoW, logoH);
	numSplats++;
}

function splatShape(noiseIncr, offsetX, offsetY, xRadius, yRadius, h, s, l) {
	let noiseStep = Math.random() * 100;

	beginShape();
	fill(h, s, l);
	stroke(0, 0, 0, 0);

	Math.random() > 0.5 ? xRadius *= 0.75 : yRadius *= 0.75;

	for (let degree = 0; degree < 360; degree += 8) {
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
	image(logo, window.innerWidth / 2 - logoW / 2, window.innerHeight / 2 - logoH / 2, logoW, logoH);
}

window.onload = () => {
	const socket = connect(serverURL);
	const qrcode = new QRCode(document.getElementById("qr-code"), `${controllerURL}/?${socket.session.id}`);

	document.getElementById("qr-code").style.left = (window.innerWidth / 2 - 100) + "px";
	document.getElementById("qr-code").style.top = (window.innerHeight / 2 + 100) + "px";
	document.getElementById("qr-code").style.visibility = "visible";
};
