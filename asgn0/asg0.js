function main() {
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  var ctx = canvas.getContext('2d');

  // black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // initial vector
  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, 'red');
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + v.elements[0] * 20, centerY - v.elements[1] * 20);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // read v1
  let v1x = parseFloat(document.getElementById('v1x').value);
  let v1y = parseFloat(document.getElementById('v1y').value);

  // read v2
  let v2x = parseFloat(document.getElementById('v2x').value);
  let v2y = parseFloat(document.getElementById('v2y').value);

  // create vectors
  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  // draw both
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // read v1
  let v1x = parseFloat(document.getElementById('v1x').value);
  let v1y = parseFloat(document.getElementById('v1y').value);

  // read v2
  let v2x = parseFloat(document.getElementById('v2x').value);
  let v2y = parseFloat(document.getElementById('v2y').value);

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  // draw original vectors
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  let op = document.getElementById('operation').value;
  let scalar = parseFloat(document.getElementById('scalar').value);

  if (op === 'add') {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.add(v2);
    drawVector(v3, 'green');
  } 
  else if (op === 'sub') {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.sub(v2);
    drawVector(v3, 'green');
  } 
  else if (op === 'mul') {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    let v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.mul(scalar);
    v4.mul(scalar);

    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } 
  else if (op === 'div') {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    let v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.div(scalar);
    v4.div(scalar);

    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } 
  else if (op === 'magnitude') {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  } 
  else if (op === 'normalize') {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    let v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  }
  else if(op === 'angle'){
    console.log("Angle:", angleBetween(v1, v2));
  }
  else if (op === 'area'){
    console.log("Area of triangle:", areaTriangle(v1, v2));
  }
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();
  let cosAlpha = dot / (m1 * m2);
  let angleRad = Math.acos(cosAlpha);
  let angleDeg = angleRad * 180 / Math.PI;
  return angleDeg;
}

function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  let areaParallelogram = cross.magnitude();
  let areaTriangle = areaParallelogram / 2;
  return areaTriangle;
}