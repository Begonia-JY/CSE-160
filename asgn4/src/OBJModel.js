import { Matrix4 } from "../lib/cuon-matrix.js";

class OBJModel {
  constructor(gl, objPath) {
    this.gl = gl;
    this.vertices = new Float32Array([]);
    this.ready = false;
    this.buffer = gl.createBuffer();

    fetch(objPath)
      .then(r => r.text())
      .then(text => {
        this.parseOBJ(text);
        this.ready = true;
        console.log("OBJ loaded:", objPath);
      })
      .catch(err => console.log("OBJ load failed:", err));
  }

  parseOBJ(text) {
    const positions = [[0, 0, 0]];
    const texcoords = [[0, 0]];
    const normals = [[0, 1, 0]];
    const out = [];

    for (let line of text.split("\n")) {
      line = line.trim();
      if (!line || line.startsWith("#")) continue;
      const p = line.split(/\s+/);

      if (p[0] === "v") positions.push([+p[1], +p[2], +p[3]]);
      else if (p[0] === "vt") texcoords.push([+p[1], +p[2]]);
      else if (p[0] === "vn") normals.push([+p[1], +p[2], +p[3]]);
      else if (p[0] === "f") {
        const face = p.slice(1);
        for (let i = 1; i < face.length - 1; i++) {
          this.addVertex(face[0], positions, texcoords, normals, out);
          this.addVertex(face[i], positions, texcoords, normals, out);
          this.addVertex(face[i + 1], positions, texcoords, normals, out);
        }
      }
    }

    this.vertices = new Float32Array(out);
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  addVertex(v, positions, texcoords, normals, out) {
    const idx = v.split("/");
    const pi = parseInt(idx[0]);
    const ti = idx[1] ? parseInt(idx[1]) : 0;
    const ni = idx[2] ? parseInt(idx[2]) : 0;

    const p = positions[pi] || [0, 0, 0];
    const uv = texcoords[ti] || [0, 0];
    const n = normals[ni] || [0, 1, 0];
    out.push(p[0], p[1], p[2], uv[0], uv[1], n[0], n[1], n[2]);
  }

  render(matrix, textureNum, aPosition, aUV, aNormal, uModelMatrix, uNormalMatrix, uWhichTexture) {
    if (!this.ready) return;
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

export default OBJModel;
