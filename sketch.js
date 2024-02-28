let noiseScale = 0.05;

let capture;
let poseNet;
let poses = [];
const cam_w = 640;
const cam_h = 480;
let path = [];

const options = {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: true,
  minConfidence: 0.85,
  maxPoseDetections: 2,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

function setup() {
  createCanvas(cam_w, cam_h);
  capture = createCapture(VIDEO);
  capture.size(cam_w, cam_h);
  poseNet = ml5.poseNet(capture, options, modelReady);
  poseNet.on("pose", function(results) {
    poses = results;
  });
  capture.hide();
}

function modelReady() {
  console.log("Model already loaded");
}

function draw() {
  background(25, 35, 45); // Set to dark background

  // Display video capture
  push();
  translate(width, 0);
  scale(-1, 1); // Mirror the video capture
  image(capture, 0, 0);
  pop();

  if (poses.length > 0) {
    updatePathWithRightHand(); // Update the path of the hand
  }

  // Apply turbulence effect on the path of the hand and draw it
  drawPathWithTurbulence();
}

function updatePathWithRightHand() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    let rightWrist = pose.rightWrist;
    // Add the new hand position to the path array
    if (rightWrist.confidence > 0.2) {
      path.push({x: rightWrist.x, y: rightWrist.y});
    }
    
    
    if (path.length > 1000) {
      path = [{ x: rightWrist.x, y: rightWrist.y }]; // Start a new line from the current point
    }
  }
}

function drawPathWithTurbulence() {
  for (let i = 1; i < path.length; i++) {
    let start = path[i - 1];
    let end = path[i];

    // For each line, generate a random color
    for (let index = 0; index < 3; index++) {
      // Generate a random color
      const r = random(255);
      const g = random(255);
      const b = random(255);

      // Set the stroke color
      stroke(r, g, b);
      strokeWeight(4 - index); // Slightly adjust the line width for differentiation

      // Calculate the offset for each line to avoid overlap
      let offset = map(index, 0, 2, -5, 5);

      // Apply turbulence effect
      const n = noise(start.x * noiseScale + offset, start.y * noiseScale + offset); // Offset makes the noise value slightly different
      const angle = n * TWO_PI * 4;
      const rSize = map(n, 0, 1, 10, 25); // Map size based on noise value

      push();
      translate((start.x + end.x) / 2 + offset, ((start.y + end.y) / 2 + offset)-100) ; // Apply offset
      rotate(angle); // Rotate
      line(-rSize, -rSize, rSize, rSize); // Draw line
      pop();
    }
  }
}

