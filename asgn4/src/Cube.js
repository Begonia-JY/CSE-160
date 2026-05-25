import { Matrix4 } from "../lib/cuon-matrix.js";

class Cube {
  constructor(gl) {
    this.gl = gl;

    // x, y, z, u, v, nx, ny, nz
    this.vertices = new Float32Array([
      // front
      -0.5,-0.5, 0.5, 0,0,  0,0,1,   0.5,-0.5, 0.5, 1,0,  0,0,1,   0.5, 0.5, 0.5, 1,1,  0,0,1,
      -0.5,-0.5, 0.5, 0,0,  0,0,1,   0.5, 0.5, 0.5, 1,1,  0,0,1,  -0.5, 0.5, 0.5, 0,1,  0,0,1,

      // back
      -0.5,-0.5,-0.5, 0,0,  0,0,-1, -0.5, 0.5,-0.5, 0,1,  0,0,-1,  0.5, 0.5,-0.5, 1,1,  0,0,-1,
      -0.5,-0.5,-0.5, 0,0,  0,0,-1,  0.5, 0.5,-0.5, 1,1,  0,0,-1,  0.5,-0.5,-0.5, 1,0,  0,0,-1,

      // top
      -0.5, 0.5,-0.5, 0,0,  0,1,0,  -0.5, 0.5, 0.5, 0,1,  0,1,0,   0.5, 0.5, 0.5, 1,1,  0,1,0,
      -0.5, 0.5,-0.5, 0,0,  0,1,0,   0.5, 0.5, 0.5, 1,1,  0,1,0,   0.5, 0.5,-0.5, 1,0,  0,1,0,

      // bottom
      -0.5,-0.5,-0.5, 0,0,  0,-1,0,  0.5,-0.5,-0.5, 1,0,  0,-1,0,  0.5,-0.5, 0.5, 1,1,  0,-1,0,
      -0.5,-0.5,-0.5, 0,0,  0,-1,0,  0.5,-0.5, 0.5, 1,1,  0,-1,0, -0.5,-0.5, 0.5, 0,1,  0,-1,0,

      // right
       0.5,-0.5,-0.5, 0,0,  1,0,0,   0.5, 0.5,-0.5, 0,1,  1,0,0,   0.5, 0.5, 0.5, 1,1,  1,0,0,
       0.5,-0.5,-0.5, 0,0,  1,0,0,   0.5, 0.5, 0.5, 1,1,  1,0,0,   0.5,-0.5, 0.5, 1,0,  1,0,0,

      // left
      -0.5,-0.5,-0.5, 0,0, -1,0,0,  -0.5,-0.5, 0.5, 1,0, -1,0,0,  -0.5, 0.5, 0.5, 1,1, -1,0,0,
      -0.5,-0.5,-0.5, 0,0, -1,0,0,  -0.5, 0.5, 0.5, 1,1, -1,0,0,  -0.5, 0.5,-0.5, 0,1, -1,0,0,
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  render(matrix, textureNum, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const FSIZE = this.vertices.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 8 * FSIZE, 0);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 8 * FSIZE, 5 * FSIZE);
    gl.enableVertexAttribArray(aNormal);

    gl.uniformMatrix4fv(uModelMatrix, false, matrix.elements);
    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(matrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);
    gl.uniform1i(uWhichTexture, textureNum);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

export default Cube;
