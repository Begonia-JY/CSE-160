import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const basePath = import.meta.env.BASE_URL;

const app = document.querySelector('#app');
app.innerHTML = '<canvas id="forest-scene" aria-label="Ancient forest house scene"></canvas>';

const canvas = document.querySelector('#forest-scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ebba8);
scene.fog = new THREE.FogExp2(0x9fb69e, 0.023); 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 220);
camera.position.set(12, 6.2, 15);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.target.set(0, 3.25, 0);
controls.minDistance = 7;
controls.maxDistance = 42;
controls.maxPolarAngle = Math.PI * 0.95;
controls.update();

const textureLoader = new THREE.TextureLoader();
let currentLightingMode = 0;
let currentWeather = 'sunny';

function loadRepeatingTexture(paths, repeatX, repeatY) {
  const texture = textureLoader.load(paths[0], undefined, undefined, () => {
    textureLoader.load(paths[1], (fallback) => {
      texture.image = fallback.image;
      texture.needsUpdate = true;
    });
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

const grassTexture = loadRepeatingTexture([
  `${basePath}textures/Skybox/textures/Grass004_1K-JPG_Color.jpg`,
  `${basePath}textures/Grass004_1K-JPG_Color.jpg`,
], 50, 50);
const barkTexture = loadRepeatingTexture([
  `${basePath}textures/Skybox/textures/Bark014_1K-JPG_Color.jpg`,
  `${basePath}textures/Bark014_1K-JPG_Color.jpg`,
], 2, 4);
const rockTexture = loadRepeatingTexture([
  `${basePath}textures/Skybox/textures/Rock064_1K-JPG_Color.jpg`,
  `${basePath}textures/Rock064_1K-JPG_Color.jpg`,
], 2.4, 1.4);

const groundMaterial = new THREE.MeshStandardMaterial({ map: grassTexture, color: 0x789062, roughness: 0.95 });
const barkMaterial = new THREE.MeshStandardMaterial({ map: barkTexture, color: 0x5f4a35, roughness: 0.88 });
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x385d34, roughness: 0.75 });
const bambooMaterial = new THREE.MeshStandardMaterial({ color: 0x6f8c45, roughness: 0.72 });
const bambooLeafMaterial = new THREE.MeshStandardMaterial({ color: 0x5f8f3d, roughness: 0.7, side: THREE.DoubleSide });
const mossMaterial = new THREE.MeshStandardMaterial({ color: 0x4f7b3c, roughness: 1 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x6a7069, roughness: 0.9 });
const rockPathMaterial = new THREE.MeshStandardMaterial({ map: rockTexture, color: 0xa1a092, roughness: 0.92 });
const warmWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4b2c, roughness: 0.82 });
const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2519, roughness: 0.78 });
const lanternFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x4c1b14, roughness: 0.65 });
const lanternShadeMaterial = new THREE.MeshStandardMaterial({
  color: 0xff7a35,
  emissive: 0xff8c35,
  emissiveIntensity: 0.35,
  roughness: 0.42,
});
const tasselMaterial = new THREE.MeshStandardMaterial({ color: 0x9d1814, roughness: 0.68 });
const unitCylinder10 = new THREE.CylinderGeometry(1, 1, 1, 10);
const unitCylinder12 = new THREE.CylinderGeometry(1, 1, 1, 12);
const unitCylinder14 = new THREE.CylinderGeometry(1, 1, 1, 14);
const unitCylinder16 = new THREE.CylinderGeometry(1, 1, 1, 16);
const canopyGeometry = new THREE.SphereGeometry(1, 14, 10);
const grassBladeGeometry = new THREE.ConeGeometry(1, 1, 5);
const bambooLeafGeometry = new THREE.PlaneGeometry(1, 0.16);
const bambooRingGeometry = new THREE.TorusGeometry(0.069, 0.008, 6, 14);
const unitBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
const mossGeometry = new THREE.SphereGeometry(1, 7, 5);
const tasselGeometry = new THREE.ConeGeometry(0.08, 0.22, 10);
function fade(t) {
  return t * t * (3 - 2 * t);
}

