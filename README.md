# fps
Experiments to build a FPS game in ThreeJS

### Demo

http://abhinavrastogi.github.io/fps/

Instructions: Click once to get better mouse controls (pointer lock). Click again to shoot. WASD keys to move. Mouse to look. Space to jump. Shoot lights to turn them off.

### Meta

Very dirty and unorganized code. Tons of bugs. Minimal features. I just started this project to try out ThreeJS two days ago!

Currently I have tried the following features of ThreeJS in this experiment:

- Objects, Geometries, Materials, Textures
- Bounding box helpers
- PointLight, SpotLight, DirectionalLight
- Light helpers
- Shadows
- Ray casting for collision detection (disallow walking through walls, bullet hits)
- Pointer lock for immersive mouse control
- Loading OBJ and MTL files along with textures
- EnvMaps, skybox
- Using arrays to generate maps
- HTML5 Audio playback and CSS transitions (not part of ThreeJS, but part of the experiment)
- Super simple gravity impl. Needed for jump.

### Plans

- Loading screen
- Transparency/Opacity
- Animations
- Multi-level (heights) terrain
- Procedurally generated maps
- Multi-player over sockets
- HUD, health, ammo etc
- Using 3d model for gun (fixed with camera)
- Other things as I come across them
