# Here Winds Meet

## Project Overview

This project is a Three.js scene created for CSE160 Assignment 5. The scene is an ancient forest house environment inspired by a quiet bamboo forest. The main focus of the scene is an abandoned wooden house surrounded by bamboo, trees, rocks, grass, lanterns, fog, particles, and weather effects.

## Features

* A custom abandoned house 3D model as the main object
* Textured ground using grass texture
* Textured trees using bark texture
* Textured stone path using rock texture
* More than 20 primary shapes
* Multiple shape types, including boxes, cylinders, spheres, cones, torus shapes, and dodecahedrons
* OrbitControls camera movement with mouse interaction
* Multiple light types:

  * Ambient Light
  * Directional Light
  * Hemisphere Light
  * Spot Light
  * Point Lights inside the lanterns
* Textured sky background
* Fog and atmospheric rendering
* Bamboo forest surrounding the house
* Animated bamboo, grass, tree leaves, particles, lanterns, and rain
* Sunny and rainy weather modes
* Four lighting time modes:

  * Dawn
  * Noon
  * Sunset
  * Night
* Lanterns glow more strongly at night
* Loading screen and UI controls

## Files

### `index.html`

This file sets up the main webpage structure. It includes the loading screen, controls panel, lighting slider, sunny/rainy buttons, footer credit, and the app container where the Three.js canvas is inserted.

### `src/main.js`

This is the main Three.js program. It creates the scene, camera, renderer, lights, textures, sky background, ground, trees, bamboo, lanterns, particles, rain, animation loop, and GLB model loading. Most of the visual scene and interactive features are controlled here.

### `src/style.css`

This file controls the page layout and canvas styling. It makes the Three.js canvas fill the browser window and removes default margins/scrolling.

### `public/Models/abandoned_house.glb`

This is the custom 3D house model used as the main object in the scene.

### `public/textures/`

This folder contains the texture assets used for the environment, including grass, bark, rock, sunny sky, and rainy sky textures.

## Assets

The textures and abandoned house model are free online assets. The abandoned house is my selected custom 3D model asset for this project.

## Extra Feature/Wow 

For the extra feature, I added a dynamic forest atmosphere system. The scene includes wind animation, moving bamboo tops and leaves, animated grass, swinging lanterns, floating particles, rainy weather, and a lighting system that changes the mood between dawn, noon, sunset, and night.

The rainy mode adds falling rain and changes the scene to a darker green-gray atmosphere. The night mode makes the lanterns glow more strongly and changes the lighting to a darker blue environment.

## NOTES
1. Building the lighting system.
2. Creating the sunny/rainy weather system and making the rain animate correctly.
3. Creating the bamboo forest with animated upper sections and moving leaves.
4. Debugging the sky background, texture paths, Vite loading issues, and camera controls.

Codex and chatGPT helped with these four parts.