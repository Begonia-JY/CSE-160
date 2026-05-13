# Sloth Maze World

A small WebGL exploration game where the player searches through a maze to find the hidden Sloth Temple.

## Features
- First-person camera
- Mouse look
- WASD movement
- Q/E rotation
- Textured world
- Maze map
- Collision detection
- Add/Delete blocks
- FPS counter
- Giant sloth temple

## Controls
- W A S D = Move
- Mouse = Look around
- Q / E = Rotate
- Left Click = Add block
- Right Click = Delete block
- ESC = Unlock mouse

## Files

### index.html
Main webpage, UI, instructions, and canvas.

### src/World.js
Main game logic, rendering, textures, maze, collision, and interactions.

### src/Camera.js
First-person camera movement and mouse controls.

### src/Cube.js
Cube rendering and texture support.

### texture/
World textures:
- grass.png
- dirt.png
- stone.png
- sky.png

## Notes
Some difficult systems were developed with ChatGPT assistance, including:
- Mouse-look camera system
- Raycast add/delete block system
- Collision detection
- Sloth Temple environment design