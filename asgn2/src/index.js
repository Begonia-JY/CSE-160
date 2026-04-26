import { initShaders } from "../lib/cuon-utils.js";
import { Matrix4 } from "../lib/cuon-matrix.js";
import Cube from "./Cube.js";

let canvas;
let gl;
let cube;

let aPosition;
let uModelMatrix;
let uGlobalRotationMatrix;
let uFragColor;

// ===== var =====
let gAnimalGlobalRotation = 0;
let gUpperArmAngle = 0;
let gForearmAngle = 0;
let gClawAngle = 0;

let gAnimationOn = false;
let gStartTime = performance.now() / 1000;
let gSeconds = 0;

let gLastTime = performance.now();
let gFrameCount = 0;

// ===== SHADER =====
const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  uniform mat4 uModelMatrix;
  uniform mat4 uGlobalRotationMatrix;

  void main() {
    gl_Position = uGlobalRotationMatrix * uModelMatrix * aPosition;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 uFragColor;

  void main() {
    gl_FragColor = uFragColor;
  }
`;

// ===== main =====
function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.log("WebGL failed");
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Shader init failed");
    return;
  }

  // var
  aPosition = gl.getAttribLocation(gl.program, "aPosition");
  uModelMatrix = gl.getUniformLocation(gl.program, "uModelMatrix");
  uGlobalRotationMatrix = gl.getUniformLocation(gl.program, "uGlobalRotationMatrix");
  uFragColor = gl.getUniformLocation(gl.program, "uFragColor");

  // 3D
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.7, 0.9, 1.0, 1.0);

  cube = new Cube(gl);

  addActionsForHtmlUI();

  requestAnimationFrame(tick);
}

// ===== UI =====
function addActionsForHtmlUI() {
  document.getElementById("globalRotate").addEventListener("input", function () {
    gAnimalGlobalRotation = Number(this.value);
  });

  document.getElementById("upperArm").addEventListener("input", function () {
    gUpperArmAngle = Number(this.value);
  });

  document.getElementById("forearm").addEventListener("input", function () {
    gForearmAngle = Number(this.value);
  });

  document.getElementById("animationOn").onclick = () => (gAnimationOn = true);
  document.getElementById("animationOff").onclick = () => (gAnimationOn = false);
}

// ===== animation =====
function tick() {
  gSeconds = performance.now() / 1000 - gStartTime;

  updateAnimationAngles();
  renderScene();
  updateFPS();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (gAnimationOn) {
    gUpperArmAngle = 25 * Math.sin(gSeconds * 2);      // left down upper
    gForearmAngle = 35 * Math.sin(gSeconds * 2 + 1);   // left down lower
    gClawAngle = 15 * Math.sin(gSeconds * 4);
  }
}

// ===== FPS =====
function updateFPS() {
  gFrameCount++;
  const now = performance.now();

  if (now - gLastTime > 1000) {
    document.getElementById("fps").innerText = "FPS: " + gFrameCount;
    gFrameCount = 0;
    gLastTime = now;
  }
}

// ===== cube =====
function drawCube(matrix, color) {
  cube.render(matrix, color, aPosition, uModelMatrix, uFragColor);
}

// ===== sloth =====
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const globalRot = new Matrix4();
  globalRot.rotate(180,0,1,0);
  globalRot.rotate(gAnimalGlobalRotation, 0, 1, 0);
  gl.uniformMatrix4fv(uGlobalRotationMatrix, false, globalRot.elements);

  const body = [0.60, 0.60, 0.50, 1];
  const face = [0.90, 0.85, 0.75, 1];
  const dark = [0.20, 0.18, 0.15, 1];
  const claw = [0.85, 0.80, 0.70, 1];
  const branch = [0.32, 0.18, 0.08, 1];

  let m;
  // ===== fixed tree branch =====
  m = new Matrix4();
  m.translate(0, 0.95, 0);
  m.rotate(-12, 0, 0, 1);
  m.scale(3.4, 0.14, 0.14);
  drawCube(m, branch);

  // smaller branch behind
  m = new Matrix4();
  m.translate(0.75, 1.05, -0.05);
  m.rotate(25, 0, 0, 1);
  m.scale(1.2, 0.09, 0.09);
  drawCube(m, branch);

  // body swing animation
  let bodySwing = 0;
  let headSwing = 0;
  let armSwing = 0;

  if (gAnimationOn) {
    bodySwing = 5 * Math.sin(gSeconds * 1.5);
    headSwing = 8 * Math.sin(gSeconds * 2.0);
    armSwing = 10 * Math.sin(gSeconds * 2.2);
  }

  // ===== sloth body, hanging under branch =====
  let bodyBase = new Matrix4();
  bodyBase.translate(-0.25, 0.05, 0);
  bodyBase.rotate(bodySwing, 0, 0, 1);

  let bodyDraw = new Matrix4(bodyBase);
  bodyDraw.scale(0.99, 0.65, 0.42);
  drawCube(bodyDraw, body);

  // ===== head, round-ish cube face on right side =====
  let headBase = new Matrix4(bodyBase);
  headBase.translate(0.58, 0.18, 0);
  headBase.rotate(headSwing, 0, 0, 1);

  let headDraw = new Matrix4(headBase);
  headDraw.scale(0.52, 0.48, 0.42);
  drawCube(headDraw, body);

  let faceDraw = new Matrix4(headBase);
  faceDraw.translate(0, 0, 0.25);
  faceDraw.scale(0.42, 0.34, 0.08);
  drawCube(faceDraw, face);

  // eyes
  let eye = new Matrix4(headBase);
  eye.translate(-0.12, 0.08, 0.31);
  eye.scale(0.07, 0.07, 0.04);
  drawCube(eye, dark);

  eye = new Matrix4(headBase);
  eye.translate(0.12, 0.08, 0.31);
  eye.scale(0.07, 0.07, 0.04);
  drawCube(eye, dark);

  // nose
  m = new Matrix4(headBase);
  m.translate(0, -0.02, 0.32);
  m.scale(0.1, 0.07, 0.04);
  drawCube(m, dark);

  // mouth
  m = new Matrix4(headBase);
  m.translate(0, -0.1, 0.32);
  m.scale(0.15, 0.05, 0.04);
  drawCube(m, dark);

  // dark eye patches
  m = new Matrix4(headBase);
  m.translate(-0.14, 0.04, 0.28);
  m.rotate(20, 0, 0, 1);
  m.scale(0.16, 0.09, 0.03);
  drawCube(m, dark);

  m = new Matrix4(headBase);
  m.translate(0.14, 0.04, 0.28);
  m.rotate(-20, 0, 0, 1);
  m.scale(0.16, 0.09, 0.03);
  drawCube(m, dark);

  // ===== left hanging arm: upper -> forearm -> claw =====
  let leftUpper = new Matrix4(bodyBase);
  leftUpper.translate(-0.48, 0.25, 0);
  leftUpper.rotate(-105, 0, 0, 1);

  let leftUpperDraw = new Matrix4(leftUpper);
  leftUpperDraw.translate(-0.28, 0.06, 0);
  leftUpperDraw.scale(0.56, 0.13, 0.13);
  drawCube(leftUpperDraw, body);

  let leftFore = new Matrix4(leftUpper);
  leftFore.translate(-0.56, 0.05, 0);
  leftFore.rotate(- 25, 0, 0, 1);

  let leftForeDraw = new Matrix4(leftFore);
  leftForeDraw.translate(-0.28, 0, 0);
  leftForeDraw.scale(0.55, 0.12, 0.12);
  drawCube(leftForeDraw, body);

  let leftClaw = new Matrix4(leftFore);
  leftClaw.translate(-0.58, 0, 0);
  leftClaw.rotate(gClawAngle, 0, 0, 1);

  let leftClawDraw = new Matrix4(leftClaw);
  leftClawDraw.scale(0.22, 0.06, 0.06);
  drawCube(leftClawDraw, claw);

  // ===== right arm grabbing branch =====
  let rightUpper = new Matrix4(bodyBase);
  rightUpper.translate(0.20, 0.45, 0);
  rightUpper.rotate(85, 0, 0, 1);

  let rightUpperDraw = new Matrix4(rightUpper);
  rightUpperDraw.translate(0.2, 0, 0);
  rightUpperDraw.scale(0.70, 0.12, 0.12);
  drawCube(rightUpperDraw, body);

  let rightFore = new Matrix4(rightUpper);
  rightFore.translate(0.50, 0, 0);
  rightFore.rotate(20, 0, 0, 1);

  let rightForeDraw = new Matrix4(rightFore);
  rightForeDraw.translate(0.22, 0, 0);
  rightForeDraw.scale(0.45, 0.11, 0.11);
  drawCube(rightForeDraw, body);

  let rightClaw = new Matrix4(rightFore);
  rightClaw.translate(0.45, 0, 0);

  let rightClawDraw = new Matrix4(rightClaw);
  rightClawDraw.scale(0.20, 0.06, 0.06);
  drawCube(rightClawDraw, claw);

  // ===== small legs hanging below body =====
  // ===== LEFT DOWN LIMB: upper -> lower -> claw =====
// slider upperArm controls first joint
// slider forearm controls second joint

let leftDownUpper = new Matrix4(bodyBase);

// attach point on lower-left body
leftDownUpper.translate(-0.30, -0.30, 0);

// first joint
leftDownUpper.rotate(-105 + gUpperArmAngle, 0, 0, 1);

// draw upper segment
let leftDownUpperDraw = new Matrix4(leftDownUpper);
leftDownUpperDraw.translate(0.28, 0, 0);
leftDownUpperDraw.scale(0.56, 0.12, 0.12);
drawCube(leftDownUpperDraw, body);

// second joint starts at end of upper segment
let leftDownLower = new Matrix4(leftDownUpper);
leftDownLower.translate(0.56, 0, 0);

// second joint
leftDownLower.rotate(35 + gForearmAngle, 0, 0, 1);

// draw lower segment
let leftDownLowerDraw = new Matrix4(leftDownLower);
leftDownLowerDraw.translate(0.25, 0, 0);
leftDownLowerDraw.scale(0.50, 0.10, 0.10);
drawCube(leftDownLowerDraw, body);

// claw follows lower segment
let leftDownClaw = new Matrix4(leftDownLower);
leftDownClaw.translate(0.52, 0, 0);
leftDownClaw.rotate(gClawAngle, 0, 0, 1);

let leftDownClawDraw = new Matrix4(leftDownClaw);
leftDownClawDraw.scale(0.20, 0.06, 0.06);

drawCube(leftDownClawDraw, claw);
  //。。。。。。。
  m = new Matrix4(bodyBase);
  m.translate(0.18, -0.42, 0);
  m.rotate(-115, 0, 0, 1);
  m.scale(1.2, 0.12, 0.12);
  drawCube(m, body);

  // right claws
  m = new Matrix4(bodyBase);
  m.translate(-0.1, -0.99, 0);
  m.scale(0.1, 0.06, 0.06);
  m.rotate(-115, 0, 0, 1)
  drawCube(m, claw);
}

main();