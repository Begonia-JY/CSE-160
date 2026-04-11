class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
    this.segments = 10;
  }

  render() {
    let xy = this.position;
    let rgba = this.color;
    let radius = this.size / 200.0;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    let angleStep = 360 / this.segments;

    for (let angle = 0; angle < 360; angle += angleStep) {
      let angle1 = angle * Math.PI / 180;
      let angle2 = (angle + angleStep) * Math.PI / 180;

      let x1 = xy[0] + Math.cos(angle1) * radius;
      let y1 = xy[1] + Math.sin(angle1) * radius;
      let x2 = xy[0] + Math.cos(angle2) * radius;
      let y2 = xy[1] + Math.sin(angle2) * radius;

      drawTriangle([
        xy[0], xy[1],
        x1, y1,
        x2, y2
      ]);
    }
  }
}