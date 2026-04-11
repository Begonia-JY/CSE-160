// Vertex shader
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`;

// Fragment shader
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedSegments = 10;

let g_shapesList = [];

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {
        if (ev.buttons == 1) {
        click(ev);
        }
    };

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get WebGL context");
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get u_Size');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('pointButton').onclick = function() {
    g_selectedType = POINT;
  };

  document.getElementById('triButton').onclick = function() {
    g_selectedType = TRIANGLE;
  };

  document.getElementById('circleButton').onclick = function() {
    g_selectedType = CIRCLE;
  };

  document.getElementById('clearButton').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  };

  document.getElementById('pictureButton').onclick = function() {
    drawMyPicture();
  };

  document.getElementById('redSlide').addEventListener('input', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('input', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('input', function() {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById('sizeSlide').addEventListener('input', function() {
    g_selectedSize = Number(this.value);
  });

  document.getElementById('segmentSlide').addEventListener('input', function() {
    g_selectedSegments = Number(this.value);
  });
}

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let shape;
  if (g_selectedType == POINT) {
    shape = new Point();
  } else if (g_selectedType == TRIANGLE) {
    shape = new Triangle();
  } else {
    shape = new Circle();
    shape.segments = g_selectedSegments;
  }

  shape.position = [x, y];
  shape.color = [...g_selectedColor];
  shape.size = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();
  }
}

function drawTriangle(vertices) {
  let n = 3;

  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create buffer');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawMyPicture() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // helper
  function tri(color, vertices) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle(vertices);
  }

  // colors
  const white = [0.97, 0.97, 0.97, 1.0];
  const pink = [1.0, 0.75, 0.82, 1.0];
  const black = [0.08, 0.08, 0.08, 1.0];
  const orange = [1.0, 0.55, 0.18, 1.0];
  const green = [0.25, 0.75, 0.35, 1.0];
  const red = [0.9, 0.25, 0.3, 1.0];

  // left ear outer
  tri(white, [-0.42, 0.72, -0.32, 0.22, -0.22, 0.62]);
  tri(white, [-0.42, 0.72, -0.30, 0.82, -0.22, 0.62]);

  // left ear inner
  tri(pink, [-0.36, 0.68, -0.30, 0.28, -0.24, 0.58]);
  tri(pink, [-0.36, 0.68, -0.30, 0.76, -0.24, 0.58]);

  // right ear outer
  tri(white, [0.22, 0.62, 0.32, 0.22, 0.42, 0.72]);
  tri(white, [0.22, 0.62, 0.30, 0.82, 0.42, 0.72]);

  // right ear inner
  tri(pink, [0.24, 0.58, 0.30, 0.28, 0.36, 0.68]);
  tri(pink, [0.24, 0.58, 0.30, 0.76, 0.36, 0.68]);

  // C on left ear
  tri(red, [-0.34, 0.67, -0.26, 0.69, -0.24, 0.64]);
  tri(red, [-0.34, 0.67, -0.32, 0.62, -0.24, 0.64]);
  tri(red, [-0.36, 0.65, -0.32, 0.62, -0.33, 0.52]);
  tri(red, [-0.33, 0.52, -0.28, 0.55, -0.32, 0.62]);
  tri(red, [-0.34, 0.50, -0.26, 0.48, -0.24, 0.53]);
  tri(red, [-0.34, 0.50, -0.32, 0.55, -0.24, 0.53]);

  // L on right ear
  tri(red, [0.25, 0.68, 0.30, 0.68, 0.28, 0.50]);
  tri(red, [0.28, 0.50, 0.33, 0.50, 0.30, 0.68]);
  tri(red, [0.28, 0.50, 0.38, 0.50, 0.36, 0.45]);
  tri(red, [0.28, 0.50, 0.30, 0.45, 0.36, 0.45]);

  // head
  tri(white, [-0.30, 0.28, 0.30, 0.28, 0.00, 0.02]);
  tri(white, [-0.30, 0.28, -0.18, -0.18, 0.00, 0.02]);
  tri(white, [0.30, 0.28, 0.18, -0.18, 0.00, 0.02]);
  tri(white, [-0.18, -0.18, 0.18, -0.18, 0.00, 0.02]);

  // cheeks
  tri(pink, [-0.20, 0.10, -0.26, -0.02, -0.14, -0.02]);
  tri(pink, [0.20, 0.10, 0.26, -0.02, 0.14, -0.02]);

  // eyes
  tri(black, [-0.12, 0.08, -0.09, 0.14, -0.06, 0.08]);
  tri(black, [0.06, 0.08, 0.09, 0.14, 0.12, 0.08]);

  // nose
  tri(pink, [-0.03, 0.01, 0.03, 0.01, 0.00, -0.03]);

  // mouth
  tri(black, [-0.01, -0.03, -0.06, -0.08, -0.01, -0.07]);
  tri(black, [0.01, -0.03, 0.06, -0.08, 0.01, -0.07]);

  // body
  tri(white, [-0.22, -0.16, 0.22, -0.16, 0.00, -0.52]);
  tri(white, [-0.22, -0.16, -0.12, -0.50, 0.00, -0.52]);
  tri(white, [0.22, -0.16, 0.12, -0.50, 0.00, -0.52]);

  // feet
  tri(white, [-0.14, -0.52, -0.04, -0.52, -0.09, -0.60]);
  tri(white, [0.04, -0.52, 0.14, -0.52, 0.09, -0.60]);

  // arms
  tri(white, [-0.20, -0.18, -0.04, -0.30, -0.10, -0.10]);
  tri(white, [0.20, -0.18, 0.04, -0.30, 0.10, -0.10]);

  // carrot leaves
  tri(green, [-0.02, -0.18, -0.10, -0.06, -0.01, -0.08]);
  tri(green, [0.00, -0.18, 0.10, -0.06, 0.01, -0.08]);
  tri(green, [-0.04, -0.18, 0.00, -0.02, 0.04, -0.18]);

  // carrot body
  tri(orange, [-0.10, -0.20, 0.10, -0.20, 0.00, -0.46]);
  tri(orange, [-0.07, -0.30, 0.07, -0.30, 0.00, -0.52]);

  // carrot stripes
  tri(red, [-0.05, -0.27, 0.03, -0.28, -0.01, -0.30]);
  tri(red, [-0.04, -0.35, 0.02, -0.36, -0.01, -0.38]);
  tri(red, [-0.03, -0.43, 0.01, -0.44, -0.01, -0.46]);

}