import { initShaders } from "../lib/cuon-utils.js";
import { Matrix4 } from "../lib/cuon-matrix.js";
import Cube from "./Cube.js";
import Sphere from "./Sphere.js";
import OBJModel from "./OBJModel.js";
import Camera from "./Camera.js";

let canvas, gl, cube, sphere, objModel, camera;
let aPosition, aUV, aNormal;
let uModelMatrix, uNormalMatrix, uViewMatrix, uProjectionMatrix, uWhichTexture, uBaseColor;
let uLightPos, uCameraPos, uLightOn, uNormalOn, uSpotLightOn, uSpotLightPos, uSpotDirection, uMaterialType;
let uSampler0, uSampler1, uSampler2, uSampler3;

let keys = {};
let gLastTime = performance.now();
let gFrameCount = 0;
let gameWon = false;
let g_seconds = 0;
let g_startTime = performance.now() / 1000.0;

// Main warm sun / point light. Slider changes this location.
let g_lightPos = [7, 8, 6];
let g_lightOn = true;
let g_normalOn = false;
let g_spotLightOn = false;
let g_spotLightPos = [12, 5, 8];
let g_spotDirection = [0, -0.7, 0.7];
let g_lightCenterX = 8;
let g_lightCenterZ = 8;

const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  attribute vec2 aUV;
  attribute vec3 aNormal;

  varying vec2 vUV;
  varying vec3 vNormal;
  varying vec3 vVertPos;

  uniform mat4 uModelMatrix;
  uniform mat4 uNormalMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    vec4 worldPos = uModelMatrix * aPosition;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
    vUV = aUV;
    vVertPos = worldPos.xyz;
    // Important: normal vectors use 0.0, not 1.0, so translation does not affect normals.
    vNormal = normalize(vec3(uNormalMatrix * vec4(aNormal, 0.0)));
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 vUV;
  varying vec3 vNormal;
  varying vec3 vVertPos;

  uniform sampler2D uSampler0;
  uniform sampler2D uSampler1;
  uniform sampler2D uSampler2;
  uniform sampler2D uSampler3;

  uniform int uWhichTexture;
  uniform int uMaterialType;
  uniform vec4 uBaseColor;

  uniform vec3 uLightPos;
  uniform vec3 uCameraPos;
  uniform vec3 uSpotLightPos;
  uniform vec3 uSpotDirection;

  uniform bool uLightOn;
  uniform bool uNormalOn;
  uniform bool uSpotLightOn;

  vec4 getBaseColor() {
    if (uWhichTexture == -1) {
      return uBaseColor;
    } else if (uWhichTexture == 0) {
      return texture2D(uSampler0, vUV);
    } else if (uWhichTexture == 1) {
      return texture2D(uSampler1, vUV);
    } else if (uWhichTexture == 2) {
      return texture2D(uSampler2, vUV);
    } else if (uWhichTexture == 3) {
      return texture2D(uSampler3, vUV);
    }
    return vec4(1.0, 0.0, 1.0, 1.0);
  }

  void main() {
    // Material 1 = sunset sky gradient. This is unlit.
    if (uMaterialType == 1) {
      float h = clamp((vVertPos.y + 25.0) / 80.0, 0.0, 1.0);
      vec3 bottom = vec3(1.0, 0.58, 0.28);
      vec3 middle = vec3(0.95, 0.70, 0.50);
      vec3 top = vec3(0.35, 0.45, 0.78);
      vec3 sky = mix(bottom, middle, smoothstep(0.0, 0.45, h));
      sky = mix(sky, top, smoothstep(0.45, 1.0, h));

      vec3 sunDir = normalize(uLightPos);
      float glow = pow(max(dot(normalize(vVertPos), sunDir), 0.0), 35.0);
      sky += vec3(1.0, 0.78, 0.35) * glow * 1.3;
      gl_FragColor = vec4(sky, 1.0);
      return;
    }

    vec4 baseColor = getBaseColor();

    // Material 2 = sun / light marker. This is unlit and bright.
    if (uMaterialType == 2) {
      gl_FragColor = baseColor;
      return;
    }

    vec3 N = normalize(vNormal);

    if (uNormalOn) {
      gl_FragColor = vec4((N + 1.0) / 2.0, 1.0);
      return;
    }

    if (!uLightOn) {
      gl_FragColor = baseColor;
      return;
    }

    vec3 V = normalize(uCameraPos - vVertPos);

    // Point light / sun-like warm light.
    vec3 L = normalize(uLightPos - vVertPos);
    float nDotL = max(dot(N, L), 0.0);
    vec3 ambient = 0.18 * baseColor.rgb;
    vec3 diffuse = 1.15 * nDotL * baseColor.rgb;
    vec3 R = reflect(-L, N);
    float spec = pow(max(dot(V, R), 0.0), 24.0);
    vec3 specular = vec3(1.0, 0.86, 0.55) * spec * 0.55;

    vec3 color = ambient + diffuse + specular;

    // Optional spotlight. It adds an extra focused cone of light.
    if (uSpotLightOn) {
      vec3 SL = normalize(uSpotLightPos - vVertPos);
      vec3 spotToPoint = normalize(vVertPos - uSpotLightPos);
      float theta = dot(spotToPoint, normalize(uSpotDirection));
      float edge = smoothstep(0.82, 0.94, theta);
      float sDotL = max(dot(N, SL), 0.0);
      color += edge * sDotL * baseColor.rgb * vec3(1.0, 0.92, 0.72);
    }

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, baseColor.a);
  }