function hashNoise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;
  const a = hashNoise(x0, y0);
  const b = hashNoise(x0 + 1, y0);
  const c = hashNoise(x0, y0 + 1);
  const d = hashNoise(x0 + 1, y0 + 1);
  const u = fade(xf);
  const v = fade(yf);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(a, b, u),
    THREE.MathUtils.lerp(c, d, u),
    v,
  );
}

function shapeGround(geometry) {
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const distance = Math.hypot(x, y);
    const flat = THREE.MathUtils.smoothstep(distance, 8, 15);
    const broad = valueNoise(x * 0.07, y * 0.07);
    const fine = valueNoise(x * 0.18 + 17, y * 0.18 - 9);
    const height = ((broad - 0.5) * 0.32 + (fine - 0.5) * 0.08) * flat;
    position.setZ(i, THREE.MathUtils.clamp(height, -0.2, 0.2));
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

const groundGeometry = new THREE.PlaneGeometry(220, 220, 120, 120);
shapeGround(groundGeometry);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const skyTextureLoader = new THREE.TextureLoader();

const sunnySkyTexture = skyTextureLoader.load(`${basePath}textures/Skybox/sunny.png`);
sunnySkyTexture.colorSpace = THREE.SRGBColorSpace;
sunnySkyTexture.needsUpdate = true;

const rainySkyTexture = skyTextureLoader.load(`${basePath}textures/Skybox/rainy.png`);
rainySkyTexture.colorSpace = THREE.SRGBColorSpace;
rainySkyTexture.needsUpdate = true;

const skyMaterial = new THREE.MeshBasicMaterial({
  map: sunnySkyTexture,
  color: 0xbfd7e0,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  fog: false,
});

const skySphere = new THREE.Mesh(
  new THREE.SphereGeometry(120, 48, 24),
  skyMaterial,
);

skySphere.position.set(0, 0, 0);
skySphere.renderOrder = -100;
skySphere.castShadow = false;
skySphere.receiveShadow = false;
scene.add(skySphere);

function refreshSky() {
  skyMaterial.map = currentWeather === 'rainy' ? rainySkyTexture : sunnySkyTexture;
  skyMaterial.needsUpdate = true;
}
const ambientLight = new THREE.AmbientLight(0xc7d6be, 0.38);
scene.add(ambientLight);
const hemisphereLight = new THREE.HemisphereLight(0xd8efe4, 0x314229, 1.25);
scene.add(hemisphereLight);
const sunLight = new THREE.DirectionalLight(0xffc88e, 3.15);
sunLight.position.set(10, 13, 8);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1536, 1536);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 55;
sunLight.shadow.camera.left = -24;
sunLight.shadow.camera.right = 24;
sunLight.shadow.camera.top = 24;
sunLight.shadow.camera.bottom = -24;
scene.add(sunLight);
const entranceLight = new THREE.SpotLight(0xffb36e, 0.45, 10, Math.PI / 5, 0.55, 1.6);
entranceLight.position.set(0.2, 3.2, 4.4);
entranceLight.target.position.set(0, 1.4, 0.8);
entranceLight.castShadow = true;
entranceLight.shadow.mapSize.set(768, 768);
scene.add(entranceLight);
scene.add(entranceLight.target);
const lanterns = [];
const windObjects = [];
const bambooTops = [];
const bambooLeaves = [];
const grassBlades = [];
const particleMotion = [];

function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function createTree(x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const trunk = new THREE.Mesh(unitCylinder12, barkMaterial);
  trunk.scale.set(0.27 * scale, 3.8 * scale, 0.27 * scale);
  trunk.position.y = 1.9 * scale;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);
  const leaves = new THREE.Mesh(canopyGeometry, leafMaterial);
  leaves.position.y = 4.0 * scale;
  leaves.scale.set(1.35 * scale, 1.05 * scale, 1.35 * scale);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  group.add(leaves);

  windObjects.push({ object: leaves, baseY: leaves.rotation.y, strength: 0.075, speed: randomRange(0.6, 1.1) });
  scene.add(group);
}

function createBambooLeaf(length = 0.5) {
  const leaf = new THREE.Mesh(bambooLeafGeometry, bambooLeafMaterial);
  leaf.scale.set(length, length, 1);
  leaf.castShadow = false;
  leaf.receiveShadow = false;
  return leaf;
}

