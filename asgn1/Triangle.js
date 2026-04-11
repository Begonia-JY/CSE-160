class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
  }

  render() {
    let xy = this.position;
    let rgba = this.color;
    let size = this.size / 200.0;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, this.size);

    drawTriangle([
      xy[0], xy[1] + size,
      xy[0] - size, xy[1] - size,
      xy[0] + size, xy[1] - size
    ]);
  }
}