`;

const mazeRows = [
  "################################",
  "#....#....#....#.........#.....#",
  "#....#....#....#.........#.....#",
  "#....#....#..............#.....#",
  "#############...#####...########",
  "#....#....#.........#....#.....#",
  "#....#....#....#....#....#.....#",
  "#....#....#....#....#....#.....#",
  "#####.#######..##########...####",
  "#.........#....#....#..........#",
  "#.........#....#....#..........#",
  "#.........#....#....#....#.....#",
  "#####...#.#.####################",
  "#.........#....#.........#.....#",
  "#....#....#....#.........#.....#",
  "#....#.........#...............#",
  "##########.#########....#...####",
  "#....#.........#...............#",
  "#....#....#....#.........#.....#",
  "#....#....#....#....#....#.....#",
  "######..#########...#...########",
  "#....#.........#....#....#.....#",
  "#....#..............#....#.....#",
  "#....#..............#..........#",
  "#########.#.###.#...#####.######",
  "#....#....#....#....#..........#",
  "#....#....#....#....#..........#",
  "#....#....#....#....#..........#",
  "#...#####################.....##",
  "#....#....#....#....#..........#",
  "#....#....#....#....#....#.....#",
  "################################",
];

let g_map = mazeRows.map(row =>
  row.split("").map(ch => ch === "#" ? 2 : 0)
);

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

  aPosition = gl.getAttribLocation(gl.program, "aPosition");
  aUV = gl.getAttribLocation(gl.program, "aUV");
  aNormal = gl.getAttribLocation(gl.program, "aNormal");

  uModelMatrix = gl.getUniformLocation(gl.program, "uModelMatrix");
  uNormalMatrix = gl.getUniformLocation(gl.program, "uNormalMatrix");
  uViewMatrix = gl.getUniformLocation(gl.program, "uViewMatrix");
  uProjectionMatrix = gl.getUniformLocation(gl.program, "uProjectionMatrix");
  uWhichTexture = gl.getUniformLocation(gl.program, "uWhichTexture");
  uBaseColor = gl.getUniformLocation(gl.program, "uBaseColor");
  uLightPos = gl.getUniformLocation(gl.program, "uLightPos");
  uCameraPos = gl.getUniformLocation(gl.program, "uCameraPos");
  uLightOn = gl.getUniformLocation(gl.program, "uLightOn");
  uNormalOn = gl.getUniformLocation(gl.program, "uNormalOn");
  uSpotLightOn = gl.getUniformLocation(gl.program, "uSpotLightOn");
  uSpotLightPos = gl.getUniformLocation(gl.program, "uSpotLightPos");
  uSpotDirection = gl.getUniformLocation(gl.program, "uSpotDirection");
  uMaterialType = gl.getUniformLocation(gl.program, "uMaterialType");

  uSampler0 = gl.getUniformLocation(gl.program, "uSampler0");
  uSampler1 = gl.getUniformLocation(gl.program, "uSampler1");
  uSampler2 = gl.getUniformLocation(gl.program, "uSampler2");
  uSampler3 = gl.getUniformLocation(gl.program, "uSampler3");

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.6, 0.8, 1.0, 1.0);

  cube = new Cube(gl);
  sphere = new Sphere(gl);
  objModel = new OBJModel(gl, "../lib/cube.obj");
  camera = new Camera(canvas);

  initTextures();
  addKeyboardControls();
  addMouseControls();
  addUIControls();

  requestAnimationFrame(tick);
}

function initTextures() {
  loadTexture("./texture/dirt.png", 0, uSampler0);
  loadTexture("./texture/grass.png", 1, uSampler1);
  loadTexture("./texture/sky.png", 2, uSampler2);
  loadTexture("./texture/stone.png", 3, uSampler3);
}

function loadTexture(path, textureUnit, sampler) {
  let image = new Image();

  image.onload = function () {
    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(sampler, textureUnit);
  };

  image.src = path;
}

function addKeyboardControls() {
  window.addEventListener("keydown", function (ev) {
    let key = ev.key.toLowerCase();
    keys[key] = true;

    // optional backup controls
    if (!keys[key]) {
      if (key === "f") addBlock();
      if (key === "g") deleteBlock();
    }
    keys[key] = true;
    ev.preventDefault();
  });

  window.addEventListener("keyup", function (ev) {
    keys[ev.key.toLowerCase()] = false;
    ev.preventDefault();
  });
}

function addMouseControls() {
  canvas.onclick = function () {
    canvas.requestPointerLock();
  };

  document.addEventListener("mousemove", function (ev) {
    if (document.pointerLockElement === canvas) {
      camera.mouseLook(ev.movementX * 0.04, ev.movementY * 0.04);
    }
  });

  canvas.addEventListener("mousedown", function (ev) {
    if (document.pointerLockElement !== canvas) return;

    if (ev.button === 0) {
      addBlock();
    }

    if (ev.button === 2) {
      deleteBlock();
    }
  });

  canvas.addEventListener("contextmenu", function (ev) {
    ev.preventDefault();
  });
}


function addUIControls() {
  document.getElementById("lightButton").onclick = function () {
    g_lightOn = !g_lightOn;
  };

  document.getElementById("normalButton").onclick = function () {
    g_normalOn = !g_normalOn;
  };

  document.getElementById("spotButton").onclick = function () {
    g_spotLightOn = !g_spotLightOn;
  };

  document.getElementById("lightX").oninput = function () {
    g_lightCenterX = Number(this.value);
  };

  document.getElementById("lightY").oninput = function () {
    g_lightPos[1] = Number(this.value);
  };

  document.getElementById("lightZ").oninput = function () {
    g_lightCenterZ = Number(this.value);
  };
}

function updateMovement() {
  let oldEye = [...camera.eye.elements];
  let oldAt = [...camera.at.elements];

  if (keys["w"]) camera.moveForward();
  if (keys["s"]) camera.moveBackwards();
  if (keys["a"]) camera.moveLeft();
  if (keys["d"]) camera.moveRight();
  if (keys["q"]) camera.panLeft();
  if (keys["e"]) camera.panRight();

  if (isWallAt(camera.eye.elements[0], camera.eye.elements[2])) {
    camera.eye.elements[0] = oldEye[0];
    camera.eye.elements[1] = oldEye[1];
    camera.eye.elements[2] = oldEye[2];

    camera.at.elements[0] = oldAt[0];
    camera.at.elements[1] = oldAt[1];
    camera.at.elements[2] = oldAt[2];

    camera.updateView();
  }

  checkWin();
}

function worldToMap(x, z) {
  let offset = g_map.length / 2;
  let mapX = Math.floor(x + offset);
  let mapZ = Math.floor(z + offset);
  return [mapX, mapZ];
}

function isWallAt(x, z) {
  const radius = 0.60;

  let points = [
    [x, z],
    [x + radius, z],
    [x - radius, z],
    [x, z + radius],
    [x, z - radius],
  ];

  for (let p of points) {
    let [mapX, mapZ] = worldToMap(p[0], p[1]);

    if (mapX < 0 || mapZ < 0 || mapX >= g_map.length || mapZ >= g_map[0].length) {
      return true;
    }

    if (g_map[mapX][mapZ] > 0) {
      return true;
    }
  }

  return false;
}

function raycastBlock(maxDistance = 8) {

  let fx = camera.at.elements[0] - camera.eye.elements[0];
  let fy = camera.at.elements[1] - camera.eye.elements[1];
  let fz = camera.at.elements[2] - camera.eye.elements[2];

  let len = Math.sqrt(fx * fx + fy * fy + fz * fz);

  fx /= len;
  fy /= len;
  fz /= len;

  let lastEmpty = null;

  for (let d = 0; d < maxDistance; d += 0.1) {

    let x = camera.eye.elements[0] + fx * d;
    let z = camera.eye.elements[2] + fz * d;

    let [mapX, mapZ] = worldToMap(x, z);

    if (
      mapX < 0 ||
      mapZ < 0 ||
      mapX >= g_map.length ||
      mapZ >= g_map[0].length
    ) {
      return null;
    }

    if (g_map[mapX][mapZ] > 0) {
      return {
        hit: [mapX, mapZ],
        empty: lastEmpty
      };
    }

    lastEmpty = [mapX, mapZ];
  }

  return null;
}

function addBlock() {

  let result = raycastBlock();
  if (!result || !result.empty) return;
  let [x, z] = result.empty;

  if (
    x > 0 &&
    z > 0 &&
    x < g_map.length - 1 &&
    z < g_map[0].length - 1
  ) {
    if (g_map[x][z] < 4) {
      g_map[x][z]++;
    }
  }
}

function deleteBlock() {

  let result = raycastBlock();
  if (!result) return;
  let [x, z] = result.hit;

  if (
    x > 0 &&
    z > 0 &&
    x < g_map.length - 1 &&
    z < g_map[0].length - 1
  ) {
    g_map[x][z]--;
  }
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  g_lightPos[0] = g_lightCenterX + Math.cos(g_seconds * 2.0) * 3;
  g_lightPos[2] = g_lightCenterZ + Math.sin(g_seconds * 2.0) * 3;

  updateMovement();
  renderScene();
  updateFPS();
  requestAnimationFrame(tick);
}

function drawCube(matrix, textureNum) {
  gl.uniform1i(uMaterialType, 0);
  cube.render(matrix, textureNum, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);
}

function drawColorCube(matrix, color) {
  gl.uniform1i(uMaterialType, 0);
  gl.uniform4fv(uBaseColor, color);
  cube.render(matrix, -1, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);
}

function drawColorSphere(matrix, color) {
  gl.uniform1i(uMaterialType, 0);
  gl.uniform4fv(uBaseColor, color);
  sphere.render(matrix, -1, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(uViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(uProjectionMatrix, false, camera.projectionMatrix.elements);

  gl.uniform3fv(uLightPos, g_lightPos);
  gl.uniform3fv(uCameraPos, camera.eye.elements);
  gl.uniform1i(uLightOn, g_lightOn);
  gl.uniform1i(uNormalOn, g_normalOn);
  gl.uniform1i(uSpotLightOn, g_spotLightOn);
  gl.uniform3fv(uSpotLightPos, g_spotLightPos);
  gl.uniform3fv(uSpotDirection, g_spotDirection);

  drawSky();
  drawGround();
  drawWalls();
  drawSlothTemple();
  drawLightingTestSphere();
  drawOBJModel();
  drawSunAndLightMarker();
}

function drawSky() {
  gl.uniform1i(uMaterialType, 1);
  gl.uniform1i(uLightOn, false);

  let m = new Matrix4();
  m.scale(100, 100, 100);
  cube.render(m, -1, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);

  gl.uniform1i(uMaterialType, 0);
  gl.uniform1i(uLightOn, g_lightOn);
}

function drawGround() {
  let m = new Matrix4();
  m.translate(0, -0.55, 0);
  m.scale(40, 0.1, 40);
  drawCube(m, 1);
}

function drawWalls() {
  let offset = g_map.length / 2;

  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[x].length; z++) {
      let height = g_map[x][z];

      for (let y = 0; y < height; y++) {
        let m = new Matrix4();
        m.translate(x - offset, y, z - offset);

        if (height >= 3) {
          drawCube(m, 3);
        } else {
          drawCube(m, 0);
        }
      }
    }
  }
}

function drawSlothTemple() {
  const baseX = 12;
  const baseZ = 12;

  const body = [0.60, 0.60, 0.50, 1];
  const face = [0.90, 0.85, 0.75, 1];
  const dark = [0.20, 0.18, 0.15, 1];
  const claw = [0.85, 0.80, 0.70, 1];
  const branch = [0.32, 0.18, 0.08, 1];

  let m;

  // stone temple base
  m = new Matrix4();
  m.translate(baseX, -0.45, baseZ);
  m.scale(6, 0.2, 6);
  drawCube(m, 3);

  // pillars
  let pillars = [
    [baseX - 3, baseZ - 3],
    [baseX + 3, baseZ - 3],
    [baseX - 3, baseZ + 3],
    [baseX + 3, baseZ + 3],
  ];

  for (let p of pillars) {
    for (let y = 0; y < 4; y++) {
      m = new Matrix4();
      m.translate(p[0], y, p[1]);
      drawCube(m, 3);
    }
  }

  // vertical tree trunk on the LEFT side
m = new Matrix4();
m.translate(baseX - -2, 1.8, baseZ - 0.35);
m.rotate(-4, 0, 0, 1);
m.scale(0.75, 4.8, 0.75);
drawColorCube(m, branch);

// lower root / ground connection
m = new Matrix4();
m.translate(baseX - -2, -0.25, baseZ - 0.35);
m.rotate(18, 0, 0, 1);
m.scale(1.0, 0.35, 0.8);
drawColorCube(m, branch);

// diagonal support from ground to branch
m = new Matrix4();
m.translate(baseX - -2.5, 2.75, baseZ - 0.35);
m.rotate(28, 0, 0, 1);
m.scale(0.42, 3.4, 0.42);
drawColorCube(m, branch);

// big horizontal branch, lower than before
m = new Matrix4();
m.translate(baseX - 1.3, 3.75, baseZ);
m.rotate(-3, 0, 0, 1);
m.scale(6.8, 0.26, 0.26);
drawColorCube(m, branch);

// small branch decoration on left
m = new Matrix4();
m.translate(baseX - 4.0, 3.95, baseZ);
m.rotate(35, 0, 0, 1);
m.scale(1.5, 0.18, 0.18);
drawColorCube(m, branch);

  // sloth body base
  let bodyBase = new Matrix4();
  bodyBase.translate(baseX - 0.5, 1.85, baseZ);
  bodyBase.rotate(180, 0, 1, 0);

  // body
  m = new Matrix4(bodyBase);
  m.scale(1.8, 1.2, 0.8);
  drawColorCube(m, body);

  // head
  let headBase = new Matrix4(bodyBase);
  headBase.translate(1.25, 0.35, 0);

  m = new Matrix4(headBase);
  m.scale(0.95, 0.85, 0.8);
  drawColorCube(m, body);

  // face
  m = new Matrix4(headBase);
  m.translate(0, 0, 0.48);
  m.scale(0.72, 0.58, 0.12);
  drawColorCube(m, face);

  // eyes
  m = new Matrix4(headBase);
  m.translate(-0.22, 0.14, 0.58);
  m.scale(0.12, 0.12, 0.08);
  drawColorCube(m, dark);

  m = new Matrix4(headBase);
  m.translate(0.22, 0.14, 0.58);
  m.scale(0.12, 0.12, 0.08);
  drawColorCube(m, dark);

  // nose
  m = new Matrix4(headBase);
  m.translate(0, -0.04, 0.60);
  m.scale(0.18, 0.12, 0.08);
  drawColorCube(m, dark);

  // mouth
  m = new Matrix4(headBase);
  m.translate(0, -0.20, 0.60);
  m.scale(0.28, 0.07, 0.08);
  drawColorCube(m, dark);

  // eye patches
  m = new Matrix4(headBase);
  m.translate(-0.25, 0.05, 0.54);
  m.rotate(20, 0, 0, 1);
  m.scale(0.32, 0.16, 0.06);
  drawColorCube(m, dark);

  m = new Matrix4(headBase);
  m.translate(0.25, 0.05, 0.54);
  m.rotate(-20, 0, 0, 1);
  m.scale(0.32, 0.16, 0.06);
  drawColorCube(m, dark);

  // left arm
  m = new Matrix4(bodyBase);
  m.translate(-0.9, 0.45, 0);
  m.rotate(-105, 0, 0, 1);
  m.scale(1.1, 0.22, 0.22);
  drawColorCube(m, body);

  m = new Matrix4(bodyBase);
  m.translate(-1.25, -0.35, 0);
  m.rotate(-45, 0, 0, 1);
  m.scale(0.9, 0.2, 0.2);
  drawColorCube(m, body);

  m = new Matrix4(bodyBase);
  m.translate(-1.7, -0.75, 0);
  m.scale(0.35, 0.10, 0.10);
  drawColorCube(m, claw);

  // right arm
  m = new Matrix4(bodyBase);
  m.translate(0.35, 1.0, 0);
  m.rotate(80, 0, 0, 1);
  m.scale(1.2, 0.22, 0.22);
  drawColorCube(m, body);

  m = new Matrix4(bodyBase);
  m.translate(0.9, 1.65, 0);
  m.rotate(15, 0, 0, 1);
  m.scale(0.8, 0.2, 0.2);
  drawColorCube(m, body);

  m = new Matrix4(bodyBase);
  m.translate(1.35, 1.75, 0);
  m.scale(0.35, 0.10, 0.10);
  drawColorCube(m, claw);

  // legs
  m = new Matrix4(bodyBase);
  m.translate(-0.45, -0.85, 0.2);
  m.rotate(-70, 0, 0, 1);
  m.scale(0.75, 0.22, 0.22);
  drawColorCube(m, body);

  m = new Matrix4(bodyBase);
  m.translate(0.45, -0.85, -0.2);
  m.rotate(-100, 0, 0, 1);
  m.scale(0.75, 0.22, 0.22);
  drawColorCube(m, body);
}


function drawLightingTestSphere() {
  let m = new Matrix4();
  m.translate(9.2, 0.35, 10.2);
  m.scale(1.2, 1.2, 1.2);
  drawColorSphere(m, [0.55, 0.58, 0.48, 1.0]);
}

function drawOBJModel() {
  if (!objModel) return;

  gl.uniform1i(uMaterialType, 0);
  gl.uniform4fv(uBaseColor, [0.2, 0.8, 1.0, 1.0]);

  let m = new Matrix4();
  m.translate(10.4, 0.45, 9.4);
  m.rotate(25, 0, 1, 0);
  m.scale(0.45, 0.45, 0.45);

  objModel.render(m, -1, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);
}

function drawSunAndLightMarker() {
  // Bright sun sphere in the sky.
  gl.uniform1i(uMaterialType, 2);
  gl.uniform4fv(uBaseColor, [1.0, 0.92, 0.35, 1.0]);

  let sun = new Matrix4();
  sun.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  sun.scale(0.45, 0.45, 0.45);
  sphere.render(sun, -1, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);

  // Required visual marker: a small cube at the exact light location.
  let marker = new Matrix4();
  marker.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  marker.scale(0.18, 0.18, 0.18);
  gl.uniform4fv(uBaseColor, [1.0, 1.0, 0.0, 1.0]);
  cube.render(marker, -1, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture);

  gl.uniform1i(uMaterialType, 0);
}

function checkWin() {
  if (gameWon) return;

  let dx = camera.eye.elements[0] - 12;
  let dz = camera.eye.elements[2] - 12;
  let dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 4) {
    gameWon = true;
    let game = document.getElementById("game");
    if (game) {
      game.innerText = "You found the Sloth Temple! You win!";
    }
  }
}

function updateFPS() {
  gFrameCount++;
  const now = performance.now();

  if (now - gLastTime > 1000) {
    document.getElementById("fps").innerText = "FPS: " + gFrameCount;
    gFrameCount = 0;
    gLastTime = now;
  }
}

main();