function createBambooCluster(x, z, count = 6, spread = 0.9) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = randomRange(-0.28, 0.28);

  for (let i = 0; i < count; i += 1) {
    const height = randomRange(4.2, 7.4);
    const radius = randomRange(0.045, 0.083);
    const lowerHeight = height * randomRange(0.66, 0.72);
    const upperHeight = height - lowerHeight;
    const stemX = randomRange(-spread, spread);
    const stemZ = randomRange(-spread, spread);
    const upperLeanX = randomRange(-0.06, 0.06);
    const upperLeanZ = randomRange(-0.08, 0.08);
    const lowerStem = new THREE.Mesh(unitCylinder10, bambooMaterial);
    lowerStem.scale.set(radius, lowerHeight, radius);
    lowerStem.position.set(stemX, lowerHeight / 2 - 0.05, stemZ);
    lowerStem.castShadow = false;
    lowerStem.receiveShadow = false;
    group.add(lowerStem);

    const upperGroup = new THREE.Group();
    upperGroup.position.set(stemX, lowerHeight - 0.05, stemZ);
    upperGroup.rotation.set(upperLeanX, 0, upperLeanZ);
    group.add(upperGroup);

    const upperStem = new THREE.Mesh(unitCylinder10, bambooMaterial);
    upperStem.scale.set(radius * 0.78, upperHeight, radius * 0.78);
    upperStem.position.y = upperHeight / 2;
    upperStem.castShadow = false;
    upperStem.receiveShadow = false;
    upperGroup.add(upperStem);

    for (let node = 0.95; node < height; node += randomRange(1.2, 1.55)) {
      const ring = new THREE.Mesh(bambooRingGeometry, mossMaterial);
      ring.position.set(stemX, node, stemZ);
      ring.rotation.x = Math.PI / 2;
      ring.scale.setScalar(radius / 0.07);
      ring.castShadow = false;
      ring.receiveShadow = false;
      group.add(ring);
    }

    const leafClusterCount = 6 + Math.floor(Math.random() * 4);
    for (let j = 0; j < leafClusterCount; j += 1) {
      const leaf = createBambooLeaf(randomRange(0.4, 0.78));
      const side = j % 2 === 0 ? 1 : -1;
      const heightBand = upperHeight * randomRange(0.38, 0.98);
      const fanAngle = randomRange(-0.85, 0.85);
      leaf.position.set(side * randomRange(0.14, 0.42), heightBand, randomRange(-0.16, 0.16));
      leaf.rotation.set(randomRange(-0.18, 0.22), fanAngle, side * randomRange(0.22, 0.75));
      upperGroup.add(leaf);
      bambooLeaves.push({
        object: leaf,
        baseZ: leaf.rotation.z,
        baseY: leaf.rotation.y,
        strength: randomRange(0.11, 0.2),
        speed: randomRange(1.0, 1.65),
      });
    }

    bambooTops.push({
      object: upperGroup,
      baseX: upperGroup.rotation.x,
      baseZ: upperGroup.rotation.z,
      strength: randomRange(0.08, 0.14),
      speed: randomRange(0.62, 1.1),
    });
  }

  scene.add(group);
}

function scatterBambooClusters(count, zone, minStalks, maxStalks, spread = 0.9) {
  for (let i = 0; i < count; i += 1) {
    const x = randomRange(zone.minX, zone.maxX);
    const z = randomRange(zone.minZ, zone.maxZ);
    const stalks = Math.floor(randomRange(minStalks, maxStalks + 1));
    createBambooCluster(x, z, stalks, randomRange(spread * 0.75, spread * 1.25));
  }
}
function createGrassCluster(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.03, z);

  for (let i = 0; i < 5; i += 1) {
    const height = randomRange(0.35, 0.58);
    const blade = new THREE.Mesh(grassBladeGeometry, mossMaterial);
    blade.scale.set(0.055, height, 0.055);
    blade.position.set(randomRange(-0.28, 0.28), height / 2, randomRange(-0.28, 0.28));
    blade.rotation.z = randomRange(-0.28, 0.28);
    blade.rotation.x = randomRange(-0.16, 0.16);
    blade.castShadow = false;
    blade.receiveShadow = false;
    group.add(blade);
    grassBlades.push({ object: blade, baseX: blade.rotation.x, baseZ: blade.rotation.z, strength: randomRange(0.15, 0.24) });
  }

  scene.add(group);
}

function createRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(rockGeometry, stoneMaterial);
  rock.position.set(x, scale * 0.52, z);
  rock.rotation.set(randomRange(-0.3, 0.3), randomRange(0, Math.PI), randomRange(-0.3, 0.3));
  rock.scale.set(1.3 * scale, randomRange(0.55, 0.95) * scale, 0.9 * scale);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

function createBarrel(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;

  const barrel = new THREE.Mesh(unitCylinder16, warmWoodMaterial);
  barrel.scale.set(0.41, 0.9, 0.41);
  barrel.position.y = 0.45;
  barrel.castShadow = false;
  barrel.receiveShadow = true;
  group.add(barrel);

  const bandMaterial = new THREE.MeshStandardMaterial({ color: 0x2f302b, roughness: 0.7 });
  [-0.28, 0.28].forEach((y) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.025, 8, 20), bandMaterial);
    band.position.y = 0.45 + y;
    band.rotation.x = Math.PI / 2;
    group.add(band);
  });

  scene.add(group);
}

function createStonePath() {
  const pathPieces = [
    [0.05, 6.35, 1.25, 0.48, 0.0], [-0.08, 5.68, 1.05, 0.5, 0.08],
    [0.12, 5.03, 1.18, 0.48, -0.04], [-0.04, 4.38, 1.08, 0.46, 0.11],
    [0.07, 3.74, 1.18, 0.5, -0.08], [-0.1, 3.12, 1.12, 0.45, 0.03],
    [0.02, 2.55, 1.32, 0.42, 0.0],
  ];

  pathPieces.forEach(([x, z, width, depth, rot]) => {
    const stone = new THREE.Mesh(unitBoxGeometry, rockPathMaterial);
    stone.scale.set(width, 0.12, depth);
    stone.position.set(x, 0.075, z);
    stone.rotation.y = rot;
    stone.castShadow = false;
    stone.receiveShadow = true;
    scene.add(stone);
  });

  for (let i = 0; i < 3; i += 1) {
    const step = new THREE.Mesh(unitBoxGeometry, rockPathMaterial);
    step.scale.set(2.25 - i * 0.18, 0.16, 0.42);
    step.position.set(0, 0.11 + i * 0.08, 2.08 - i * 0.31);
    step.castShadow = false;
    step.receiveShadow = true;
    scene.add(step);
  }
}

