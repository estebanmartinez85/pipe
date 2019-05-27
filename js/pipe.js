var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xcccccc );
var camera = new THREE.PerspectiveCamera( 75, 1024 / 720, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( 1024, 720 );
document.body.appendChild( renderer.domElement );

var distance = 5;
 camera.position.z = distance;

var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
scene.add( ambientLight );

var pointLight = new THREE.PointLight( 0xffffff, 0.15 );
camera.add( pointLight );
scene.add( camera );

var loader = new THREE.OBJLoader();
var pipe, valve;
var objCount = 2;
var loaded = 0;
var objects = new Map();

loadObject("threeJSPipe");
loadObject("threeJSValve");

function checkProgress(){
    if(loaded >= objCount){
        valve = objects.get('threeJSValve');
        
        pipe = objects.get('threeJSPipe');
        camera.lookAt(pipe.position);
        let r = 1.5;
        window.addEventListener('keydown', (evt) => {
            if(evt.code === 'KeyE'){
                valve.rotation.x -= 0.05;
            } else if(evt.code === 'KeyQ'){
                valve.rotation.x += 0.05;
            }
            if(evt.code === 'KeyA'){
                r -= 0.1;
                camera.position.x = (distance * Math.cos(r));
                camera.position.z = (distance * Math.sin(r));
                camera.lookAt(pipe.position);
            } else if(evt.code === 'KeyD'){
                r += 0.1;
                camera.position.x = (distance * Math.cos(r));
                camera.position.z = (distance * Math.sin(r));
                camera.lookAt(pipe.position);
            }
        });
    }
}

function loadObject(name){
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( "models/" );
    mtlLoader.load( `${name}.mtl`, ( materials ) => {
        let loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.setPath("models/")
        loader.load(`${name}.obj`, (object) => {
            loaded++;
            object.key = name;
            objects.set(name, object);
            scene.add(object);
            checkProgress();
        })
    })
}


function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();