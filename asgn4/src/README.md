# Sloth Maze World Lighting (ASGN4)

A WebGL maze world featuring a sloth temple with Phong lighting, animated point light movement, spotlight effects, OBJ loading, and normal visualization.

## Features
- Textured maze world and sloth temple
- Phong lighting (ambient + diffuse + specular)
- Animated moving point light with sliders
- Spotlight toggle
- Normal visualization mode
- Sphere with lighting reflection
- Imported OBJ model
- WASD + mouse camera controls
- Dynamic sky and sunset lighting atmosphere

## Files
### index.html
Main webpage UI, lighting controls, sliders, and canvas setup.
### src/World.js
Main rendering logic, shaders, lighting system, maze rendering, sloth temple rendering, and animation loop.
### src/Cube.js
Cube geometry, UVs, normals, and rendering functions.
### src/Sphere.js
Sphere geometry generation and rendering for lighting visualization.
### src/OBJModel.js
OBJ loader and parser for importing external 3D models.
### src/Camera.js
Camera movement, mouse look system, and view/projection matrices.
### lib/cube.obj
Imported OBJ model used in the scene.

## Notes
Some portions of this assignment were helped by ChatGPT,
- Phong lighting shader implementation
- OBJ model loading/parsing system
ChatGPT also assisted with debugging rendering, normal calculations.