function createLanternPost(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;

  const pole = new THREE.Mesh(unitCylinder14, darkWoodMaterial);
  pole.scale.set(0.085, 2.95, 0.085);
  pole.position.y = 1.475;
  pole.castShadow = true;
  pole.receiveShadow = true;
  group.add(pole);

  const base = new THREE.Mesh(unitCylinder16, rockPathMaterial);
  base.scale.set(0.24, 0.18, 0.24);
  base.position.y = 0.09;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const beam = new THREE.Mesh(unitBoxGeometry, darkWoodMaterial);
  beam.scale.set(1.2, 0.12, 0.12);
  beam.position.set(0.42, 2.92, 0);
  beam.castShadow = true;
  beam.receiveShadow = true;
  group.add(beam);

  const bracketA = new THREE.Mesh(unitBoxGeometry, darkWoodMaterial);
  bracketA.scale.set(0.42, 0.07, 0.08);
  bracketA.position.set(0.22, 2.72, 0);
  bracketA.rotation.z = -0.72;
  bracketA.castShadow = true;
  group.add(bracketA);

  const bracketB = bracketA.clone();
  bracketB.position.z = 0.09;
  group.add(bracketB);

  const pivot = new THREE.Group();
  pivot.position.set(0.92, 2.78, 0);
  group.add(pivot);

  const cord = new THREE.Mesh(unitCylinder10, darkWoodMaterial);
  cord.scale.set(0.014, 0.34, 0.014);
  cord.position.y = -0.17;
  cord.castShadow = false;
  pivot.add(cord);

  const lanternBody = new THREE.Group();
  lanternBody.position.y = -0.48;
  pivot.add(lanternBody);
  const lanternTop = new THREE.Mesh(unitCylinder16, lanternFrameMaterial);
  lanternTop.scale.set(0.28, 0.08, 0.28);
  lanternTop.position.y = 0.24;
  lanternTop.castShadow = false;
  lanternBody.add(lanternTop);

  const shade = new THREE.Mesh(unitCylinder16, lanternShadeMaterial.clone());
  shade.scale.set(0.28, 0.42, 0.28);
  shade.position.y = 0;
  shade.castShadow = false;
  shade.receiveShadow = false;
  lanternBody.add(shade);

  const lanternBottom = new THREE.Mesh(unitCylinder16, lanternFrameMaterial);
  lanternBottom.scale.set(0.24, 0.08, 0.24);
  lanternBottom.position.y = -0.24;
  lanternBottom.castShadow = false;
  lanternBody.add(lanternBottom);

  const tasselCord = new THREE.Mesh(unitCylinder10, tasselMaterial);
  tasselCord.scale.set(0.012, 0.23, 0.012);
  tasselCord.position.y = -0.42;
  lanternBody.add(tasselCord);

  const tassel = new THREE.Mesh(tasselGeometry, tasselMaterial);
  tassel.position.y = -0.58;
  tassel.castShadow = false;
  lanternBody.add(tassel);
  const light = new THREE.PointLight(0xff9c45, 0.65, 7, 1.7);
  light.position.set(0, 0, 0);
  light.castShadow = false;
  lanternBody.add(light);

  lanterns.push({ pivot, shadeMaterial: shade.material, light, phase: randomRange(0, Math.PI * 2), baseRotation: pivot.rotation.z });
  scene.add(group);
}
[
  [-10, -7, 1.15], [-7, -10, 1.0], [7, -10, 1.08], [11, -6, 1.25],
  [-12, 2, 1.15], [12, 2, 1.1], [-9, 8, 1.0], [9, 7, 1.2],
  [-4, 10, 0.95], [4, 11, 1.05], [-14, -1, 1.0], [14, -1, 1.0],
].forEach(([x, z, scale]) => createTree(x, z, scale));
scatterBambooClusters(12, { minX: -11.5, maxX: -5.2, minZ: -3.8, maxZ: 7.6 }, 3, 5, 0.92);
scatterBambooClusters(12, { minX: 5.2, maxX: 11.5, minZ: -3.8, maxZ: 7.6 }, 3, 5, 0.92);
scatterBambooClusters(24, { minX: -11.2, maxX: 11.2, minZ: -13.6, maxZ: -6.0 }, 4, 6, 1.02);
scatterBambooClusters(12, { minX: -8.5, maxX: 8.5, minZ: -16.2, maxZ: -12.2 }, 3, 6, 1.08);

