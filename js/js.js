
import * as THREE from "../modules/three.module.js";
import { OrbitControls } from '../modules/OrbitControls.js';
import mergeBufferGeometries from '../modules/BufferGeometryUtils.js';
import { RGBELoader } from '../modules/RGBELoader.js';


import { EffectComposer } from '../modules/EffectComposer.js';
import { RenderPass } from '../modules/RenderPass.js';
import { OutlinePass } from '../modules/OutlinePass.js';
import { ShaderPass } from '../modules/ShaderPass.js';
import { FXAAShader } from '../modules/FXAAShader.js';

import { randomise, createBranchlist, createGuides, createFlakes} from './utility.js';
import { Point, Line, Branch, Circle } from './objects.js';

/////////////////////////////
//THREE.js    ////////////////

var scene = null;
var renderer = null;
var camera = null;
var controls = null;
var composer = null;

var group = null;
var Geos = null;

///lights
var light, hemLight;

//var clock = new THREE.Clock();

var rorationX = false;
var rorationY = false;
var rorationZ = false;
var wirframeBull = false;
var mergMesh1 = null;

var hdrEquirect = null;
var hdrEquirect_2 = null;
var envMapmaterial = null;
var metalness_map = null;
var roughness_map  = null;
var normal_map  = null;

var pause = false;
var animPause = false;

//var uniformData = null;

var isPlay = true;

var outlinePass;

var loadingScreenElement = document.getElementById('loadingScreen');


// Define the LoadingManager
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
    loadingScreenElement.style.display = 'flex';
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onLoad = function () {
    console.log('Loading complete!');
    // Hide the loading screen after all assets are loaded
    loadingScreenElement.style.display = 'none';
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onError = function (url) {
    console.log('There was an error loading ' + url);
};


function initThreejs() {
    ///////// renderer //////////
    renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // exposure level
    renderer.toneMappingExposure = 0.2;
    // color gradient
    renderer.outputEncoding = THREE.sRGBEncoding;

    // turn on the physically correct lighting model
    renderer.physicallyCorrectLights = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var con5 = document.getElementById("con1");
    con5.appendChild(renderer.domElement);

    ///////// scene //////////
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    ///////// camera //////////
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Retrieve and set the camera state from local storage
    const storedZoom = localStorage.getItem('cameraZoom');
    const storedPosition = localStorage.getItem('cameraPosition');
    const storedRotation = localStorage.getItem('cameraRotation');
    if (storedZoom !== null) {
        camera.zoom = parseFloat(storedZoom);
        camera.updateProjectionMatrix();
    }
    if (storedPosition !== null) {
        const position = JSON.parse(storedPosition);
        camera.position.set(position.x, position.y, position.z);
    }
    if (storedRotation !== null) {
        const rotation = JSON.parse(storedRotation);
        camera.rotation.set(rotation._x, rotation._y, rotation._z);
    }

    ///////// controls //////////
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.minDistance = 1; // how close camera can zoom/dolly in (default = 1)
    controls.maxDistance = 4000; // (default = infinity)
    controls.enableDamping = false; // enable inertia (default = false)
    controls.dampingFactor = 0.01; // lower = less responsive
    controls.autoRotateSpeed = 2.0; // how fast to rotate around target (default = 2)
    controls.zoomSpeed = 0.7; // speed of the zoom/dollying (default = 1)

    group = new THREE.Group();
    scene.add(group);

    // Initialize lights
    initLights();

    // Initialize material
    initMaterial();

    // Set up the post-processing pipeline
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = true; // Ensure the depth buffer is cleared
    composer.addPass(renderPass);

    // Set up FXAA (anti-aliasing)
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    // Add event listener for camera changes
    controls.addEventListener('change', () => {
        localStorage.setItem('cameraZoom', camera.zoom);
        localStorage.setItem('cameraPosition', JSON.stringify(camera.position));
        localStorage.setItem('cameraRotation', JSON.stringify(camera.rotation));
    });
    animate();
}//end initThreejs

function createOutlinePass(scene, camera, selectedObjects) {
    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight),scene,camera);
    outlinePass.edgeStrength = 10.0; // Adjust the edge strength
    outlinePass.edgeGlow = 0.0; // Adjust the edge glow
    outlinePass.edgeThickness = 1.0; // Adjust the edge thickness
    outlinePass.pulsePeriod = 0; // Adjust the pulse period
    outlinePass.visibleEdgeColor.set('#ffffff'); // Set the outline color
    outlinePass.hiddenEdgeColor.set('#000000'); // Set the hidden outline color
    outlinePass.renderToScreen = true; // Ensure the outline is rendered to the screen

    // Add this line to include selected objects
    outlinePass.selectedObjects = selectedObjects;
    return outlinePass;
}//end createOutlinePass
 
function initLights() {
    // Initialize DirectionalLight
    light = new THREE.DirectionalLight(0xfff0dd, 1);
    light.position.set(0, 0, 10);
    scene.add(light);

    // Initialize HemisphereLight
    const upColor = 0xffff80;
    const downColor = 0x4040ff;
    hemLight = new THREE.HemisphereLight(upColor, downColor, 1.0);
    scene.add(hemLight);
}//end initLights

////// animate
function animate() {
    if (isPlay){
        //stats.begin();
        if(!animPause){
            if(!pause){
                requestAnimationFrame(animate);
                // required if controls.enableDamping or controls.autoRotate are set to true
                //controls.update();
                composer.render( scene, camera );
            }
        }else{
            requestAnimationFrame(animate);
            // required if controls.enableDamping or controls.autoRotate are set to true
            //controls.update();
            if(group != undefined){
                if(rorationX){ group.rotation.x += 0.01; }
                if(rorationY){ group.rotation.y += 0.01; }
                if(rorationZ){ group.rotation.z += 0.01; }
                if(wirframeBull){}else{}
                //if(mergMeshBull){group.add(mergMesh1);}else{group.remove(mergMesh1);}
            }
            composer.render( scene, camera );
        }
        //stats.end();
    }
  
 }//end animate

