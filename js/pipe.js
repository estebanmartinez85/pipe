var scene = new THREE.Scene();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}
scene.background = new THREE.Color(0xe6f6fd);

var width = 1920;
var height = 1080;
var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
renderer.domElement.mozRequestPointerLock;
var theta;
var vector = new THREE.Vector3();
renderer.domElement.onclick = function(){
     renderer.domElement.requestPointerLock()
}
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === renderer.domElement ||
      document.mozPointerLockElement === renderer.domElement) {
    console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", updatePosition, false);
  } else {
    console.log('The pointer lock status is now unlocked');  
    document.removeEventListener("mousemove", updatePosition, false);
  }
}


renderer.setSize( width, height );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

var distance = 19;
camera.position.z = distance;
  camera.position.y = 3;

var ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
scene.add( ambientLight );

var dirLight = new THREE.DirectionalLight( 0xffffff, 0.15 );
if(getUrlParam("hq", "true") === "true"){
    dirLight.position.y = 36;
    dirLight.position.x = -40;
    dirLight.position.z = 20;
    dirLight.castShadow = true;
    dirLight.bias = 0.0001;
    dirLight.shadow.mapSize.width = 2048;  // default
    dirLight.shadow.mapSize.height = 2048; // default
    dirLight.shadow.camera.far = 200;     // default
    dirLight.shadow.camera.left = -50;     // default
    dirLight.shadow.camera.right = 50;     // default
    dirLight.shadow.camera.top = 50;     // default
    dirLight.shadow.camera.bottom = -50;     // default
}
scene.add( dirLight );
var helper = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add( camera );

var loader = new THREE.GLTFLoader();
var valve, tank;
var objCount = 2;
var objectsLoaded = 0;
var sceneLoaded = false;
var maxRotate = 3.4;
var objects = new Map();
var animationSpeed = 0;
var mixer = null;
var mouse = {x: 0, y: 0}
var mousePrev = {x: 0, y: 0}
var mouseMoveEvent = null; 
function updatePosition(event) {
    mouseMoveEvent = event;
};
loadObject("Tank");
loadObject("Valve");
function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
var keyf = false;
function checkProgress(){
    if(objectsLoaded >= objCount){
        sceneLoaded = true;
        valve = objects.get('Valve').scene;
        valve.position.y = 2.5;
        valve.position.z = 10;
        valve.position.x = -7.7;
        valve.castShadow = true;
        valve.receiveShadow = true;
        tank = objects.get('Tank');
        tank.scene.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        let water = tank.scene.getObjectByName("Water");
        let t = tank.scene.getObjectByName("Tank");
        water.material.transparent = true;
        water.material.opacity = 0.7;


        mixer = new THREE.AnimationMixer(tank.scene);
        for(let animation of tank.animations){
            let action = mixer.clipAction(animation);
            action.setLoop( THREE.LoopOnce );
            action.clampWhenFinished = true;
            action.enable = true;
            action.play();
        }
        
        let r = 1.5;

        window.addEventListener('keydown', (evt) => {
            let speed = 30;
            if(evt.code === 'KeyW'){
                camera.position.x  += (vector.x / 100) * speed;
                camera.position.z  += (vector.z / 100) * speed;
            }    
            if(evt.code === 'KeyF'){
                keyf = true;
            }          
            if(evt.code === 'KeyS'){
                camera.position.x  -= (vector.x / 100) * speed;
                camera.position.z  -= (vector.z / 100) * speed;
            }
            if(evt.code === 'KeyR'){
                camera.rotateX(0.01);
                //camera.rotation.y -= .01;
            }
            if(evt.code === 'KeyT'){
                camera.rotation.x -= .01;
                //camera.rotation.y -= .01;
            }
            if(evt.code === 'KeyA'){
                let j = {x: (camera.position.x + vector.x) - camera.position.x, z: (camera.position.z + vector.z) - camera.position.z};
                let d = j.x;
                j.x = -j.z;
                j.z = d;
                camera.position.x -= (j.x / 100) * speed;
                camera.position.z -= (j.z / 100) * speed;
            }
            if(evt.code === 'KeyD'){
                let j = {x: (camera.position.x + vector.x) - camera.position.x, z: (camera.position.z + vector.z) - camera.position.z};
                let d = j.x;
                j.x = -j.z;
                j.z = d;
                camera.position.x += (j.x / 100) * speed;
                camera.position.z += (j.z / 100) * speed;
            }
            if(evt.code === 'KeyE'){
                if(valve.rotation.y > -maxRotate){
                    valve.rotation.y -= 0.05;
                    animationSpeed += 0.0001;
                }
            } else if(evt.code === 'KeyQ'){
                if(valve.rotation.y < maxRotate){
                    valve.rotation.y += 0.05;
                    if(animationSpeed > 0){
                        animationSpeed -= 0.0001;
                    } else {
                        animationSpeed = 0;
                    }
                }
            }
        });
    }
}

