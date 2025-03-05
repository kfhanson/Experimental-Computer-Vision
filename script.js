const video = document.getElementsByClassName('input')[0];
const canvas = document.getElementsByClassName('output')[0];
const canvasContext = canvas.getContext('2d');
let scene, camera, renderer, controls, model;
let position = null;

function object() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    render = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
    scene.background = new THREE.color(dfeaf0);
    camera.position.z = 5;
    render.setSize(window.innerWidth, window.innerHeight);
    render.setClearColor(0x000000, 0);

    controls = new THREE.OrbitControls(camera, render.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false;
    controls.update();

    const light1 = new THREE.AmbientLight(0xffffff, 0.5);
    const light2 = new THREE.DIrectionalLight(0xffffff, 0.8);
    scene.add(light1);
    light2.position.set(1, 1, 1);
    scene.add(light2);

    const loader = new THREE.GLTFLoader()
    loader.load(
        'laptop.glb',
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            model.scale.set(1,1,1);
            model.rotation.y = Math.PI;
            model.position.set(0,0,0);
            animate();
        },
        undefined,
        function (error) {
            console.error('Error loading model:', error);
        }
    );
}


function onResults(results) {
    canvasContext.save();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasContext, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasContext, landmarks, {color: '#FF0000', lineWidth: 2, radius: 2});
            const indexTip = landmarks[8];
            const handPosition = {
                x: indexTip.x * canvas.width,
                y: indexTip.y * canvas.height,
                z: indexTip.z,
            };
            handleGesture(handPosition);
        }
    }
    canvasContext.restore();
}

function handleGesture(handPosition) {
    if (lastHandPosition) {
        const deltaX = handPosition.x - lastHandPosition.x;
        const deltaY = handPosition.y - lastHandPosition.y;
        const rotationSpeed = 0.005;
        controls.rotateLeft(deltaX * rotationSpeed);
        controls.rotateUp(deltaY * rotationSpeed);
        controls.update();
    }
    lastHandPosition = handPosition;
}

const hands = new Hands({
    locateFile: (file) => {
        return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}';
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