function returnVertexs(f){
    let pf1z = f.size, pf2z = f.size, pb1z = -f.size, pb2z = -f.size;
    let pt1 = f.p1;
    let pt2 = f.p2;
    let pts = f.hexagon.points;
    let vers = [];
    //front

    vers.push({ pos: [pts[3].x, pts[3].y,  0], norm: [ 0,  0,  1], uv: [1, 1], });
    vers.push({ pos: [pts[4].x, pts[4].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });
    vers.push({ pos: [pt1.x,    pt1.y,  pf1z], norm: [ 0,  0,  1], uv: [1, 0], }); //p1  
    
    vers.push({ pos: [pt1.x,    pt1.y,  pf1z], norm: [ 0,  0,  1], uv: [1, 0], }); //p1
    vers.push({ pos: [pts[2].x, pts[2].y,  0], norm: [ 0,  0,  1], uv: [1, 1], }); //p2  
    vers.push({ pos: [pts[3].x, pts[3].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });

    vers.push({ pos: [pts[2].x, pts[2].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });
    vers.push({ pos: [pt1.x,    pt1.y,  pf1z], norm: [ 0,  0,  1], uv: [1, 0], }); //p1
    vers.push({ pos: [pt2.x,    pt2.y,  pf2z], norm: [ 0,  0,  1], uv: [1, 1], }); //p2  

    vers.push({ pos: [pts[2].x, pts[2].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });
    vers.push({ pos: [pt2.x,    pt2.y,  pf2z], norm: [ 0,  0,  1], uv: [1, 1], }); //p1
    vers.push({ pos: [pts[1].x, pts[1].y,  0], norm: [ 0,  0,  1], uv: [1, 0], }); //p2 


    vers.push({ pos: [pts[1].x, pts[1].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });
    vers.push({ pos: [pt2.x,    pt2.y,  pf2z], norm: [ 0,  0,  1], uv: [1, 0], }); //p1
    vers.push({ pos: [pts[0].x, pts[0].y,  0], norm: [ 0,  0,  1], uv: [1, 1], }); //p2  

    vers.push({ pos: [pts[0].x, pts[0].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });
    vers.push({ pos: [pt2.x,    pt2.y,  pf2z], norm: [ 0,  0,  1], uv: [1, 0], }); //p1
    vers.push({ pos: [pts[5].x, pts[5].y,  0], norm: [ 0,  0,  1], uv: [1, 1], }); //p2  

    vers.push({ pos: [pts[5].x, pts[5].y,  0], norm: [ 0,  0,  1], uv: [0, 1], });
    vers.push({ pos: [pt2.x,    pt2.y,  pf2z], norm: [ 0,  0,  1], uv: [1, 1], }); //p1
    vers.push({ pos: [pts[4].x, pts[4].y,  0], norm: [ 0,  0,  1], uv: [0, 0], }); //p2  

    vers.push({ pos: [pts[4].x, pts[4].y,  0], norm: [ 0,  0,  1], uv: [0, 0], });
    vers.push({ pos: [pt2.x,    pt2.y,  pf2z], norm: [ 0,  0,  1], uv: [1, 1], }); //p1
    vers.push({ pos: [pt1.x,    pt1.y,  pf1z], norm: [ 0,  0,  1], uv: [1, 0], }); //p2  
    /////////////////
    vers.push({ pos: [pts[3].x, pts[3].y,  0], norm: [ 0,  0,  -1], uv: [1, 1], });
    vers.push({ pos: [pt1.x,    pt1.y,  pb1z], norm: [ 0,  0,  -1], uv: [1, 0], }); //p1/
    vers.push({ pos: [pts[4].x, pts[4].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
     
    
    vers.push({ pos: [pt1.x,    pt1.y,  pb1z], norm: [ 0,  0,  -1], uv: [1, 0], }); //p1
    vers.push({ pos: [pts[3].x, pts[3].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
    vers.push({ pos: [pts[2].x, pts[2].y,  0], norm: [ 0,  0,  -1], uv: [1, 1], }); //p2/  
    

    vers.push({ pos: [pts[2].x, pts[2].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
    vers.push({ pos: [pt2.x,    pt2.y,  pb2z], norm: [ 0,  0,  -1], uv: [1, 1], }); //p2
    vers.push({ pos: [pt1.x,    pt1.y,  pb1z], norm: [ 0,  0,  -1], uv: [1, 0], }); //p1/
      

    vers.push({ pos: [pts[2].x, pts[2].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
    vers.push({ pos: [pts[1].x, pts[1].y,  0], norm: [ 0,  0,  -1], uv: [1, 0], }); //p2 
    vers.push({ pos: [pt2.x,    pt2.y,  pb2z], norm: [ 0,  0,  -1], uv: [1, 1], }); //p1/
   


    vers.push({ pos: [pts[1].x, pts[1].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
    vers.push({ pos: [pts[0].x, pts[0].y,  0], norm: [ 0,  0,  -1], uv: [1, 1], }); //p2 
    vers.push({ pos: [pt2.x,    pt2.y,  pb2z], norm: [ 0,  0,  -1], uv: [1, 0], }); //p1/
    

    vers.push({ pos: [pts[0].x, pts[0].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
    vers.push({ pos: [pts[5].x, pts[5].y,  0], norm: [ 0,  0,  -1], uv: [1, 1], }); //p2
    vers.push({ pos: [pt2.x,    pt2.y,  pb2z], norm: [ 0,  0,  -1], uv: [1, 0], }); //p1/
     

    vers.push({ pos: [pts[5].x, pts[5].y,  0], norm: [ 0,  0,  -1], uv: [0, 1], });
    vers.push({ pos: [pts[4].x, pts[4].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], }); //p2 
    vers.push({ pos: [pt2.x,    pt2.y,  pb2z], norm: [ 0,  0,  -1], uv: [1, 1], }); //p1/
     

    vers.push({ pos: [pts[4].x, pts[4].y,  0], norm: [ 0,  0,  -1], uv: [0, 0], });
    vers.push({ pos: [pt1.x,    pt1.y,  pb1z], norm: [ 0,  0,  -1], uv: [1, 0], }); //p2 
    vers.push({ pos: [pt2.x,    pt2.y,  pb2z], norm: [ 0,  0,  -1], uv: [1, 1], }); //p1/
    
    

return vers;
}//end returnVertexs

function initMaterial() {

    metalness_map = new THREE.TextureLoader(manager).load('./textures/pbr/metallic.jpg');
    roughness_map = new THREE.TextureLoader(manager).load('./textures/pbr/roughness.jpg');
    normal_map = new THREE.TextureLoader(manager).load('./textures/pbr/Water_0175normal.jpg');
    //let normal_map = new THREE.TextureLoader().load('./textures/pbr/normal.jpg');
    
    hdrEquirect = new RGBELoader(manager).load(
        "./textures/envMap/kloppenheim_06_puresky_4k.hdr",  
        () => { 
            hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
            scene.background = hdrEquirect;
        }
    );
    

    hdrEquirect_2 = new RGBELoader(manager).load(
        "./textures/envMap/snowy_park_01_4k.hdr",  
        () => { 
            hdrEquirect_2.mapping = THREE.EquirectangularReflectionMapping; 
            
        }
    );
    
    envMap(hdrEquirect); 
}//createMateral

function envMap(img){
    envMapmaterial = new THREE.MeshPhysicalMaterial({  
        transmission: 1.0,  
        thickness: 3.5, // Add refraction!

        envMap: img,
        envMapIntensity: 3.0,

        roughnessMap: roughness_map,
        roughness: 0.2, 

        normalMap: normal_map,
        normalScale: new THREE.Vector2(1,1), 

        metalnessMap: metalness_map,
        metalness: 0.5,
    });
}//end envMap

function drawBufferMesh(flakes, dataObj) {
    Geos = [];

    for (const flake of flakes) {
        let vertices = returnVertexs(flake);
        const positions = [];
        const normals = [];
        const uvs = [];
        for (const vertex of vertices) {
            positions.push(...vertex.pos);
            normals.push(...vertex.norm);
            uvs.push(...vertex.uv);
        }
        const geometry = new THREE.BufferGeometry();
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        geometry.computeVertexNormals();
        Geos.push(geometry);
    }

    const mergedGeometries = mergeBufferGeometries.mergeBufferGeometries(Geos);
    mergedGeometries.computeVertexNormals();

    const mergedMesh = new THREE.Mesh(mergedGeometries, envMapmaterial);
    mergedMesh.dynamic = true;
    mergedMesh.material.needsUpdate = true
    /////////////
    if(dataObj.envMTog){
        mergedMesh.material.colorWrite = false;
    }else{
        mergedMesh.material.colorWrite = true;
    }
    
    mergedMesh.material.depthWrite = true;
    mergedMesh.material.depthTest = true;
    /////////////

    if (group != null) {
        while (group.children.length > 0) {
            group.remove(group.children[0]);
        }
    }
    group.add(mergedMesh);

    let linewidth = 4;
    let dept = 0.5;
    if(dataObj.guideTog){
        // Draw lines from dataObj.LBOs
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: linewidth});
        for (const line of dataObj.LBOs) {
            const points = [];
            points.push(new THREE.Vector3(line.p1.x, line.p1.y, dept));
            points.push(new THREE.Vector3(line.p2.x, line.p2.y, dept));
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
            group.add(lineMesh);
        }
    }

    if (dataObj.radiusTog) {
        // Draw circles from dataObj.Circle
        const circleMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: linewidth });
        for (const circle of dataObj.circles) {
            const circleGeometry = new THREE.CircleGeometry(circle.r, 32);
            // Extract the vertices from the geometry
            const positions = circleGeometry.getAttribute('position').array;
            const vertices = [];
            for (let i = 3; i < positions.length; i += 3) {
                vertices.push(new THREE.Vector3(positions[i], positions[i + 1], dept));
            }
            const circleOutlineGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
            const circleMesh = new THREE.LineLoop(circleOutlineGeometry, circleMaterial);
            circleMesh.position.set(circle.p.x, circle.p.y, 0);
            group.add(circleMesh);
        }
    }
    
    //console.log(scene.children);
}//end drawBufferMesh

////////////////////////////////

/*jshint esversion: 6 */
document.addEventListener("DOMContentLoaded", () => {
    var dataObj;
    var flakes = [];

    //var angList3 = [-60, 0, 60, 120, 180, -120];
    //var angList3 = [270, 330, 30, 90, 150, 210];
    var angList3 = [-90, -30, 30, 90, 150, -150];
    //var sw = (window.innerWidth/2)/50, sh = (window.innerHeight / 2)/50;
    
    const centerP = new Point(0, 0);
    var branchL = 2;
    var scale = 0.5;
    var idCount = 0;
    var shortPoint = [];
    var closest_intersection = [];
    var check = [];
    var peak = [];
    var peakLine = [];

////////////////////////////////////

//Menu functions ///////////////////

function Collapsible(i, text, inId, spId){ 
    let val =  Number(document.getElementById(inId).value); 
    switch(text){
        case "Length ": 
        let BOsTemp = [];
        BOsTemp.push(new Branch(centerP, i == 0 ? val / 100 : dataObj.BOs[0].len, dataObj.BOs[0].size, dataObj.BOs[0].ofs));
        
        for (let j = 1; j < dataObj.level; j++) {
            BOsTemp.push(
                new Branch(
                    BOsTemp[BOsTemp.length - 1].endPoint(),
                    i == j ? val / 100 : dataObj.BOs[j].len,
                    dataObj.BOs[j].size,
                    dataObj.BOs[j].ofs
                )
            );
        }
        
        dataObj.BOs = BOsTemp;
        break;
        case "Size ":
            dataObj.BOs[i] = new Branch(
                dataObj.BOs[i].startPoint,
                dataObj.BOs[i].len,
                val/100,
                dataObj.BOs[i].ofs
            );
        break;
        case "Offset ":
            dataObj.BOs[i] = new Branch(
                dataObj.BOs[i].startPoint,
                dataObj.BOs[i].len,
                dataObj.BOs[i].size,
                val
            );
        break;
        default:
        break;
    } 
   
    document.getElementById(spId).innerHTML = text+(i+1)+":"+val;
    update();
}//end Collapsible

function populatyeCollapsible(){
    let coll1 = document.getElementById("coll1");
    let coll2 = document.getElementById("coll2");
    let coll3 = document.getElementById("coll3");
      
    for(let i=0;i<12;i++){
        var DIV = document.createElement("DIV");
        DIV.setAttribute("class", "flex-container");   
        var SPAN = document.createElement("SPAN");
        SPAN.setAttribute("id", "spanl"+(i+1));
        SPAN.setAttribute("class", "spanClass");
        SPAN.innerHTML = "Length "+(i+1)+":";
        var INPUT = document.createElement("INPUT");
        INPUT.setAttribute("id", "inputl"+(i+1));
        INPUT.setAttribute("class", "slider");
        INPUT.setAttribute("type", "range");
        INPUT.setAttribute("min", 5);
        INPUT.setAttribute("max", 400);
        INPUT.setAttribute("value", 200);

        DIV.appendChild(SPAN);
        DIV.appendChild(INPUT);
        coll1.appendChild(DIV);

        INPUT.addEventListener('input',(e)=>{
            Collapsible(i, "Length ", "inputl"+(i+1), "spanl"+(i+1));
        });
    }

    for(let i=0;i<12;i++){
        var DIV = document.createElement("DIV");
        DIV.setAttribute("class", "flex-container");  
        var SPAN = document.createElement("SPAN");
        SPAN.setAttribute("id", "spanS"+(i+1));
        SPAN.setAttribute("class", "spanClass");
        SPAN.innerHTML = "Size "+(i+1)+":";
        var INPUT = document.createElement("INPUT");
        INPUT.setAttribute("id", "inputS"+(i+1));
        INPUT.setAttribute("class", "slider");
        INPUT.setAttribute("type", "range");
        INPUT.setAttribute("min", 14-i);
        INPUT.setAttribute("max", 100);
        INPUT.setAttribute("value", 50);

        DIV.appendChild(SPAN);
        DIV.appendChild(INPUT);
        coll2.appendChild(DIV);

        INPUT.addEventListener('input',(e)=>{
            Collapsible(i, "Size ", "inputS"+(i+1), "spanS"+(i+1));
        });
    }

    for(let i=0;i<12;i++){
        var DIV = document.createElement("DIV");
        DIV.setAttribute("class", "flex-container");
        var SPAN = document.createElement("SPAN");
        SPAN.setAttribute("id", "spanO"+(i+1));
        SPAN.setAttribute("class", "spanClass");
        SPAN.innerHTML = "Offset "+(i+1)+":";
        var INPUT = document.createElement("INPUT");
        INPUT.setAttribute("id", "inputO"+(i+1));
        INPUT.setAttribute("class", "slider");
        INPUT.setAttribute("type", "range");
        INPUT.setAttribute("min", 0);
        INPUT.setAttribute("max", 50);
        INPUT.setAttribute("value", 25);

        DIV.appendChild(SPAN);
        DIV.appendChild(INPUT);
        coll3.appendChild(DIV);

        INPUT.addEventListener('input',(e)=>{
            Collapsible(i, "Offset ", "inputO"+(i+1), "spanO"+(i+1));
        });
    }

}//end populatyeCollapsible

function MD(){ 
    if(!animPause){
        if(pause){
            pause = false;
            //console.log("Unpaused!"); 
            animate();   
        } 
    }  
}//end MUD

function MU(){
    if(!animPause){
        if(!pause){
            pause = true;
            //console.log("Paused!");
            animate();
        }
    }
}//end MUD

function updatePause(){
    if(animPause){
        Pause.value = "Play";
        animPause = false;     
    }else{
        Pause.value = "Pause";
        animPause = true;
    }
}//end updatePause

window.onload = function(){

    document.body.addEventListener("mouseup", MU);
    document.body.addEventListener("mousedown", MD);
    document.body.addEventListener("wheel", MD);

    var ttb1 = document.getElementById("ttb1");
    ttb1.addEventListener('click',(e)=>{
        Pause.value = "Pause";
        animPause = true;
        if(rorationX){
            rorationX = false;
        }else{
            rorationX = true;
        }
        ttb1.value = "Rotation X: "+rorationX;
        updateToggels(ttb1, rorationX);
    });

    var ttb2 = document.getElementById("ttb2");
    ttb2.addEventListener('click',(e)=>{
        Pause.value = "Pause";
        animPause = true;
        if(rorationY){
            rorationY = false;
        }else{
            rorationY = true;
        }
        ttb2.value = "Rotation Y: "+rorationY;
        updateToggels(ttb2, rorationY);
    });

    var ttb3 = document.getElementById("ttb3");
    ttb3.addEventListener('click',(e)=>{
        Pause.value = "Pause";
        animPause = true;
        if(rorationZ){
            rorationZ = false;
        }else{
            rorationZ = true;
        }
        ttb3.value = "Rotation Z: "+rorationZ;
        updateToggels(ttb3, rorationZ);
    });

    var ttb4 = document.getElementById("ttb4");
    ttb4.addEventListener('click',(e)=>{
        rorationX = false;
        rorationY = false;
        rorationZ = false;
        ttb1.value = "Rotation X: "+rorationX;
        updateToggels(ttb1, rorationX);
        ttb2.value = "Rotation Y: "+rorationY;
        updateToggels(ttb2, rorationY);
        ttb3.value = "Rotation Z: "+rorationZ;
        updateToggels(ttb3, rorationZ);
        if(group != undefined ){
            group.rotation.x = 0;
            group.rotation.y = 0;
            group.rotation.z = 0;
        }
        update();
        Pause.value = "Play";
        animPause = false;
    });

    var Pause = document.getElementById("Pause");
    Pause.addEventListener('click',(e)=>{ 
        updatePause();
    });

/*
    var wireframeT = document.getElementById("wireframeT");
    wireframeT.addEventListener('click',(e)=>{
        if(wirframeBull){
            wirframeBull = false;
        }else{
            wirframeBull = true;
        }
        wireframeT.value = "Wireframe: "+wirframeBull;
        updateToggels(wireframeT, wirframeBull);
    });
    var MeshT = document.getElementById("MeshT");
    MeshT.addEventListener('click',(e)=>{
        if(mergMeshBull){
            mergMeshBull = false;
        }else{
            mergMeshBull = true;
        }
        MeshT.value = "Mesh: "+mergMeshBull;
        updateToggels(MeshT, mergMeshBull);
    });
*/

    //tab1
    //Collapsible ///////////////
    populatyeCollapsible();

    /////////////////////

    var levelS = document.getElementById("levelS");
    var levelL = document.getElementById("levelL");
    levelS.addEventListener('input',(e)=>{
        dataObj.level = levelS.value;
        levelL.innerHTML = "Level "+ dataObj.level;
        dataObj.BOs = createBranchlist(dataObj.BOs, dataObj.level, scale, branchL, centerP);
        update();     
    });

    var cropS = document.getElementById("cropS");
    var cropL = document.getElementById("cropL");
    cropS.addEventListener('input',(e)=>{
        dataObj.cropAngel = cropS.value;
        cropL.innerHTML = "Crop-angle "+ dataObj.cropAngel;
        update();
    });

    var spaceS = document.getElementById("spaceS");
    var spaceL = document.getElementById("spaceL");
    spaceS.addEventListener('input',(e)=>{
        dataObj.SpaceLines = spaceS.value;
        spaceL.innerHTML = "Line-space "+ dataObj.SpaceLines;
        update();
    });

    var tb1 = document.getElementById("tb1");
    tb1.addEventListener('click',(e)=>{
        if(dataObj.singleTog == false){
    		dataObj.singleTog = true;
    	}else{
            dataObj.singleTog = false;
        }
        tb1.value = "TogSingle "+dataObj.singleTog;
        updateToggels(tb1, dataObj.singleTog);
        update();
    });

    var tb2 = document.getElementById("tb2");
    tb2.addEventListener('click',(e)=>{
      	if(dataObj.mirrorTog == false){
    		dataObj.mirrorTog = true;
    	}else{
            dataObj.mirrorTog = false;
        }
        tb2.value = "TogMirror "+dataObj.mirrorTog;
        updateToggels(tb2, dataObj.mirrorTog);
        update();
    });

    var tb3 = document.getElementById("tb3");
    tb3.addEventListener('click',(e)=>{
      	if(dataObj.guideTog == false){
    		dataObj.guideTog = true;
    	}else{
            dataObj.guideTog = false;
        }
        tb3.value = "TogGuides "+dataObj.guideTog;
        updateToggels(tb3, dataObj.guideTog);
        update();
    });

    var tb4 = document.getElementById("tb4");
    tb4.addEventListener('click',(e)=>{
      	if(dataObj.radiusTog == false){
    		dataObj.radiusTog = true;
    	}else{
            dataObj.radiusTog = false;
        }
        tb4.value = "TogRadius "+dataObj.radiusTog;
        updateToggels(tb4, dataObj.radiusTog);
        update();
    });

    //////////////////////////////

    var tb6 = document.getElementById("tb6");
    tb6.addEventListener('click',(e)=>{
        dataObj.BOs = randomise("all", centerP, dataObj.BOs, dataObj.level);
        update();
    });

    var tb7 = document.getElementById("tb7");
    tb7.addEventListener('click',(e)=>{
        dataObj.BOs = randomise("length", centerP, dataObj.BOs, dataObj.level);
        update();
    });

    var tb8 = document.getElementById("tb8");
    tb8.addEventListener('click',(e)=>{
        dataObj.BOs = randomise("size", centerP, dataObj.BOs, dataObj.level);
        update();
    });
    var tb9 = document.getElementById("tb9");
    tb9.addEventListener('click',(e)=>{
        dataObj.BOs = randomise("offset", centerP, dataObj.BOs, dataObj.level);
        update();
    });

    var ReF = document.getElementById("Refresh");
    ReF.addEventListener('click',(e)=>{
        sessionStorage.clear();
        location.reload();
    });

    var fi = document.getElementById("my_file");
    fi.addEventListener('change',(e)=>{
        var fr = new FileReader();
        fr.readAsText(fi.files[0]);
        fr.addEventListener('load', () => {
            let url = fr.result;
            var data = decodeURIComponent(url);
            let dOBJ = JSON.parse(data);
            sessionStorage.setItem("dataObjStr", JSON.stringify(dOBJ));
            sessionStorageDecodeArray();
            update();
        });
    });

    var menuC = document.getElementById("menuC"); //closeNav()
    menuC.addEventListener('click',(e)=>{
        document.getElementById("mySidenav").style.width = "0";
        document.body.style.backgroundColor = "white";
        menuO.style.display = "block";
    });

    var menuO = document.getElementById("menuO"); //openNav()
    menuO.addEventListener('click',(e)=>{
        document.getElementById("mySidenav").style.width = "250px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
        menuO.style.display = "none";
    });

    ////////////////////// material
    var roughS = document.getElementById("roughS");
    var roughL = document.getElementById("roughL");
    roughS.addEventListener('input',(e)=>{
        dataObj.roughness = roughS.value;
        roughL.innerHTML = "Roughness "+ dataObj.roughness;
        envMapmaterial.roughness = dataObj.roughness;
    });

    var metalS = document.getElementById("metalS");
    var metalL = document.getElementById("metalL");
    metalS.addEventListener('input',(e)=>{
        dataObj.metalness = metalS.value;
        metalL.innerHTML = "Metalness "+ dataObj.metalness;
        envMapmaterial.metalness = dataObj.metalness;
    });

    var transmisS = document.getElementById("transmisS");
    var transmisL = document.getElementById("transmisL");
    transmisS.addEventListener('input',(e)=>{
        dataObj.transmission = transmisS.value;
        transmisL.innerHTML = "Transmission "+ dataObj.transmission;
        envMapmaterial.transmission = dataObj.transmission;
    });

    // Add event listener for envMapIntensity control
    var envRS = document.getElementById("envRS");
    var envRL = document.getElementById("envRL");
    envRS.addEventListener('input', (e) => {
        dataObj.envReflection = envRS.value;
        envRL.innerHTML = "Env Reflection "+dataObj.envReflection;
        envMapmaterial.envMapIntensity = dataObj.envReflection; 
    });

    var envS = document.getElementById("envS");
    envS.addEventListener('click',(e)=>{
        if(dataObj.envSwitch == 1){
            dataObj.envSwitch = 2;
            scene.background = null; 
            scene.background =  hdrEquirect_2
            envMap(hdrEquirect_2);
        }else{
            dataObj.envSwitch = 1;
            scene.background = null; 
            scene.background =  hdrEquirect
            envMap(hdrEquirect);
        }
        envS.value = "Env Map "+dataObj.envSwitch;
        updateToggels(envS, dataObj.envSwitch);
        update()       
  });

    var envB = document.getElementById("envB");
    envB.addEventListener('click',(e)=>{
      	if(dataObj.envBTog == false){
    		dataObj.envBTog = true;
            envS.disabled = true; // Disable envS button
            scene.background = null; // Hide the background
    	}else{
            dataObj.envBTog = false;
            envS.disabled = false; // Enable envS button
            if(dataObj.envSwitch == 1){
                scene.background = null; 
                scene.background = hdrEquirect; // Show the background
                envMap(hdrEquirect);
            }else{
                scene.background = null;
                scene.background = hdrEquirect_2; // Show the background
                envMap(hdrEquirect_2);
            }
        }
        envB.value = "Env Background "+dataObj.envBTog;
        updateToggels(envB, dataObj.envBTog);
        composer.render(scene, camera);       
    });

    var envM = document.getElementById("envM");
    envM.addEventListener('click',(e)=>{
        group.children.forEach(child => {
            if (child.isMesh) {
                if(dataObj.envMTog){
                    dataObj.envMTog = false;
                    child.material.colorWrite = true;
                    // Optionally, update other material properties if needed
                }else{
                    dataObj.envMTog = true;
                    child.material.colorWrite = false;
                    // Optionally, update other material properties if needed 
                }
            }
        });
        envM.value = "Env Model "+dataObj.envMTog;
        updateToggels(envM, dataObj.envMTog);
        composer.render(scene, camera); // Re-render the scene     
    });     


    var outL = document.getElementById("outL");
    outL.addEventListener('click',(e)=>{
        if (dataObj.outLTog) {
            dataObj.outLTog = false;
            composer.removePass(outlinePass);
        } else {
            dataObj.outLTog = true;
            if (!outlinePass) {
                const selectedObjects = [group.children[0]];
                outlinePass = createOutlinePass(scene, camera, selectedObjects);
                outlinePass.selectedObjects = [group]; // Assuming 'group' contains the models to be outlined
            }
            composer.addPass(outlinePass);
        }
        outL.value = "Outline Effect "+dataObj.outLTog;
        updateToggels(outL, dataObj.outLTog);
        composer.render(scene, camera); 
    });

    // Add event listener for exposure control
    /*
    var envBS = document.getElementById("envBS");
    var envBL = document.getElementById("envBL");
    envBS.addEventListener('input', (e) => {
        renderer.toneMappingExposure = envBS.value;
        envBL.innerHTML = "Env Background "+envBS.value;
    });
    */

    ////////////////////// light
    // Add event listeners for the sliders and color pickers
    var DLIntensityS = document.getElementById("DLIntensityS");
    var DLIntensityL = document.getElementById("DLIntensityL");
    DLIntensityS.addEventListener('input',(e)=>{
        dataObj.DLIntensity = DLIntensityS.value;
        DLIntensityL.innerHTML = "Light Intensity "+ dataObj.DLIntensity;

        light.intensity = dataObj.DLIntensity;
    });

    var DLColorS = document.getElementById("DLColorS");
    var DLColorL = document.getElementById("DLColorL");
    DLColorS.addEventListener('input',(e)=>{
        dataObj.DLColor = DLColorS.value;
        light.color.set(dataObj.DLColor);
    });

    var HLIntensityS = document.getElementById("HLIntensityS");
    var HLIntensityL = document.getElementById("HLIntensityL");
    HLIntensityS.addEventListener('input',(e)=>{
        dataObj.HLIntensity = HLIntensityS.value;
        HLIntensityL.innerHTML = "Hem L Intensity "+ dataObj.HLIntensity;
        hdrEquirect.intensity = dataObj.HLIntensity;
        hemLight.intensity = dataObj.HLIntensity;
    });

    var HLUpColorS = document.getElementById("HLUpColorS");
    var HLUpColorL = document.getElementById("HLUpColorL");
    HLUpColorS.addEventListener('input',(e)=>{
        dataObj.HLUpColor = HLUpColorS.value;
        hemLight.color.set(dataObj.HLUpColor);
    });

    var HLDownColorS = document.getElementById("HLDownColorS");
    var HLDownColorL = document.getElementById("HLDownColorL");
    HLDownColorS.addEventListener('input',(e)=>{
        dataObj.HLDownColor = HLDownColorS.value;
        hemLight.groundColor.set(dataObj.HLDownColor);
    });

    /////save/////////////////////
    var Save = document.getElementById("Save");
    //https://www.sanwebe.com/snippet/downloading-canvas-as-image-dataurl-on-button-click
    Save.addEventListener('click',(e)=>{
        console.log(renderer);
        var image = renderer.domElement.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let link = document.createElement('a');
        link.download = "my-image.png";
        link.href = image;
        link.click();
    });

    var SaveJson = document.getElementById("SaveJson");
    SaveJson.addEventListener('click',(e)=>{
        let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj));
        let link = document.createElement("a");
        link.download = "user_file.json";
        link.href = data;
        link.click();
    });

    var LoadJson = document.getElementById("LoadJson");
    LoadJson.addEventListener('click',(e)=>{
        document.getElementById('my_file').click();
    });

//Start Call ///////////////////
initialize();
};//end onload

function sessionStorageSaveArray(){
    sessionStorage.setItem("dataObjStr", JSON.stringify(dataObj));
}//end sessionStorageArray

function sessionStorageDecodeArray(){
    if(sessionStorage.getItem("dataObjStr") != null){
        let dataObjStr = JSON.parse(sessionStorage.getItem("dataObjStr"));
        //BOs   
        dataObj.BOs = [];
        for(let i=0;i<dataObjStr.BOs.length;i++){
            dataObj.BOs.push(
                new Branch(
                    new Point(dataObjStr.BOs[i].startPoint.x, dataObjStr.BOs[i].startPoint.y),
                    dataObjStr.BOs[i].len,
                    dataObjStr.BOs[i].size,
                    dataObjStr.BOs[i].ofs
                )
            );
        }
        //LBOs
        dataObj.LBOs = [];
        for(let i=0;i<dataObjStr.LBOs.length;i++){
            dataObj.LBOs.push(
                new Line(
                    new Point(dataObjStr.LBOs[i].p1.x, dataObjStr.LBOs[i].p1.y),
                    new Point(dataObjStr.LBOs[i].p2.x, dataObjStr.LBOs[i].p2.y)
                )
            );
        }
        //level
        dataObj.level = dataObjStr.level;
        levelL.innerHTML = "Level "+ dataObj.level;
        levelS.value = dataObj.level;

        //////////////Guides:
        //cropAngel
        dataObj.cropAngel = dataObjStr.cropAngel;
        cropL.innerHTML = "Crop-angle "+ dataObj.cropAngel;
        cropS.value = dataObj.cropAngel;

        //SpaceLines
        dataObj.SpaceLines = dataObjStr.SpaceLines;
        spaceL.innerHTML = "Line-space "+ dataObj.SpaceLines;
        spaceS.value = dataObj.SpaceLines;

        //singleTog
        dataObj.singleTog = dataObjStr.singleTog;
        tb1.value = "TogSingle "+dataObj.singleTog;
        updateToggels(tb1, dataObj.singleTog);
        
        //mirrorTog
        dataObj.mirrorTog = dataObjStr.mirrorTog;
        tb2.value = "TogMirror "+dataObj.mirrorTog;
        updateToggels(tb2, dataObj.mirrorTog);

        //guideTog
        dataObj.guideTog = dataObjStr.guideTog;
        tb3.value = "TogGuides "+dataObj.guideTog;
        updateToggels(tb3, dataObj.guideTog);

        //radiusTog
        dataObj.radiusTog = dataObjStr.radiusTog;
        tb4.value = "TogRadius "+dataObj.radiusTog;
        updateToggels(tb4, dataObj.radiusTog);

        //circles
        if(dataObjStr.circles != null){
            dataObj.circles = [];
            dataObj.circles = [];
            for(let i=0;i<dataObjStr.circles.length;i++){
                dataObj.circles.push(
                new Circle(dataObjStr.circles[i].p, dataObjStr.circles[i].r)
                );
            }
        }

        //////////////Material Control:
        //roughness
        dataObj.roughness = dataObjStr.roughness;
        roughL.innerHTML = "Roughness "+ dataObj.roughness;
        roughL.value = dataObj.roughness;

        //metalness
        dataObj.metalness = dataObjStr.metalness;
        metalL.innerHTML = "Metalness "+ dataObj.metalness;
        metalS.value = dataObj.metalness;

        //transmission
        dataObj.transmission = dataObjStr.transmission;
        transmisL.innerHTML = "Transmission "+ dataObj.transmission;
        transmisS.value = dataObj.transmission;

        //envReflection
        dataObj.envReflection = dataObjStr.envReflection;
        envRL.innerHTML = "Env Reflection "+dataObj.envReflection;
        envRS.value = dataObj.envReflection;

        //envSwitch
        dataObj.envSwitch = dataObjStr.envSwitch;
        envS.value = "Env Map "+dataObj.envSwitch;
        updateToggels(envS, dataObj.envSwitch);

        //envBTog
        dataObj.envBTog = dataObjStr.envBTog;
        envB.value = "Env Background "+dataObj.envBTog;
        updateToggels(envB, dataObj.envBTog);
 
        //outLTog
        dataObj.outLTog = dataObjStr.outLTog;
        outL.value = "Outline Effect "+dataObj.outLTog;
        updateToggels(outL, dataObj.outLTog);

        //////////////Light Control:
        //DLIntensity
        dataObj.DLIntensity = dataObjStr.DLIntensity;
        DLIntensityL.innerHTML = "Light Intensity "+ dataObj.DLIntensity;
        DLIntensityS.value = dataObj.DLIntensity;

        //DLColor
        dataObj.DLColor = dataObjStr.DLColor;
        DLColorS.value = decimalToHex(dataObj.DLColor);

        //HLIntensity
        dataObj.HLIntensity = dataObjStr.HLIntensity;
        HLIntensityL.innerHTML = "Hem L Intensity "+ dataObj.HLIntensity;
        HLIntensityS.value = dataObj.HLIntensity;

        //HLUpColor
        dataObj.HLUpColor = dataObjStr.HLUpColor;
        HLUpColorS.value = decimalToHex(dataObj.HLUpColor);

        //HLDownColor
        dataObj.HLDownColor = dataObjStr.HLDownColor;
        HLDownColorS.value = decimalToHex(dataObj.HLDownColor);
    }
}//end sessionStorageArray

//Init   ///////////////////
function initialize(){ 
    dataObj = {
        "BOs": null,
        "LBOs": null,
        "level": 3,
        "cropAngel": 40,
        "SpaceLines": 0,
        "singleTog": false,
        "mirrorTog": true,
        "guideTog": false, 
        "radiusTog": false,
        "circles": null,
        "roughness": 0.2,
        "metalness": 0.5,
        "transmission": 1.0,
        "envReflection": 3.0,
        "envSwitch": 1,
        "envBTog": false,
        "envMTog": false,
        "DLIntensity": 1.0,
        "DLColor": 0xfff0dd,
        "HLIntensity": 1.0,
        "HLUpColor": 0xffff80,
        "HLDownColor": 0x4040ff,
        "outLTog": false
    };
    let arr = [];
    arr.push(new Branch(centerP, branchL, scale, 25));
    for (let i = 1; i < dataObj.level ; i++) {
        arr.push(new Branch(arr[arr.length-1].endPoint(), branchL, scale, 25));
    }
    dataObj.BOs = arr;

    initThreejs();
    sessionStorageDecodeArray();
    updateLight();
    updateMaterial();   
    update();
}//end init

//Material ///////////////////
function updateMaterial(){
    ////////////
    roughS.value = dataObj.roughness;
    roughL.innerHTML = "Roughness "+ dataObj.roughness;
    envMapmaterial.roughness = dataObj.roughness;
    ////////////
    metalS.value = dataObj.metalness;
    metalL.innerHTML = "Metalness "+ dataObj.metalness;
    envMapmaterial.metalness = dataObj.metalness;
    ////////////
    transmisS.value = dataObj.transmission;
    transmisL.innerHTML = "Transmission "+ dataObj.transmission;
    envMapmaterial.transmission = dataObj.transmission;
    ////////////
    envRS.value = dataObj.envReflection;
    envRL.innerHTML = "Env Reflection "+dataObj.envReflection;
    envMapmaterial.envMapIntensity = dataObj.envReflection; 

    ////////////
    envS.value = "Env Map "+dataObj.envSwitch;
    updateToggels(envS, dataObj.envSwitch);
    if(dataObj.envSwitch == 1){
        scene.background = null; 
        scene.background = hdrEquirect; // Show the background
        envMap(hdrEquirect);
    }else{ 
        scene.background = null;
        scene.background = hdrEquirect_2; // Show the background
        envMap(hdrEquirect_2);
    }
    
    ////////////  
    envB.value = "Env Background "+dataObj.envBTog;
    updateToggels(envB, dataObj.envBTog);
    if(dataObj.envBTog){
        scene.background = null; // Hide the background
    }else{
        if(dataObj.envSwitch == 1){
            scene.background = null; 
            scene.background = hdrEquirect; // Show the background
            envMap(hdrEquirect);
        }else{
            scene.background = null;
            scene.background = hdrEquirect_2; // Show the background
            envMap(hdrEquirect_2);
        }
    } 
    
    ////////////        
    envM.value = "Env Model "+dataObj.envMTog;
    updateToggels(envM, dataObj.envMTog);
    group.children.forEach(child => {
        if (child.isMesh) {
            if(dataObj.envMTog){
                child.material.colorWrite = false;
            }else{
                child.material.colorWrite = true;
            }
        }
    });

    ////////////
    outL.value = "Outline Effect "+dataObj.outLTog;
    updateToggels(outL, dataObj.outLTog);
    if (dataObj.outLTog) {
        if (!outlinePass) {
            const selectedObjects = [group.children[0]];
            outlinePass = createOutlinePass(scene, camera, selectedObjects);
            outlinePass.selectedObjects = [group]; // Assuming 'group' contains the models to be outlined
        }
        composer.addPass(outlinePass);
        composer.render(scene, camera);
    } else {
        composer.removePass(outlinePass);
        composer.render(scene, camera); 
    }
}//end updateMaterial

//Lights ///////////////////
function updateLight(){
    DLIntensityS.value = dataObj.DLIntensity;
    DLIntensityL.innerHTML = "Light Intensity "+ dataObj.DLIntensity;
    light.intensity = dataObj.DLIntensity;

    DLColorS.value = decimalToHex(dataObj.DLColor);
    light.color.set(decimalToHex(dataObj.DLColor));

    HLIntensityS.value = dataObj.HLIntensity;
    HLIntensityL.innerHTML = "Hem L Intensity "+ dataObj.HLIntensity;
    hemLight.intensity = dataObj.HLIntensity;

    HLUpColorS.value = decimalToHex(dataObj.HLUpColor);
    hemLight.color.set(decimalToHex(dataObj.HLUpColor));

    HLDownColorS.value = decimalToHex(dataObj.HLDownColor);
    hemLight.groundColor.set(decimalToHex(dataObj.HLDownColor));
}//end updateMaterial

function decimalToHex(decimal) {
    return `#${decimal.toString(16).padStart(6, '0')}`;
}

//Update   ///////////////////
function update(){
    createGuides(dataObj, centerP);
    sessionStorageSaveArray();
    createFlakes(dataObj, flakes, scale, centerP, angList3, peakLine, peak, check, closest_intersection, shortPoint, idCount);
    updateCollapsible();
    drawBufferMesh(flakes, dataObj);
    composer.render(scene, camera);
}//end update


function updateCollapsible(init) {
    // Get the child nodes of the collapsible elements
    let elist1 = document.getElementById("coll1").childNodes;
    let elist2 = document.getElementById("coll2").childNodes;
    let elist3 = document.getElementById("coll3").childNodes;
    let count = 1;

    // Iterate through the child nodes of the first collapsible element
    for (let i = 1; i < elist1.length; i++) {
        // Check if the data object has levels
        if (dataObj.level > 0) {
            // Check if the current count is within the data object's level
            if (count <= dataObj.level) {
                // Check if the current BO (Branch Object) is defined
                if (dataObj.BOs[(count - 1)] !== undefined) {
                    // Get the span and input elements for the first collapsible element
                    let sp1 = elist1[i].childNodes[0];
                    let ip1 = elist1[i].childNodes[1];

                    // Get the span and input elements for the second collapsible element
                    let sp2 = elist2[i].childNodes[0];
                    let ip2 = elist2[i].childNodes[1];
                    let siz = Math.floor(Number(dataObj.BOs[(count - 1)].size) * 100);

                    // Calculate the length and the larger of length and size
                    let len = Math.floor(Number(dataObj.BOs[(count - 1)].len) * 100);
                    let bl = len < siz ? siz : len;

                    // Get the span and input elements for the third collapsible element
                    let sp3 = elist3[i].childNodes[0];
                    let ip3 = elist3[i].childNodes[1];
                    let ofs = Math.floor(Number(dataObj.BOs[(count - 1)].ofs));

                    // Update the inner HTML and value of the span and input elements
                    if (sp1 !== undefined) {
                        sp1.innerHTML = 'Length ' + count + ': ' + bl;
                    }
                    if (ip1 !== undefined) {
                        ip1.value = bl;
                        ip1.min = siz;
                    }

                    if (sp2 !== undefined) {
                        sp2.innerHTML = 'Size ' + count + ': ' + siz;
                    }
                    if (ip2 !== undefined) {
                        ip2.value = siz;
                        ip2.max = bl; // Set the max size to the calculated length
                    }

                    if (sp3 !== undefined) {
                        sp3.innerHTML = 'Offset ' + count + ': ' + ofs;
                    }
                    if (ip3 !== undefined) {
                        ip3.value = ofs;
                    }
                }

                // Ensure the collapsible elements are displayed
                if (elist3[i].tagName === 'DIV') {
                    elist3[i].style.display = "block";
                }
                if (elist2[i].tagName === 'DIV') {
                    elist2[i].style.display = "block";
                }
                if (elist1[i].tagName === 'DIV') {
                    elist1[i].style.display = "block";
                    count++;
                }
            } else {
                // Hide the collapsible elements if the count exceeds the data object's level
                if (elist1[i].tagName === 'DIV') {
                    elist1[i].style.display = "none";
                }
                if (elist2[i].tagName === 'DIV') {
                    elist2[i].style.display = "none";
                }
                if (elist3[i].tagName === 'DIV') {
                    elist3[i].style.display = "none";
                }
            }
        } else {
            // Hide the collapsible elements if the data object has no levels
            if (elist1[i].tagName === 'DIV') {
                elist1[i].style.display = "none";
            }
            if (elist2[i].tagName === 'DIV') {
                elist2[i].style.display = "none";
            }
            if (elist3[i].tagName === 'DIV') {
                elist3[i].style.display = "none";
            }
        }
    }
}//end updateCollapsible

function updateToggels(element, variable){
        if(variable){
            element.classList.add("buttonToggel");
            element.classList.remove("button");
        }else{
            element.classList.add("button");
            element.classList.remove("buttonToggel");
        }
}//end updateMenu

//Collapsible
var coll = document.getElementsByClassName("collapsible");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}

});