
// Canvas
const canvas = document.querySelector('canvas.scene');

// Scene
const scene = new THREE.Scene();

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.1);
light.position.set(0,2,20);
scene.add(light);

// Sizes
const sizes = {
    width: window.innerWidth * 0.65,
    height: window.innerHeight * 0.85
};

window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});


// Camera setup
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(0,2,20);
camera.lookAt(0,0,0);
scene.add(camera);



//  Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
// sets up the background color
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// Animate
const animate = () =>
{
    renderer.render(scene, camera);

    points.rotation.x += 0.01;
    points.rotation.y += 0.01;

    // Call animate for each frame
    window.requestAnimationFrame(animate);
};
