function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  noiseDetail(4, 0.75);
  noiseSeed(3);

  background(30);
  var noiseStep = 0;

  translate(width/2, 100);
  beginShape();

  for(var degree = 0; degree < 360; degree += 2) {

    var x = cos(radians(degree)) * 40 + noise(noiseStep) * 40;
    var y = sin(radians(degree)) * 20 + noise(noiseStep) * 20;

    vertex(x, y);

    noiseStep += random() * .1
  }

  endShape();
}

function draw() {
  
}