class Cube {
  constructor(gl) {
    this.gl = gl;

    this.vertices = new Float32Array([
      // front
      -0.5,-0.5,0.5, 0,0,   0.5,-0.5,0.5, 1,0,   0.5,0.5,0.5, 1,1,
      -0.5,-0.5,0.5, 0,0,   0.5,0.5,0.5, 1,1,   -0.5,0.5,0.5, 0,1,

      // back
      -0.5,-0.5,-0.5, 0,0,  -0.5,0.5,-0.5, 0,1,  0.5,0.5,-0.5, 1,1,
      -0.5,-0.5,-0.5, 0,0,   0.5,0.5,-0.5, 1,1,  0.5,-0.5,-0.5, 1,0,

      // top
      -0.5,0.5,-0.5, 0,0,  -0.5,0.5,0.5, 0,1,   0.5,0.5,0.5, 1,1,
      -0.5,0.5,-0.5, 0,0,   0.5,0.5,0.5, 1,1,   0.5,0.5,-0.5, 1,0,

      // bottom
      -0.5,-0.5,-0.5, 0,0,   0.5,-0.5,-0.5, 1,0,  0.5,-0.5,0.5, 1,1,
      -0.5,-0.5,-0.5, 0,0,   0.5,-0.5,0.5, 1,1,  -0.5,-0.5,0.5, 0,1,

      // right
      0.5,-0.5,-0.5, 0,0,   0.5,0.5,-0.5, 0,1,   0.5,0.5,0.5, 1,1,
      0.5,-0.5,-0.5, 0,0,   0.5,0.5,0.5, 1,1,   0.5,-0.5,0.5, 1,0,

      // left
      -0.5,-0.5,-0.5, 0,0,  -0.5,-0.5,0.5, 1,0,  -0.5,0.5,0.5, 1,1,
      -0.5,-0.5,-0.5, 0,0,  -0.5,0.5,0.5, 1,1,  -0.5,0.5,-0.5, 0,1,
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  render(matrix, textureNum, aPosition, aUV, uModelMatrix, uWhichTexture) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
    gl.enableVertexAttribArray(aUV);

    gl.uniformMatrix4fv(uModelMatrix, false, matrix.elements);
    gl.uniform1i(uWhichTexture, textureNum);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

export default Cube;