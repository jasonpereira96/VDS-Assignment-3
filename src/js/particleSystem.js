var data = [];
var points;
// bounds of the data
const bounds = {};
let checkbox;
const f = 1.2;
const EPSILON = 0.01;
const brushWidth = 50;
const DEBOUNCE_DELAY = 150;
window.geometry = null;

let _color;

function min(array) {
    let r = Infinity;
    for (let v of array) {
        r = Math.min(r, v);
    }
    return r;
}

function max(array) {
    let r = -9999;
    for (let v of array) {
        r = Math.max(r, v);
    }
    return r;
}


function printStats(data) {
    let x = data.map(r => r.X);
    let y = data.map(r => r.Y);
    let z = data.map(r => r.Z);
    let c1 = data.map(r => r.concentration);

    

    console.log(min(c1), max(c1));

    let conc = data.map(d => d.concentration);
    let s = new Set(conc);

    let c = [];
    for (const v of s.values()) {
        c.push(v);
    }
    c.sort((a, b) => b- a);

    console.log(c);
}




const createFilter = () => {
    const geometry = new THREE.BoxGeometry(10, 10, 0.1);
    const material = new THREE.MeshBasicMaterial( {color: 0xFFD700, transparent: true, opacity: 0.5} );
    const cube = new THREE.Mesh( geometry, material);
    scene.add(cube);
    window.cube = cube;
    return cube;
};

// creates the particle system
const createParticleSystem = (data) => {

    let filteredData = data.slice();
    filteredData = filteredData.filter(r => r.concentration < Infinity)

    const domainMin = min(filteredData.map(d => d.concentration));
    const domainMax = Math.min(max(filteredData.map(d => d.concentration)), 30);
    var color = d3.scaleSequential()
        .domain([domainMin, domainMax])
        .interpolator(d3.interpolatePuRd);

    _color = color;

   

    
    let vertices = [];
    let colors = [];
    
    for (const datum of filteredData) {
        vertices.push(datum.X*f, datum.Y*f, datum.Z*f);
        // let c1 = new THREE.Color(color(datum.Z));
        let c1 = new THREE.Color(color(datum.concentration));
        // console.log(r, g, b);
        // colors.push(color1.r,color1.g, color1.b);
        // colors.push(0,256,0);
        colors.push(c1.r, c1.g, c1.b);
    }
    // console.log(colors);


    // vertices = vertices.slice(0, 30);
    vertices = new Float32Array(vertices);

    // const sizes = new Float32Array([2,2,2,2,2,2,2,2,2]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ));
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3));
    window.geometry = geometry;


    const material = new THREE.PointsMaterial( { size: 0.02, vertexColors: true } );

    points = new THREE.Points( geometry, material );

    scene.add( points );
    // animate();
    render();
    renderChart(filteredData.filter(d => d.Z === 0), color);
    renderLegend(filteredData, color);
    printStats(filteredData);
};

const loadData = (file) => {

    // read the csv file
    d3.csv(file).then(function (fileData)
    // iterate over the rows of the csv file
    {
        fileData.forEach(d => {
            // get the min bounds
            bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
            bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
            bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

            // get the max bounds
            bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
            bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
            bounds.maxZ = Math.max(bounds.maxZ || -Infinity, d.Points2);

            // add the element to the data collection
            data.push({
                // concentration density
                concentration: Number(d.concentration) * 1,
                // Position
                X: Number(d.Points0),
                Y: Number(d.Points1),
                Z: Number(d.Points2),
                // Velocity
                U: Number(d.velocity0),
                V: Number(d.velocity1),
                W: Number(d.velocity2)
            })
        });
        // draw the containment cylinder
        // TODO: Remove after the data has been rendered
        // create the particle system
        createParticleSystem(data);
        createFilter();
        requestAnimationFrame(render);
        initializeControls();
    });
};


loadData('data/058.csv');

function renderChart(records, color) {
    let scatterData = records.map(d => {
        return {
            x: d.X, y: d.Y, concentration: d.concentration, z: d.Z
        };
    });
    scatterPlot(scatterData, {
        color
    });
}

function initializeControls() {
    const slider = document.getElementById('slider');
    let sliderMin = min(data.map(d => d.Z));
    let sliderMax = max(data.map(d => d.Z));
    slider.min = sliderMin;
    slider.max = sliderMax;
    slider.value = sliderMin;
    slider.addEventListener("input", _.debounce(onSliderChange, DEBOUNCE_DELAY));

    checkbox = document.getElementById("brush-checkbox");
    checkbox.addEventListener("change", onBrushCheck);
}

function onSliderChange(e) {
    let value = Number(e.srcElement.value);
    let minBound = value - EPSILON;
    let maxBound = value + EPSILON;
    renderChart(data.filter(d => minBound <= d.Z && d.Z <= maxBound), _color);

    window.cube.position.z = value * f;
    brush(checkbox.checked);
    requestAnimationFrame(render);

    document.getElementById("z-index-label").textContent = `Z index: ${value}`;

}

function onBrushCheck(e) {
    brush(checkbox.checked);
    requestAnimationFrame(render);
}

function renderLegend(data, color) {
    const options = {
        color,
        title: "Concentration"
    }
    let svgNode = legend(options);
    document.getElementById("legend-wrapper").append(svgNode);
}

function brush(isBrushActive) {
    let filteredData = data.slice();
    filteredData = filteredData.filter(r => r.concentration < Infinity);

    let colors = [];

    const value = window.cube.position.z / f;
    let minBound = value - EPSILON * brushWidth;
    let maxBound = value + EPSILON * brushWidth;
    
    for (const datum of filteredData) {
        if (isBrushActive) {
            if (minBound <= datum.Z && datum.Z <= maxBound) {
                let c1 = new THREE.Color(_color(datum.concentration));
                colors.push(c1.r, c1.g, c1.b);
            }  else {
                let c2 = new THREE.Color(`rgb(${105}, ${105}, ${105})`);
                colors.push(c2.r, c2.g, c2.b);
            }    
        } else {
            let c1 = new THREE.Color(_color(datum.concentration));
            colors.push(c1.r, c1.g, c1.b);
        }
    }
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3));
}
