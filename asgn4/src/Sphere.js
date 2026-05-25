import { Matrix4 } from "../lib/cuon-matrix.js";

class Sphere {
  constructor(gl) {
    this.gl = gl;
    const data = [];
    const latBands = 28;
    const lonBands = 28;

    const point = (theta, phi) => {
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.cos(theta);
      const z = Math.sin(theta) * Math.sin(phi);
      return { x, y, z, u: phi / (Math.PI * 2), v: theta / Math.PI };
    };

    const push = (p) => data.push(p.x * 0.5, p.y * 0.5, p.z * 0.5, p.u, p.v, p.x, p.y, p.z);

    for (let lat = 0; lat < latBands; lat++) {
      const t1 = lat * Math.PI / latBands;
      const t2 = (lat + 1) * Math.PI / latBands;
      for (let lon = 0; lon < lonBands; lon++) {
        const p1 = lon * 2 * Math.PI / lonBands;
        const p2 = (lon + 1) * 2 * Math.PI / lonBands;
        const a = point(t1, p1), b = point(t2, p1), c = point(t2, p2), d = point(t1, p2);
        push(a); push(b); push(c);
        push(a); push(c); push(d);
      }
    }

    this.vertices = new Float32Array(data);
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

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 8);
  }
}

export default Sphere;
