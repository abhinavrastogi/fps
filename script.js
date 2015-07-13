// set the scene size
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 0.1,
	FAR = 10000;

var stats = new Stats();
stats.setMode( 0 );

stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';


// get the DOM element to attach to
// - assume we've got jQuery to hand
var $container = document.querySelector('#container');

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);

var scene = new THREE.Scene();

// add the camera to the scene
scene.add(camera);

// the camera starts at 0,0,0
// so pull it back
camera.position.z = 30;
camera.position.y = 10;

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element
$container.appendChild(renderer.domElement);
document.body.appendChild( stats.domElement );

var geometry = new THREE.PlaneGeometry( 100, 100, 10, 10 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: true} );
var plane = new THREE.Mesh( geometry, material );
plane.rotateX(THREE.Math.degToRad(90));
scene.add( plane );

document.addEventListener('keydown', function(ev) {
	switch (ev.keyCode) {
		case 87:
			// W
			camera.position.z --;
			break;

		case 65:
			// A
			camera.position.x --;
			break;

		case 83:
			// S
			camera.position.z ++;
			break;

		case 68:
			// D
			camera.position.x ++;
			break;
	}
});

function render() {
	stats.begin();

	renderer.render( scene, camera );

	stats.end();

	requestAnimationFrame( render );
}
requestAnimationFrame( render );