for (let i = 0; i < 36; i += 1) {
  const angle = randomRange(0, Math.PI * 2);
  const radius = randomRange(4.2, 18);
  createGrassCluster(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

[
  [-3.4, 4.3, 0.42], [3.5, 3.8, 0.48], [-5.8, -1.6, 0.58], [5.9, -1.2, 0.38],
  [-6.2, 5.2, 0.5], [6.5, 5.7, 0.62], [-2.8, -4.7, 0.45], [3.9, -4.9, 0.5],
].forEach(([x, z, scale]) => createRock(x, z, scale));

createBarrel(-3.9, 3.3, 0.4);
createBarrel(3.9, 3.2, -0.35);
createStonePath();
createLanternPost(-2.35, 4.35, -0.22);
createLanternPost(2.35, 4.35, Math.PI + 0.22);
for (let i = 0; i < 24; i += 1) {
  const moss = new THREE.Mesh(mossGeometry, mossMaterial);
  moss.position.set(randomRange(-5.8, 5.8), 0.075, randomRange(-5.6, 5.9));
  moss.scale.set(randomRange(0.14, 0.42), randomRange(0.03, 0.08), randomRange(0.12, 0.36));
  moss.rotation.y = randomRange(0, Math.PI);
  moss.castShadow = false;
  moss.receiveShadow = false;
  scene.add(moss);
}
const particleCount = 240;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i += 1) {
  const radius = randomRange(1.5, 18);
  const angle = randomRange(0, Math.PI * 2);
  positions[i * 3] = Math.cos(angle) * radius;
  positions[i * 3 + 1] = randomRange(0.35, 7.0);
  positions[i * 3 + 2] = Math.sin(angle) * radius;

  const firefly = Math.random() > 0.74;
  colors[i * 3] = firefly ? 1.0 : 0.8;
  colors[i * 3 + 1] = firefly ? 0.86 : 0.78;
  colors[i * 3 + 2] = firefly ? 0.36 : 0.64;
  particleMotion.push({ baseY: positions[i * 3 + 1], speed: randomRange(0.35, 1.0), offset: randomRange(0, 10) });
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    size: 0.075,
    transparent: true,
    opacity: 0.68,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
scene.add(particles);

const rainCount = 360;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 6);
const rainDrops = [];
for (let i = 0; i < rainCount; i += 1) {
  const x = randomRange(-24, 24);
  const y = randomRange(8, 26);
  const z = randomRange(-24, 16);
  const length = randomRange(0.45, 0.8);
  const speed = randomRange(0.16, 0.28);
  const index = i * 6;
  rainPos[index] = x;
  rainPos[index + 1] = y;
  rainPos[index + 2] = z;
  rainPos[index + 3] = x + 0.05;
  rainPos[index + 4] = y - length;
  rainPos[index + 5] = z;
  rainDrops.push({ x, y, z, length, speed });
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.LineBasicMaterial({
  color: 0xdcefff,
  transparent: true,
  opacity: 0.48,
  depthWrite: false,
});
const rain = new THREE.LineSegments(rainGeo, rainMat);
rain.visible = false;
scene.add(rain);

const lightingModes = [
  {
    name: 'Dawn',
    background: 0x8daeb6,
    fog: 0x9fb7ad,
    fogDensity: 0.019,
    skyTop: 0x789fb4,
    skyBottom: 0xe5c996,
    sunColor: 0xffd78a,
    sunIntensity: 2.25,
    sunPosition: [-12, 7.5, 6],
    ambientColor: 0xb9c5bd,
    ambientIntensity: 0.42,
    hemiSky: 0xd3e7ec,
    hemiGround: 0x40513c,
    hemiIntensity: 1.05,
    spotColor: 0xffba72,
    spotIntensity: 0.55,
    lanternIntensity: 0.8,
    lanternDistance: 7.5,
    lanternEmissive: 0.48,
    exposure: 1.02,
    particleSize: 0.08,
    skyColor: 0xbfd7e0,
    skyOpacity: 0.9,
  },
  {
    name: 'Noon',
    background: 0xa7c5c8,
    fog: 0xb4c9b5,
    fogDensity: 0.009,
    skyTop: 0x8fc7d8,
    skyBottom: 0xd8dec0,
    sunColor: 0xfff1cf,
    sunIntensity: 3.65,
    sunPosition: [1.5, 15, 4],
    ambientColor: 0xd1dcc7,
    ambientIntensity: 0.48,
    hemiSky: 0xe4f4ee,
    hemiGround: 0x536348,
    hemiIntensity: 1.35,
    spotColor: 0xffc486,
    spotIntensity: 0.28,
    lanternIntensity: 0.35,
    lanternDistance: 6,
    lanternEmissive: 0.22,
    exposure: 1.08,
    particleSize: 0.065,
    skyColor: 0xffffff,
    skyOpacity: 1.0,
  },
  {
    name: 'Sunset',
    background: 0xa68f74,
    fog: 0xb18b67,
    fogDensity: 0.016,
    skyTop: 0x8f8fae,
    skyBottom: 0xf0a35d,
    sunColor: 0xff8f32,
    sunIntensity: 3.15,
    sunPosition: [12, 6.5, 7],
    ambientColor: 0xbe9271,
    ambientIntensity: 0.32,
    hemiSky: 0xffd6a0,
    hemiGround: 0x4a3f31,
    hemiIntensity: 0.95,
    spotColor: 0xff9b45,
    spotIntensity: 0.75,
    lanternIntensity: 1.25,
    lanternDistance: 8.5,
    lanternEmissive: 0.7,
    exposure: 1.0,
    particleSize: 0.085,
    skyColor: 0xffb98a,
    skyOpacity: 0.95,
  },
  {
    name: 'Night',
    background: 0x182837,
    fog: 0x1b3140,
    fogDensity: 0.032,
    skyTop: 0x0e1f32,
    skyBottom: 0x263f3a,
    sunColor: 0xbdd8ff,
    sunIntensity: 0.34,
    sunPosition: [-4, 10, -6],
    ambientColor: 0x223946,
    ambientIntensity: 0.16,
    hemiSky: 0x7894ad,
    hemiGround: 0x10201a,
    hemiIntensity: 0.48,
    spotColor: 0xffa75c,
    spotIntensity: 1.55,
    lanternIntensity: 4.8,
    lanternDistance: 12,
    lanternEmissive: 2.4,
    exposure: 0.86,
    particleSize: 0.095,
    skyColor: 0x1b2e45,
    skyOpacity: 0.75,
  },
];

function wetColor(hex, amount = 0.36) {
  return new THREE.Color(hex).lerp(new THREE.Color(0x5f7468), amount).getHex();
}

function updateWeatherButtons() {
  document.querySelector('#sunny-button')?.classList.toggle('is-active', currentWeather === 'sunny');
  document.querySelector('#rainy-button')?.classList.toggle('is-active', currentWeather === 'rainy');
}

function applyLightingMode(index = currentLightingMode) {
  currentLightingMode = Number(index);
  const base = lightingModes[currentLightingMode];
  const wet = currentWeather === 'rainy';
  const modeLabel = document.querySelector('#lighting-mode-label');
  const night = currentLightingMode === 3;

  const fog = wet ? wetColor(base.fog, 0.5) : base.fog;
  const sunIntensity = wet ? base.sunIntensity * (night ? 0.7 : 0.52) : base.sunIntensity;
  const ambientIntensity = wet ? base.ambientIntensity * 0.72 : base.ambientIntensity;
  const hemiIntensity = wet ? base.hemiIntensity * 0.72 : base.hemiIntensity;
  const fogDensity = wet ? base.fogDensity * 2.15 : base.fogDensity;
  const exposure = wet ? base.exposure * 0.78 : base.exposure;
  const skyColor = wet ? new THREE.Color(base.skyColor).lerp(new THREE.Color(0x5f7468), 0.48).multiplyScalar(0.78) : new THREE.Color(base.skyColor);
  const skyOpacity = wet ? Math.max(0.58, base.skyOpacity * 0.82) : base.skyOpacity;
  const lanternBoost = wet ? (night ? 1.25 : 1.08) : 1;

  refreshSky();
  skyMaterial.color.copy(skyColor);
  skyMaterial.opacity = skyOpacity;
  skyMaterial.needsUpdate = true;
  scene.fog.color.set(fog);
  scene.fog.density = fogDensity;
  sunLight.color.set(wet ? wetColor(base.sunColor, 0.28) : base.sunColor);
  sunLight.intensity = sunIntensity;
  sunLight.position.set(...base.sunPosition);

  ambientLight.color.set(wet ? wetColor(base.ambientColor, 0.45) : base.ambientColor);
  ambientLight.intensity = ambientIntensity;
  hemisphereLight.color.set(wet ? wetColor(base.hemiSky, 0.42) : base.hemiSky);
  hemisphereLight.groundColor.set(wet ? wetColor(base.hemiGround, 0.35) : base.hemiGround);
  hemisphereLight.intensity = hemiIntensity;

  entranceLight.color.set(base.spotColor);
  entranceLight.intensity = base.spotIntensity * (wet ? 1.12 : 1);
  renderer.toneMappingExposure = exposure;
  particles.material.size = base.particleSize;
  rain.visible = wet;
  rainMat.opacity = wet ? 0.68 : 0.0;

  lanterns.forEach((lantern) => {
    lantern.shadeMaterial.emissiveIntensity = base.lanternEmissive * lanternBoost;
    lantern.light.intensity = base.lanternIntensity * lanternBoost;
    lantern.light.distance = base.lanternDistance;
  });

  if (modeLabel) {
    modeLabel.textContent = wet ? `${base.name} / Rainy` : base.name;
  }
  updateWeatherButtons();
}

function setWeather(nextWeather) {
  currentWeather = nextWeather;
  applyLightingMode(currentLightingMode);
}

const lightingSlider = document.querySelector('#lighting-slider');
lightingSlider?.addEventListener('input', (event) => {
  applyLightingMode(event.target.value);
});
document.querySelector('#sunny-button')?.addEventListener('click', () => setWeather('sunny'));
document.querySelector('#rainy-button')?.addEventListener('click', () => setWeather('rainy'));
applyLightingMode(lightingSlider?.value ?? 0);
const loader = new GLTFLoader();
loader.load(`${basePath}Models/abandoned_house.glb`, (gltf) => {
  const house = gltf.scene;
  enableShadows(house);

  const box = new THREE.Box3().setFromObject(house);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = (5.8 / Math.max(size.x, size.z)) * 3.25;

  house.scale.setScalar(scale);
  house.position.sub(center.multiplyScalar(scale));

  const scaledBox = new THREE.Box3().setFromObject(house);
  house.position.y -= scaledBox.min.y;
  house.rotation.y = -0.08;
  scene.add(house);
  window.dispatchEvent(new Event('ancient-forest-house-loaded'));
}, undefined, (error) => {
  console.error('Could not load abandoned_house.glb', error);
});
const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();

  windObjects.forEach((item, index) => {
    item.object.rotation.z = Math.sin(elapsed * item.speed + index) * item.strength;
    item.object.rotation.y = item.baseY + Math.cos(elapsed * item.speed * 0.7 + index) * item.strength;
  });

  bambooTops.forEach((item, index) => {
    item.object.rotation.z = item.baseZ + Math.sin(elapsed * item.speed * 1.75 + index * 0.4) * item.strength;
    item.object.rotation.x = item.baseX + Math.cos(elapsed * item.speed * 1.6 + index) * item.strength * 0.82;
  });

  bambooLeaves.forEach((item, index) => {
    item.object.rotation.z = item.baseZ + Math.sin(elapsed * item.speed * 2.1 + index * 0.2) * item.strength;
    item.object.rotation.y = item.baseY + Math.cos(elapsed * item.speed * 1.8 + index) * item.strength;
  });

  grassBlades.forEach((item, index) => {
    item.object.rotation.x = item.baseX + Math.sin(elapsed * 3.0 + index * 0.35) * item.strength;
    item.object.rotation.z = item.baseZ + Math.cos(elapsed * 2.6 + index * 0.22) * item.strength * 0.75;
  });

  lanterns.forEach((lantern) => {
    lantern.pivot.rotation.z = lantern.baseRotation + Math.sin(elapsed * 1.85 + lantern.phase) * 0.24;
    lantern.pivot.rotation.x = Math.cos(elapsed * 1.45 + lantern.phase) * 0.09;
  });

  const particlePositions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i += 1) {
    const data = particleMotion[i];
    particlePositions[i * 3 + 1] = data.baseY + Math.sin(elapsed * data.speed * 1.7 + data.offset) * 0.22;
    particlePositions[i * 3] += Math.sin(elapsed * 0.45 + data.offset) * 0.0014;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  if (currentWeather === 'rainy') {
    for (let i = 0; i < rainCount; i += 1) {
      const drop = rainDrops[i];
      drop.y -= drop.speed;
      if (drop.y < -0.5) {
        drop.y = randomRange(13, 27);
        drop.x = randomRange(-24, 24);
        drop.z = randomRange(-24, 16);
      }
      const r = i * 6;
      rainPos[r] = drop.x;
      rainPos[r + 1] = drop.y;
      rainPos[r + 2] = drop.z;
      rainPos[r + 3] = drop.x + 0.05;
      rainPos[r + 4] = drop.y - drop.length;
      rainPos[r + 5] = drop.z;
    }
    rain.geometry.attributes.position.needsUpdate = true;
  }
  particles.material.opacity = (currentLightingMode === 3 ? 0.72 : 0.54) + Math.sin(elapsed * 1.6) * 0.08;

  entranceLight.intensity = lightingModes[currentLightingMode].spotIntensity + Math.sin(elapsed * 2.4) * (currentLightingMode === 3 ? 0.08 : 0.025);
  skySphere.position.copy(camera.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});