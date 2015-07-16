// set the scene size
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;

var MOVE_SPEED = 0.05,
	MOVE_FWD = false,
	MOVE_BCK = false,
	MOVE_LEFT = false,
	MOVE_RIGHT = false,
	move_clip = true,
	velocity = {x: 0, y: 0, z: 0},
	canJump = true,
	MOON_LIGHT_INTENSITY = 0.5,
	STREET_LIGHT_INTENSITY = 1.5,
	gamePaused = false,
	AMBIENT_LIGHT_COLOR = 0x333333;

var pointerLocked = false;
var bullets = [];

// set some camera attributes
var VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 0.1,
	FAR = 999999, controls;

var map = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,1,1,1,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0]
];

var heightmap = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,8,7,6,5,0,0,0],
	[0,0,0,1,2,3,4,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0]
];

var lightmap = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,4,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,4,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,4,0,0,0,0,0,0,0,0],
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
		//barreta_sound.play();
		gun.classList.add('shoot');
		shooting = true;
		raycaster.set( controls.getObject().position, controls.getDirection(new THREE.Vector3()) );
		var intersects = raycaster.intersectObjects( scene.children, true );
		//console.log(intersects[0].object.uuid, lightpole.children[0].children[1].uuid);
		if(intersects[0]) {
			lightpoles.forEach(function(lightpole, i) {
				if(intersects[0].object.uuid===lightpole.id) {
					lightpoles[i].light.intensity = 0;
				}
			});
		//	directionalLight.intensity = 0;
		//	directionalLight2.intensity = 0;
		}
		console.log("intersects", intersects);
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
var light = new THREE.AmbientLight( AMBIENT_LIGHT_COLOR ); // soft white light
scene.add( light );


// start the
renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

// attach the render-supplied DOM element
$container.appendChild(renderer.domElement);
document.body.appendChild( stats.domElement );