function loadObject(name){
    var loader = new THREE.GLTFLoader();
    loader.load(`models/${name}.glb`, function (gltf) {
        var model = gltf.scene;
        model.castShadow = true;
        model.receiveShadow = true;
        objects.set(name, gltf)
        scene.add(model)
        objectsLoaded++;
        checkProgress();
    });
}
var clock = new THREE.Clock();

var limit = 300,
    lastFrameTimeMs = 0,
    maxFPS = 144,
    delta = 0,
    timestep = 1000 / 60,
    fps = 144,
    framesThisSecond = 0,
    lastFpsUpdate = 0,
    running = false,
    started = false,
    frameID = 0,
    speedM = 0.004;

function update(delta) {
    console.log(delta);
    if(sceneLoaded){
        //mixer.update(animationSpeed);
    }
    camera.getWorldDirection(vector);
    theta = Math.atan2(vector.x,vector.z);
    if(keyf){
        camera.rotateOnWorldAxis(THREE.Object3D.DefaultUp, .005 * (delta ));
    }
    if(mouseMoveEvent !== null){
        if(mouseMoveEvent.movementX != 0)
        {
            if(mouseMoveEvent.movementX < 0){
                camera.rotateOnWorldAxis(THREE.Object3D.DefaultUp, speedM * (delta ));
            } else if (mouseMoveEvent.movementX > 0) {
                camera.rotateOnWorldAxis(THREE.Object3D.DefaultUp, -speedM * (delta ));
            }
        } 
        if(mouseMoveEvent.movementY != 0)
        {
            console.log(camera.rotation.x, ';;;;;;;;;;;;;;;');
            if(mouseMoveEvent.movementY > 0){
                camera.rotateX(-speedM * (delta ));
            } else if (mouseMoveEvent.movementY) {
                camera.rotateX(speedM * (delta ));
            }
        } 
        mouseMoveEvent = null;
    }
}

function draw(interp) {
    renderer.render( scene, camera );
}

function panic() {
    delta = 0;
}

function begin() {
}

function end(fps) {

}

function stop() {
    running = false;
    started = false;
    cancelAnimationFrame(frameID);
}
    
function start() {
    if (!started) { // don't request multiple frames
        started = true;
        // Dummy frame to get our timestamps and initial drawing right.
        // Track the frame ID so we can cancel it if we stop quickly.
        frameID = requestAnimationFrame(function(timestamp) {
            draw(1); // initial draw

            running = true;
            // reset some time tracking variables
            lastFrameTimeMs = timestamp;
            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
            // actually start the main loop
            frameID = requestAnimationFrame(mainLoop);
        });
    }
}
function mainLoop(timestamp) {
    // Throttle the frame rate.    
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        frameID = requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    begin(timestamp, delta);

    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * framesThisSecond + 0.75 * fps;

        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;

    var numUpdateSteps = 0;
    while (delta >= timestep) {
        update(timestep);
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }

    draw(delta / timestep);

    end(fps);

    frameID = requestAnimationFrame(mainLoop);
}
start();