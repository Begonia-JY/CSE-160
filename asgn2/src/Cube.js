class Cube {
  constructor(gl) {
    this.gl = gl;

    this.vertices = new Float32Array([
      -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
      -0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5,

      -0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5,
      -0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5,

      -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,

      -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5,
      -0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5,

      0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5,
      0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5,

      -0.5,-0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
      -0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5,
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  render(matrix, color, aPosition, uModelMatrix, uFragColor) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.uniformMatrix4fv(uModelMatrix, false, matrix.elements);
    gl.uniform4fv(uFragColor, color);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

export default Cube;