// floor
var texture = THREE.ImageUtils.loadTexture( "assets/granite.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 10, 10 );

var geometry = new THREE.PlaneGeometry( 10, 10, 10, 10 );
var material = new THREE.MeshLambertMaterial( {
	color: 0x999999,
	//wireframe: true,
	map: texture
} );
var plane = new THREE.Mesh( geometry, material );
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotateX(THREE.Math.degToRad(-90));
plane.position.x = 5;
plane.position.z = 5;
scene.add( plane );

var moonLight = new THREE.SpotLight( 0xCCFFFF, MOON_LIGHT_INTENSITY );
moonLight.position.set( -100, 50, 100 );
moonLight.castShadow = true;
moonLight.shadowDarkness = 0.3;
moonLight.shadowCameraNear = 0.1;
moonLight.shadowCameraFar = 200;
moonLight.shadowCameraFov = 90;
//moonLight.shadowCameraVisible = true;
moonLight.shadowMapWidth = 1024; // default is 512
moonLight.shadowMapHeight = 1024; // default is 512
var lightTarget = new THREE.Object3D();
lightTarget.position.set(10,0,0);
scene.add(lightTarget);
moonLight.target = lightTarget;
scene.add( moonLight );
//var dlh = new THREE.SpotLightHelper(moonLight, 100);
//scene.add(dlh);


document.addEventListener('keydown', function(ev) {
	switch (ev.keyCode) {
		case 87: // W
			ev.preventDefault();
			MOVE_FWD = true;
			break;

		case 65: // A
			ev.preventDefault();
			MOVE_LEFT = true;
			break;

		case 83: // S
			ev.preventDefault();
			MOVE_BCK = true;
			break;

		case 68: // D
			ev.preventDefault();
			MOVE_RIGHT = true;
			break;

		case 9: // tab
			ev.preventDefault();
			gamePaused = !gamePaused;
			if(!gamePaused) {
				window.requestAnimationFrame(render);
			}
			break;

		case 32: // space
			ev.preventDefault();

			if ( canJump === true ) { velocity.y += 3; console.log("jump"); }
			canJump = false;
			break;
	}
});

document.addEventListener('keyup', function(ev) {
	switch (ev.keyCode) {
		case 87:
			// W
			ev.preventDefault();
			MOVE_FWD = false;
			break;

		case 65:
			// A
			ev.preventDefault();
			MOVE_LEFT = false;
			break;

		case 83:
			// S
			ev.preventDefault();
			MOVE_BCK = false;
			break;

		case 68:
			// D
			ev.preventDefault();
			MOVE_RIGHT = false;
			break;
	}
});

//var axisHelper = new THREE.AxisHelper( 1 );
//scene.add( axisHelper );

// sky box

var urlPrefix = "assets/lagoon/lagoon_";
var urls = [  urlPrefix + "posx.jpg",  urlPrefix + "negx.jpg", urlPrefix + "posy.jpg", urlPrefix + "negy.jpg",  urlPrefix + "posz.jpg", urlPrefix + "negz.jpg" ];
THREE.ImageUtils.loadTextureCube(urls, null, function(cubemap) {
	cubemap.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
	shader.uniforms['tCube'].value = cubemap; // apply textures to shader

// create shader material
	var skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

// create skybox mesh
	var skybox = new THREE.Mesh(
		new THREE.CubeGeometry(1000, 1000, 1000),
		skyBoxMaterial
	);

	scene.add(skybox);
}, function(e) {console.log("Error loading ltextures")}); // load textures

// light poles

var lightpole;
var lightpoles = [];
var spotLight;
var loader = new THREE.OBJMTLLoader();
loader.load( 'assets/Light Pole/Light Pole.obj', 'assets/Light Pole/Light Pole.mtl', function ( object ) {
	console.log("loaded", object);
	//object.position.z = - 100;
	lightpole = object;
	lightpole.scale.x = lightpole.scale.y = lightpole.scale.z = 0.04;
	lightpole.castShadow = true;
	lightpole.traverse(function(child ) {
		if ( child instanceof THREE.Mesh ) {
			//child.material.map = texture;
			child.castShadow = true;
		}
	});
	//lightpole.position.set(2,0.4,2);

	//object.scale.x = object.scale.y = object.scale.z = 0.5;
	//scene.add( lightpole );
	//window.requestAnimationFrame(render);

	// light map

	for (var i=0; i<lightmap.length; i++) {
		for (var j=0; j< lightmap[i].length; j++) {
			if(lightmap[i][j] > 0) {
				spotLight = new THREE.SpotLight( 0xffffff, 0 );
				spotLight.position.set( i , 1 - 0.18, j - 0.24 );
				//spotLight.rotateOnAxis(new THREE.Vector3(0,-1,1), THREE.Math.degToRad(45));
				//spotLight.castShadow = true;
				//spotLight.shadowCameraVisible = true;
				spotLight.shadowCameraNear = 0.03;
				spotLight.shadowCameraFar = 1 - 0.18;
				spotLight.shadowCameraFov = 90;
				var lightTarget = new THREE.Object3D();
				lightTarget.position.set(i , 0, j - 0.24);
				scene.add(lightTarget);
				spotLight.target = lightTarget;
				scene.add( spotLight );

				var directionalLight2 = new THREE.PointLight( 0xffffff, STREET_LIGHT_INTENSITY, 3 );
				directionalLight2.position.set( i , 1 - 0.18, j - 0.24 );
				scene.add( directionalLight2 );

				var newlightpole = lightpole.clone();
				newlightpole.position.set(i, 0.4, j);
				newlightpole.rotateY(THREE.Math.degToRad(90 * lightmap[i][j]));
				lightpoles.push({id: newlightpole.children[0].children[1].uuid, light: directionalLight2});
				scene.add(newlightpole);
			}
		}
	}

	window.requestAnimationFrame(render);

}, function(progress) {console.log("progress", progress)}, function(err) {"error", console.log(err)} );

var texture_wall = THREE.ImageUtils.loadTexture( "assets/RedBrick.png" );
texture_wall.wrapS = THREE.RepeatWrapping;
texture_wall.wrapT = THREE.RepeatWrapping;
texture_wall.repeat.set( 2, 2 );

// height map

for (var i=0; i<heightmap.length; i++) {
	for (var j=0; j< heightmap[i].length; j++) {
		if(heightmap[i][j] > 0) {
			var _geometry = new THREE.BoxGeometry(1, heightmap[i][j]*0.05, 1);
			var _material = new THREE.MeshLambertMaterial({color: 0xffffff});
			var _cube = new THREE.Mesh(_geometry, _material);

			_cube.castShadow = true;
			_cube.receiveShadow = false;

			_cube.position.z = i + 0.5;
			_cube.position.y = (heightmap[i][j]*0.05)/2;
			_cube.position.x = j + 0.5;

			scene.add(_cube);
		}
	}
}

// layout map
for (var i=0; i<map.length; i++) {
	for (var j=0; j< map[i].length; j++) {
		if(map[i][j] == 1) {
			var _geometry = new THREE.BoxGeometry(1, 1, 1);
			var _material = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture_wall});
			var _cube = new THREE.Mesh(_geometry, _material);

			_cube.castShadow = true;
			_cube.receiveShadow = false;

			_cube.position.z = i + 0.5;
			_cube.position.y = 0.5;
			_cube.position.x = j + 0.5;

			scene.add(_cube);
		}
	}
}

var objLoader = new THREE.OBJLoader();

objLoader.load('assets/chain-fence.obj', function(_fence) {
	_fence.scale.x = _fence.scale.y = _fence.scale.z = 0.05;
	//fence.traverse(function(child ) {
	//
	//	if ( child instanceof THREE.Mesh ) {
	//		//child.material.map = texture;
	//		//child.castShadow = true;
	//		var material2 = new THREE.MeshLambertMaterial({color: 0x0000ff, transparent: true, opacity: 0.5});
	//		var part = new THREE.Mesh(child.geometry, material2);
	//		child = part;
	//		console.log("fence mesh", child);
	//	}
	//});
	for(var i=0; i<10; i++) {
		var fence = _fence.clone();
		fence.position.x = i*0.98 + 0.5;
		scene.add(fence);
	};
});

