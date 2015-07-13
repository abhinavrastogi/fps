// set the scene size
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;

var MOVE_SPEED = 0.1,
	MOVE_FWD = false,
	MOVE_BCK = false,
	MOVE_LEFT = false,
	MOVE_RIGHT = false;

var pointerLocked = false;
var bullets = [];

// set some camera attributes
var VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 0.1,
	FAR = 10000, controls;

var map = [
	[1,0,0,1,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,1,1,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0]
];

var stats = new Stats();
stats.setMode( 0 );

stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

var $container = document.getElementById('container');
var barreta_sound = document.getElementById('barreta_sound');
var gun = document.getElementById('gun');
var shooting = false;

document.addEventListener('click', function(ev) {
	if(pointerLocked && !shooting) {
		barreta_sound.play();
		gun.classList.add('shoot');
		shooting = true;
		setTimeout(function() {
			gun.classList.remove('shoot');
			shooting = false;
		}, 400);
	} else {
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
		if ( havePointerLock ) {
			var element = document.body;
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			//element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			//element.requestFullscreen();
			element.requestPointerLock();
			pointerLocked = true;
		}
	}
});

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);

var scene = new THREE.Scene();

// add the camera to the scene
scene.add(camera);

controls = new THREE.PointerLockControls( camera );
controls.enabled = true;
scene.add( controls.getObject() );

var raycaster = new THREE.Raycaster();

// light
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 10, 10, 0 );
scene.add( directionalLight );

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element
$container.appendChild(renderer.domElement);
document.body.appendChild( stats.domElement );

var geometry = new THREE.PlaneGeometry( 10, 10, 10, 10 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: true} );
var plane = new THREE.Mesh( geometry, material );
plane.rotateX(THREE.Math.degToRad(90));
//plane.position.x = 5;
//plane.position.z = 5;
scene.add( plane );

document.addEventListener('keydown', function(ev) {
	switch (ev.keyCode) {
		case 87:
			// W
			MOVE_FWD = true;
			break;

		case 65:
			// A
			MOVE_LEFT = true;
			break;

		case 83:
			// S
			MOVE_BCK = true;
			break;

		case 68:
			// D
			MOVE_RIGHT = true;
			break;
	}
});

document.addEventListener('keyup', function(ev) {
	switch (ev.keyCode) {
		case 87:
			// W
			MOVE_FWD = false;
			break;

		case 65:
			// A
			MOVE_LEFT = false;
			break;

		case 83:
			// S
			MOVE_BCK = false;
			break;

		case 68:
			// D
			MOVE_RIGHT = false;
			break;
	}
});


// layout map
for (var i=0; i<map.length; i++) {
	for (var j=0; j< map[i].length; j++) {
		if(map[i][j] == 1) {
			var _geometry = new THREE.BoxGeometry(1, 1, 1);
			var _material = new THREE.MeshLambertMaterial({color: 0x00ff00});
			var _cube = new THREE.Mesh(_geometry, _material);

			_cube.position.z = i + 0.5;
			_cube.position.y = 0.5;
			_cube.position.x = j + 0.5;

			scene.add(_cube);
		}
	}
}
var intersects_fwd;
function render() {
	stats.begin();

	raycaster.set( controls.getObject().position, controls.getDirection(new THREE.Vector3()) );
	intersects_fwd = raycaster.intersectObjects( scene.children );

	if(MOVE_FWD) {
		if(intersects_fwd.length == 0 || intersects_fwd[0].distance > 0.4) {
			controls.getObject().translateZ(-MOVE_SPEED);
		}
	}

	if(MOVE_BCK) {
		controls.getObject().translateZ(MOVE_SPEED);
	}

	if(MOVE_LEFT) {
		var cameraDirection = controls.getDirection(new THREE.Vector3());
		var downDirection = new THREE.Vector3(0, -1, 0);
		var checkDirection = cameraDirection.crossVectors(cameraDirection, downDirection);
		raycaster.set( controls.getObject().position, checkDirection );
		var intersects = raycaster.intersectObjects( scene.children );
		if(intersects.length == 0 || intersects[0].distance > 0.4) {
			controls.getObject().translateX(-MOVE_SPEED);
		}

	}

	if(MOVE_RIGHT) {
		var cameraDirection = controls.getDirection(new THREE.Vector3());
		var downDirection = new THREE.Vector3(0, 1, 0);
		var checkDirection = cameraDirection.crossVectors(cameraDirection, downDirection);
		raycaster.set( controls.getObject().position, checkDirection );
		var intersects = raycaster.intersectObjects( scene.children );
		if(intersects.length == 0 || intersects[0].distance > 0.4) {
			controls.getObject().translateX(MOVE_SPEED);
		}
	}

	renderer.render( scene, camera );

	stats.end();

	requestAnimationFrame( render );
}
requestAnimationFrame( render );
