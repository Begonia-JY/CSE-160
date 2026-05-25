import { Matrix4, Vector3 } from "../lib/cuon-matrix.js";

class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([8, 1.6, 8]);
    this.at = new Vector3([12, 2.0, 12]);
    this.up = new Vector3([0, 1, 0]);

    this.yaw = -90;
    this.pitch = 0;
    this.speed = 0.06;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.projectionMatrix.setPerspective(
      this.fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );

    this.updateView();
  }

  updateView() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  getForwardVector() {
    let x = this.at.elements[0] - this.eye.elements[0];
    let z = this.at.elements[2] - this.eye.elements[2];

    let len = Math.sqrt(x * x + z * z);
    if (len === 0) return [0, 0];

    return [x / len, z / len];
  }

  moveForward() {
    let [x, z] = this.getForwardVector();

    this.eye.elements[0] += x * this.speed;
    this.eye.elements[2] += z * this.speed;
    this.at.elements[0] += x * this.speed;
    this.at.elements[2] += z * this.speed;

    this.updateView();
  }

  moveBackwards() {
    let [x, z] = this.getForwardVector();

    this.eye.elements[0] -= x * this.speed;
    this.eye.elements[2] -= z * this.speed;
    this.at.elements[0] -= x * this.speed;
    this.at.elements[2] -= z * this.speed;

    this.updateView();
  }

  moveLeft() {
    let [x, z] = this.getForwardVector();

    this.eye.elements[0] += z * this.speed;
    this.eye.elements[2] -= x * this.speed;
    this.at.elements[0] += z * this.speed;
    this.at.elements[2] -= x * this.speed;

    this.updateView();
  }

  moveRight() {
    let [x, z] = this.getForwardVector();

    this.eye.elements[0] -= z * this.speed;
    this.eye.elements[2] += x * this.speed;
    this.at.elements[0] -= z * this.speed;
    this.at.elements[2] += x * this.speed;

    this.updateView();
  }

  panLeft() {
    this.mouseLook(-5, 0);
  }

  panRight() {
    this.mouseLook(5, 0);
  }

  mouseLook(xOffset, yOffset) {
    this.yaw += xOffset;
    this.pitch -= yOffset;

    if (this.pitch > 89) this.pitch = 89;
    if (this.pitch < -89) this.pitch = -89;

    let radYaw = this.yaw * Math.PI / 180;
    let radPitch = this.pitch * Math.PI / 180;

    let x = Math.cos(radYaw) * Math.cos(radPitch);
    let y = Math.sin(radPitch);
    let z = Math.sin(radYaw) * Math.cos(radPitch);

    this.at.elements[0] = this.eye.elements[0] + x;
    this.at.elements[1] = this.eye.elements[1] + y;
    this.at.elements[2] = this.eye.elements[2] + z;

    this.updateView();
  }
}

export default Camera;