//var house, bbox;
//var housetextureloader = new THREE.ImageLoader();
//var housetexture = new THREE.Texture();
//housetextureloader.load( 'farmhouse/Farmhouse Texture.jpg', function ( image ) {
//	housetexture.image = image;
//	housetexture.needsUpdate = true;
//} );
//var houseloader = new THREE.OBJLoader();
//
//houseloader.load( 'farmhouse/farmhouse.obj', function ( object ) {
//	object.traverse( function ( child ) {
//		if ( child instanceof THREE.Mesh ) {
//			child.material.map = housetexture;
//		}
//	} );
//	object.scale.x = object.scale.y = object.scale.z = 0.05;
//	object.position.set(5,0,-1);
//	bbox = new THREE.BoundingBoxHelper( object, 'white' );
//	bbox.update();
//	//scene.add( bbox );
//	//scene.add( object );
//	window.requestAnimationFrame(render);
//}, function(progress) {console.log("progress", progress)}, function(err) {"error", console.log(err)} );

controls.getObject().translateZ(5);
var prevTime = performance.now();
var intersects_fwd;
function render() {
	stats.begin();

	//raycaster.set( controls.getObject().position, controls.getDirection(new THREE.Vector3()) );
	//intersects_fwd = raycaster.intersectObjects( scene.children );
	var prevcellx = Math.floor(controls.getObject().position.x);
	var prevcellz = Math.floor(controls.getObject().position.z);
	var prevcellHeight = heightmap[prevcellz][prevcellx] * 0.05;

	if(MOVE_FWD) {
		//if(!move_clip || intersects_fwd.length == 0 || intersects_fwd[0].distance > 0.4) {
			controls.getObject().translateZ(-MOVE_SPEED);

			var cellHeight = heightmap[Math.floor(controls.getObject().position.z)][Math.floor(controls.getObject().position.x)] * 0.05;
			if(cellHeight > prevcellHeight + 0.06) {
				controls.getObject().translateZ(MOVE_SPEED);
			}
		//}
	}

	if(MOVE_BCK) {
		controls.getObject().translateZ(MOVE_SPEED);

		var cellHeight = heightmap[Math.floor(controls.getObject().position.z)][Math.floor(controls.getObject().position.x)] * 0.05;
		if(cellHeight > prevcellHeight + 0.05) {
			controls.getObject().translateZ(-MOVE_SPEED);
		}
	}

	if(MOVE_LEFT) {
		//var cameraDirection = controls.getDirection(new THREE.Vector3());
		//var downDirection = new THREE.Vector3(0, -1, 0);
		//var checkDirection = cameraDirection.crossVectors(cameraDirection, downDirection);
		//raycaster.set( controls.getObject().position, checkDirection );
		//var intersects = raycaster.intersectObjects( scene.children );
		//if(!move_clip || intersects.length == 0 || intersects[0].distance > 0.4) {
			controls.getObject().translateX(-MOVE_SPEED);
		//}

		var cellHeight = heightmap[Math.floor(controls.getObject().position.z)][Math.floor(controls.getObject().position.x)] * 0.05;
		if(cellHeight > prevcellHeight + 0.05) {
			controls.getObject().translateX(MOVE_SPEED);
		}
	}

	if(MOVE_RIGHT) {
		//var cameraDirection = controls.getDirection(new THREE.Vector3());
		//var downDirection = new THREE.Vector3(0, 1, 0);
		//var checkDirection = cameraDirection.crossVectors(cameraDirection, downDirection);
		//raycaster.set( controls.getObject().position, checkDirection );
		//var intersects = raycaster.intersectObjects( scene.children );
		//if(!move_clip || intersects.length == 0 || intersects[0].distance > 0.4) {
			controls.getObject().translateX(MOVE_SPEED);
		//}

		var cellHeight = heightmap[Math.floor(controls.getObject().position.z)][Math.floor(controls.getObject().position.x)] * 0.05;
		if(cellHeight > prevcellHeight + 0.05) {
			controls.getObject().translateX(-MOVE_SPEED);
		}
	}
	var cellx = Math.floor(controls.getObject().position.x);
	var cellz = Math.floor(controls.getObject().position.z);
	var cellHeight = heightmap[cellz][cellx] * 0.05;
	//console.log(cellx, cellz, cellHeight);
	var time = performance.now();
	var delta = ( time - prevTime ) / 1000;

	velocity.y -= 9.8 * 1 * delta;
	controls.getObject().translateY( velocity.y * delta );

	if ( controls.getObject().position.y < cellHeight + 0.5 ) {

		velocity.y = 0;
		controls.getObject().position.y = cellHeight + 0.5;

		canJump = true;

	}

	//bbox.update();

	renderer.render(scene, camera);


	prevTime = time;
	stats.end();

	if(controls.getObject().position.y < -3) {
		console.log("game over");
	} else {
		!gamePaused && requestAnimationFrame(render);
	}
}



