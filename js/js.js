

/*jshint esversion: 6 */


$(function() {
    var dataObj;
    var flakes = [];
    var flakesRandom = [];

 
 

    //var angList3 = [-60, 0, 60, 120, 180, -120];
    //var angList3 = [270, 330, 30, 90, 150, 210];
    var angList3 = [-90, -30, 30, 90, 150, -150];

    var sw = ((screen.width/2)/50), sh =  (screen.height / 2)/50;
    
    const centerP = new Point(sw, sh);


    var scaleFactor = 2;
    var branchL = 100;
    var scale = 20;




    var idCount;



const img = new Image(); // Create new img element
img.src = "data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==";

const backImage1 = new Image();
backImage1.src = "images/thomas-lardeau-d1NX2iggPok-unsplash.jpg";

const backImage2 = new Image();
backImage2.src = "images/jessica-fadel-SH4GNXNj1RA-unsplash.jpg";

const Tpng = new Image();
Tpng.src = "images/Tpng.png";

var offscreencanvas = document.createElement("CANVAS");
offscreencanvas.setAttribute("id","offscreencanvas");
offscreencanvas.width = screen.width;
offscreencanvas.height = screen.height;
var osctx = offscreencanvas.getContext('2d');

var canvas = document.createElement("CANVAS");
canvas.setAttribute("id","canvas");
canvas.width = screen.width;
canvas.height = screen.height;
var ctx = canvas.getContext('2d');

var con1 = document.getElementById("con1");
con1.appendChild(canvas);





var LBOsRandom;

var shortPoint;
var closest_intersection;
var check;
var peak;
var peakLine;

//zoom pan mouse functions ///////////////////
//https://www.cs.colostate.edu/~anderson/newsite/javascript-zoom.html

    canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    canvas.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox

var widthCanvas = canvas.width;
var heightCanvas = canvas.height;
// View parameters
var xleftView = (canvas.width / 2)-400;
var ytopView = canvas.height / 2;
var widthViewOriginal = 1.0;           //actual width and height of zoomed and panned display
var heightViewOriginal = 1.0;
var widthView = widthViewOriginal;           //actual width and height of zoomed and panned display
var heightView = heightViewOriginal;

var mouseDown = false;
var lastX = 0;
var lastY = 0;



function handleDblClick(event) {
    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft; //Canvas coordinates
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;
    var x = X/widthCanvas * widthView + xleftView;  // View coordinates
    var y = Y/heightCanvas * heightView + ytopView;

    var scale = event.shiftKey == 1 ? 1.5 : 0.5; // shrink (1.5) if shift key pressed
    widthView *= scale;
    heightView *= scale;

    if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
    widthView = widthViewOriginal;
    heightView = heightViewOriginal;
    x = widthView/2;
    y = heightView/2;
    }

    xleftView = x - widthView/2;
    ytopView = y - heightView/2;

   // draw();
}//end handleDblClick

function handleMouseDown(event) {
    mouseDown = true;
}//end handleMouseDown

function handleMouseUp(event) {
    mouseDown = false;
}//end handleMouseUp

function handleMouseMove(event) {
    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft;
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;
    if (mouseDown) {
        var dx = (X - lastX);// / canvas.width * widthView;
        var dy = (Y - lastY);// / canvas.height * heightView;
        xleftView += dx;
        ytopView += dy;
      //  sessionStorage.setItem("xleftView", xleftView);
      //  sessionStorage.setItem("ytopView", ytopView);
         draw();
    }
    lastX = X;
    lastY = Y;
   // sessionStorage.setItem("lastX", lastX);
   // sessionStorage.setItem("lastY", lastY);

   
}//end handleMouseMove

function handleMouseWheel(event) {
    var x = widthView/2 + xleftView;  // View coordinates
    var y = heightView/2 + ytopView;

    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;
    widthView *= scale;
    heightView *= scale;

    if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
    widthView = widthViewOriginal;
    heightView = heightViewOriginal;
    x = widthView/2;
    y = heightView/2;
    }

    // scale about center of view, rather than mouse position. This is different than dblclick behavior.
    xleftView = x - widthView/2;
    ytopView = y - heightView/2;

   // draw();
}//end handleMouseWheel


//Menu functions ///////////////////


function Collapsible(i, text, inId, spId){  
    switch(text){
        case "Level ": 
            dataObj.BOs[i] = new Branch(
                dataObj.BOs[i].startPoint,
                Number(document.getElementById(inId).value),
                dataObj.BOs[i].size,
                dataObj.BOs[i].ofs
            );
        break;
        case "Size ":
            dataObj.BOs[i] = new Branch(
                dataObj.BOs[i].startPoint,
                dataObj.BOs[i].len,
                Number(document.getElementById(inId).value),
                dataObj.BOs[i].ofs
            );
        break;
        case "Offset ":
            dataObj.BOs[i] = new Branch(
                dataObj.BOs[i].startPoint,
                dataObj.BOs[i].len,
                dataObj.BOs[i].size,
                Number(document.getElementById(inId).value),
            );
        default:
        break;
    } 
   
    document.getElementById(spId).innerHTML = text+(i+1)+":"+document.getElementById(inId).value;
    sessionStorageSaveArray();
}//end Collapsible

function populatyeCollapsible(){
    var coll1 = document.getElementById("coll1");
    var coll2 = document.getElementById("coll2");
    var coll3 = document.getElementById("coll3");
      
    for(let i=0;i<10;i++){
        var DIV = document.createElement("DIV");
        DIV.setAttribute("class", "flex-container");   
        var SPAN = document.createElement("SPAN");
        SPAN.setAttribute("id", "spanl"+(i+1));
        SPAN.setAttribute("class", "spanClass");
        SPAN.innerHTML = "Level "+(i+1)+":";
        var INPUT = document.createElement("INPUT");
        INPUT.setAttribute("id", "inputl"+(i+1));
        INPUT.setAttribute("class", "range");
        INPUT.setAttribute("type", "range");
        INPUT.setAttribute("min", 5);
        INPUT.setAttribute("max", 400);
        INPUT.setAttribute("value", 3);

        DIV.appendChild(SPAN);
        DIV.appendChild(INPUT);
        coll1.appendChild(DIV);

        INPUT.addEventListener('input',(e)=>{
            Collapsible(i, "Level ", "inputl"+(i+1), "spanl"+(i+1));
        });
    }

    for(let i=0;i<10;i++){
        var DIV = document.createElement("DIV");
        DIV.setAttribute("class", "flex-container");  
        var SPAN = document.createElement("SPAN");
        SPAN.setAttribute("id", "spanS"+(i+1));
        SPAN.setAttribute("class", "spanClass");
        SPAN.innerHTML = "Size "+(i+1)+":";
        var INPUT = document.createElement("INPUT");
        INPUT.setAttribute("id", "inputS"+(i+1));
        INPUT.setAttribute("class", "range");
        INPUT.setAttribute("type", "range");
        INPUT.setAttribute("min", 1);
        INPUT.setAttribute("max", 100);
        INPUT.setAttribute("value", 10);

        DIV.appendChild(SPAN);
        DIV.appendChild(INPUT);
        coll2.appendChild(DIV);

        INPUT.addEventListener('input',(e)=>{
            Collapsible(i, "Size ", "inputS"+(i+1), "spanS"+(i+1));
        });
    }

    for(let i=0;i<10;i++){
        var DIV = document.createElement("DIV");
        DIV.setAttribute("class", "flex-container");
        var SPAN = document.createElement("SPAN");
        SPAN.setAttribute("id", "spanO"+(i+1));
        SPAN.setAttribute("class", "spanClass");
        SPAN.innerHTML = "Offset "+(i+1)+":";
        var INPUT = document.createElement("INPUT");
        INPUT.setAttribute("id", "inputO"+(i+1));
        INPUT.setAttribute("class", "range");
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

window.onload = function(){
    
    populatyeCollapsible();


    //Collapsible ///////////////
    //Level
    /*
    var inputl1 = document.getElementById("inputl1");
    var spanl1 = document.getElementById("spanl1");
    inputl1.addEventListener('input',(e)=>{
        dataObj.BOs[0] = new Branch(dataObj.BOs[0].startPoint, Number(inputl1.value), dataObj.BOs[0].size, dataObj.BOs[0].ofs);
        spanl1.innerHTML = "Level 1: "+inputl1.value;
        sessionStorageSaveArray();
    });
    
    var inputl2 = document.getElementById("inputl2");
    var spanl2 = document.getElementById("spanl2");
    inputl2.addEventListener('input',(e)=>{
        dataObj.BOs[1] = new Branch(dataObj.BOs[1].startPoint, Number(inputl2.value), dataObj.BOs[1].size, dataObj.BOs[1].ofs);
        spanl2.innerHTML = "Level 2: "+inputl2.value;
        sessionStorageSaveArray();
    });
    var inputl3 = document.getElementById("inputl3");
    var spanl3 = document.getElementById("spanl3");
    inputl3.addEventListener('input',(e)=>{
        dataObj.BOs[2] = new Branch(dataObj.BOs[2].startPoint, Number(inputl3.value), dataObj.BOs[2].size, dataObj.BOs[2].ofs);
        spanl3.innerHTML = "Level 3: "+inputl3.value;
        sessionStorageSaveArray();
    });
    var inputl4 = document.getElementById("inputl4");
    var spanl4 = document.getElementById("spanl4");
    inputl4.addEventListener('input',(e)=>{
        dataObj.BOs[3] = new Branch(dataObj.BOs[3].startPoint, Number(inputl4.value), dataObj.BOs[3].size, dataObj.BOs[3].ofs);
        spanl4.innerHTML = "Level 4: "+inputl4.value;
        sessionStorageSaveArray();
    });
    var inputl5 = document.getElementById("inputl5");
    var spanl5 = document.getElementById("spanl5");
    inputl5.addEventListener('input',(e)=>{
        dataObj.BOs[4] = new Branch(dataObj.BOs[4].startPoint, Number(inputl5.value), dataObj.BOs[4].size, dataObj.BOs[4].ofs);
        spanl5.innerHTML = "Level 5: "+inputl5.value;
        sessionStorageSaveArray();
    });
    var inputl6 = document.getElementById("inputl6");
    var spanl6 = document.getElementById("spanl6");
    inputl6.addEventListener('input',(e)=>{
        dataObj.BOs[5] = new Branch(dataObj.BOs[5].startPoint, Number(inputl6.value), dataObj.BOs[5].size, dataObj.BOs[5].ofs);
        spanl6.innerHTML = "Level 6: "+inputl6.value;
        sessionStorageSaveArray();
    });
    var inputl7 = document.getElementById("inputl7");
    var spanl7 = document.getElementById("spanl7");
    inputl7.addEventListener('input',(e)=>{
        dataObj.BOs[6] = new Branch(dataObj.BOs[6].startPoint, Number(inputl7.value), dataObj.BOs[6].size, dataObj.BOs[6].ofs);
        spanl7.innerHTML = "Level 7: "+inputl7.value;
        sessionStorageSaveArray();
    });
    var inputl8 = document.getElementById("inputl8");
    var spanl8 = document.getElementById("spanl8");
    inputl8.addEventListener('input',(e)=>{
        dataObj.BOs[7] = new Branch(dataObj.BOs[7].startPoint, Number(inputl8.value), dataObj.BOs[7].size, dataObj.BOs[7].ofs);
        spanl8.innerHTML = "Level 8: "+inputl8.value;
        sessionStorageSaveArray();
    });
    var inputl9 = document.getElementById("inputl9");
    var spanl9 = document.getElementById("spanl9");
    inputl9.addEventListener('input',(e)=>{
        dataObj.BOs[8] = new Branch(dataObj.BOs[8].startPoint, Number(inputl9.value), dataObj.BOs[8].size, dataObj.BOs[8].ofs);
        spanl9.innerHTML = "Level 9: "+inputl9.value;
        sessionStorageSaveArray();
    });
    var inputl10 = document.getElementById("inputl10");
    var spanl10 = document.getElementById("spanl10");
    inputl10.addEventListener('input',(e)=>{
        dataObj.BOs[9] = new Branch(dataObj.BOs[9].startPoint, Number(inputl10.value), dataObj.BOs[9].size, dataObj.BOs[9].ofs);
        spanl10.innerHTML = "Level 10: "+inputl10.value;
        sessionStorageSaveArray();
    });
    */

    //Level
    /*
    var inputS1 = document.getElementById("inputS1");
    var spanS1 = document.getElementById("spanS1");
    inputS1.addEventListener('input',(e)=>{
        dataObj.BOs[0] = new Branch(dataObj.BOs[0].startPoint, dataObj.BOs[0].len, Number(inputS1.value), dataObj.BOs[0].ofs);
        spanS1.innerHTML = "Size 1: "+inputS1.value;
        sessionStorageSaveArray();
    });
    var inputS2 = document.getElementById("inputS2");
    var spanS2 = document.getElementById("spanS2");
    inputS2.addEventListener('input',(e)=>{
        dataObj.BOs[1] = new Branch(dataObj.BOs[1].startPoint, dataObj.BOs[1].len, Number(inputS2.value), dataObj.BOs[1].ofs);
        spanS2.innerHTML = "Size 2: "+inputS2.value;
        sessionStorageSaveArray();
    });
    var inputS3 = document.getElementById("inputS3");
    var spanS3 = document.getElementById("spanS3");
    inputS3.addEventListener('input',(e)=>{
        dataObj.BOs[2] = new Branch(dataObj.BOs[2].startPoint, dataObj.BOs[2].len, Number(inputS3.value), dataObj.BOs[2].ofs);
        spanS3.innerHTML = "Size 3: "+inputS3.value;
        sessionStorageSaveArray();
    });
    var inputS4 = document.getElementById("inputS4");
    var spanS4 = document.getElementById("spanS4");
    inputS4.addEventListener('input',(e)=>{
        dataObj.BOs[3] = new Branch(dataObj.BOs[3].startPoint, dataObj.BOs[3].len, Number(inputS4.value), dataObj.BOs[3].ofs);
        spanS4.innerHTML = "Size 4: "+inputS4.value;
        sessionStorageSaveArray();
    });
    var inputS5 = document.getElementById("inputS5");
    var spanS5 = document.getElementById("spanS5");
    inputS5.addEventListener('input',(e)=>{
        dataObj.BOs[4] = new Branch(dataObj.BOs[4].startPoint, dataObj.BOs[4].len, Number(inputS5.value), dataObj.BOs[4].ofs);
        spanS5.innerHTML = "Size 5: "+inputS5.value;
        sessionStorageSaveArray();
    });
    var inputS6 = document.getElementById("inputS6");
    var spanS6 = document.getElementById("spanS6");
    inputS6.addEventListener('input',(e)=>{
        dataObj.BOs[5] = new Branch(dataObj.BOs[5].startPoint, dataObj.BOs[5].len, Number(inputS6.value), dataObj.BOs[5].ofs);
        spanS6.innerHTML = "Size 6: "+inputS6.value;
        sessionStorageSaveArray();
    });
    var inputS7 = document.getElementById("inputS7");
    var spanS7 = document.getElementById("spanS7");
    inputS7.addEventListener('input',(e)=>{
        dataObj.BOs[6] = new Branch(dataObj.BOs[6].startPoint, dataObj.BOs[6].len, Number(inputS7.value), dataObj.BOs[6].ofs);
        spanS7.innerHTML = "Size 7: "+inputS7.value;
        sessionStorageSaveArray();
    });
    var inputS8 = document.getElementById("inputS8");
    var spanS8 = document.getElementById("spanS8");
    inputS8.addEventListener('input',(e)=>{
        dataObj.BOs[7] = new Branch(dataObj.BOs[7].startPoint, dataObj.BOs[7].len, Number(inputS8.value), dataObj.BOs[7].ofs);
        spanS8.innerHTML = "Size 8: "+inputS8.value;
        sessionStorageSaveArray();
    });
    var inputS9 = document.getElementById("inputS9");
    var spanS9 = document.getElementById("spanS9");
    inputS9.addEventListener('input',(e)=>{
        dataObj.BOs[8] = new Branch(dataObj.BOs[8].startPoint, dataObj.BOs[8].len, Number(inputS9.value), dataObj.BOs[8].ofs);
        spanS9.innerHTML = "Size 9: "+inputS9.value;
        sessionStorageSaveArray();
    });
    var inputS10 = document.getElementById("inputS10");
    var spanS10 = document.getElementById("spanS10");
    inputS10.addEventListener('input',(e)=>{
        dataObj.BOs[9] = new Branch(dataObj.BOs[9].startPoint, dataObj.BOs[9].len, Number(inputS10.value), dataObj.BOs[9].ofs);
        spanS10.innerHTML = "Size 10: "+inputS10.value;
        sessionStorageSaveArray();
    });
    */
    //offset
    /*
    var inputO1 = document.getElementById("inputO1");
    var spanO1 = document.getElementById("spanO1");
    inputO1.addEventListener('input',(e)=>{
        dataObj.BOs[0] = new Branch(dataObj.BOs[0].startPoint, dataObj.BOs[0].len, dataObj.BOs[0].size, inputO1.value);
        spanO1.innerHTML = "Offset 1: "+offsetNumChange(inputO1.value);
        sessionStorageSaveArray();
    });
    var inputO2 = document.getElementById("inputO2");
    var spanO2 = document.getElementById("spanO2");
    inputO2.addEventListener('input',(e)=>{
        dataObj.BOs[1] = new Branch(dataObj.BOs[1].startPoint, dataObj.BOs[1].len, dataObj.BOs[1].size, inputO2.value);
        spanO2.innerHTML = "Offset 2: "+offsetNumChange(inputO2.value);
        sessionStorageSaveArray();
    });
    var inputO3 = document.getElementById("inputO3");
    var spanO3 = document.getElementById("spanO3");
    inputO3.addEventListener('input',(e)=>{
        dataObj.BOs[2] = new Branch(dataObj.BOs[2].startPoint, dataObj.BOs[2].len, dataObj.BOs[2].size, inputO3.value);
        spanO3.innerHTML = "Offset 3: "+offsetNumChange(inputO3.value);
        sessionStorageSaveArray();
    });
    var inputO4 = document.getElementById("inputO4");
    var spanO4 = document.getElementById("spanO4");
    inputO4.addEventListener('input',(e)=>{
        dataObj.BOs[3] = new Branch(dataObj.BOs[3].startPoint, dataObj.BOs[3].len, dataObj.BOs[3].size, inputO4.value);
        spanO4.innerHTML = "Offset 4: "+offsetNumChange(inputO4.value);
        sessionStorageSaveArray();
    });
    var inputO5 = document.getElementById("inputO5");
    var spanO5 = document.getElementById("spanO5");
    inputO5.addEventListener('input',(e)=>{
        dataObj.BOs[4] = new Branch(dataObj.BOs[4].startPoint, dataObj.BOs[4].len, dataObj.BOs[4].size, inputO5.value);
        spanO5.innerHTML = "Offset 5: "+offsetNumChange(inputO5.value);
        sessionStorageSaveArray();
    });
    var inputO6 = document.getElementById("inputO6");
    var spanO6 = document.getElementById("spanO6");
    inputO6.addEventListener('input',(e)=>{
        dataObj.BOs[5] = new Branch(dataObj.BOs[5].startPoint, dataObj.BOs[5].len, dataObj.BOs[5].size, inputO6.value);
        spanO6.innerHTML = "Offset 6: "+offsetNumChange(inputO6.value);
        sessionStorageSaveArray();
    });
    var inputO7 = document.getElementById("inputO7");
    var spanO7 = document.getElementById("spanO7");
    inputO7.addEventListener('input',(e)=>{
        dataObj.BOs[6] = new Branch(dataObj.BOs[6].startPoint, dataObj.BOs[6].len, dataObj.BOs[6].size, inputO7.value);
        spanO7.innerHTML = "Offset 7: "+offsetNumChange(inputO7.value);
        sessionStorageSaveArray();
    });
    var inputO8 = document.getElementById("inputO8");
    var spanO8 = document.getElementById("spanO8");
    inputO8.addEventListener('input',(e)=>{
        dataObj.BOs[7] = new Branch(dataObj.BOs[7].startPoint, dataObj.BOs[7].len, dataObj.BOs[7].size, inputO8.value);
        spanO8.innerHTML = "Offset 8: "+offsetNumChange(inputO8.value);
        sessionStorageSaveArray();
    });
    var inputO9 = document.getElementById("inputO9");
    var spanO9 = document.getElementById("spanO9");
    inputO9.addEventListener('input',(e)=>{
        dataObj.BOs[8] = new Branch(dataObj.BOs[8].startPoint, dataObj.BOs[8].len, dataObj.BOs[8].size, inputO9.value);
        spanO9.innerHTML = "Offset 9: "+offsetNumChange(inputO9.value);
        sessionStorageSaveArray();
    });
    var inputO10 = document.getElementById("inputO10");
    var spanO10 = document.getElementById("spanO10");
    inputO10.addEventListener('input',(e)=>{
        dataObj.BOs[9] = new Branch(dataObj.BOs[9].startPoint, dataObj.BOs[9].len, dataObj.BOs[9].size, inputO10.value);
        spanO10.innerHTML = "Offset 10: "+offsetNumChange(inputO10.value);
        sessionStorageSaveArray();
    });
    */

    /////////////////////
    
    var levelS = document.getElementById("levelS");
    var levelL = document.getElementById("levelL");
    // levelL.innerHTML = "Level "+ level;

    // levelS.value = level;
    // EVENT LISTENERS
    levelS.addEventListener('change',(e)=>{
        //console.log('change');
        //level = this.value;
        //levelL.innerHTML = "level "+ level;
    });
  
    levelS.addEventListener('input',(e)=>{
        //console.log('input');
        dataObj.level = levelS.value;
        levelL.innerHTML = "Level "+ dataObj.level;
        sessionStorageSaveArray();
    });

    var cropS = document.getElementById("cropS");
    var cropL = document.getElementById("cropL");
    cropS.addEventListener('input',(e)=>{
        dataObj.cropAngel = cropS.value;
        cropL.innerHTML = "Crop-angle "+ dataObj.cropAngel;
        sessionStorageSaveArray();
    });

    var tb1 = document.getElementById("tb1");
    tb1.addEventListener('click',(e)=>{
        dataObj.singleTog == false ? dataObj.singleTog = true : dataObj.singleTog = false;
        tb1.value = "TogSingle "+dataObj.singleTog;
        sessionStorageSaveArray();
        updateToggels(tb1, dataObj.singleTog);
    });

    var tb2 = document.getElementById("tb2");
    tb2.addEventListener('click',(e)=>{
        dataObj.mirrorTog == false ? dataObj.mirrorTog = true : dataObj.mirrorTog = false;
        tb2.value = "TogMirror "+dataObj.mirrorTog;
        sessionStorageSaveArray();
        updateToggels(tb2, dataObj.mirrorTog);
    });

    var tb3 = document.getElementById("tb3");
    tb3.addEventListener('click',(e)=>{
        dataObj.guideTog == false ? dataObj.guideTog = true : dataObj.guideTog = false;
        tb3.value = "TogGuides "+dataObj.guideTog;
        sessionStorageSaveArray();
        updateToggels(tb3, dataObj.guideTog);
    });

    var tb4 = document.getElementById("tb4");
    tb4.addEventListener('click',(e)=>{
        dataObj.textTog == false ? dataObj.textTog = true : dataObj.textTog = false;
        tb4.value = "TogText "+dataObj.textTog;
        sessionStorageSaveArray();
        updateToggels(tb4, dataObj.textTog);
    });

    var tb5 = document.getElementById("tb5");
    tb5.addEventListener('click',(e)=>{
        dataObj.crop == false ? dataObj.crop = true : dataObj.crop = false;
        tb5.value = "TogCrop "+dataObj.crop;
        sessionStorageSaveArray();
        updateToggels(tb5, dataObj.crop);
    });

    var tb6 = document.getElementById("tb6");
    tb6.addEventListener('click',(e)=>{
        console.log('random');
        randomise();
        sessionStorageSaveArray();
    });

    var ReF = document.getElementById("Refresh");
    ReF.addEventListener('click',(e)=>{
        sessionStorage.clear();
        location.reload();
    });

    var Save = document.getElementById("Save");
    //https://www.sanwebe.com/snippet/downloading-canvas-as-image-dataurl-on-button-click
    Save.addEventListener('click',(e)=>{
        console.log('save');
        image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let link = document.createElement('a');
        link.download = "my-image.png";
        link.href = image;
        link.click();
    });

    var SaveJson = document.getElementById("SaveJson");
    SaveJson.addEventListener('click',(e)=>{
        console.log('SaveJson');
        let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj));
        let link = document.createElement("a");
        link.download = "yourfile.json";
        link.href = data;
        link.click();
    });

    var LoadJson = document.getElementById("LoadJson");
    LoadJson.addEventListener('click',(e)=>{
        document.getElementById('my_file').click();
    });

    var fi = document.getElementById("my_file");
    fi.addEventListener('change',(e)=>{
        console.log('LoadJson');
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

    document.getElementById("menuO").onclick = openNav;
    document.getElementById("menuC").onclick = closeNav;

//Start Call ///////////////////
init();
};//end onload

function sessionStorageSaveArray(){
    sessionStorage.setItem("dataObjStr", JSON.stringify(dataObj));
    update(1);
}//end sessionStorageArray

function sessionStorageDecodeArray(){
    if(sessionStorage.getItem("dataObjStr") != null){
        let dataObjStr = JSON.parse(sessionStorage.getItem("dataObjStr"));   
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

        dataObj.LBOs = [];
        for(let i=0;i<dataObjStr.LBOs.length;i++){
            dataObj.LBOs.push(
                new Line(
                    new Point(dataObjStr.LBOs[i].p1.x, dataObjStr.LBOs[i].p1.y),
                    new Point(dataObjStr.LBOs[i].p2.x, dataObjStr.LBOs[i].p2.y)
                )
            );
        }

        dataObj.level = dataObjStr.level;
        levelL.innerHTML = "Level "+ dataObj.level;
        levelS.value = dataObj.level;

        dataObj.cropAngel = dataObjStr.cropAngel;
        cropL.innerHTML = "Crop-angle "+ dataObj.cropAngel;
        cropS.value = dataObj.cropAngel;

        dataObj.singleTog = dataObjStr.singleTog;
        tb1.value = "TogSingle "+dataObj.singleTog;
        updateToggels(tb1, dataObj.singleTog);
        
        dataObj.mirrorTog = dataObjStr.mirrorTog;
        tb2.value = "TogMirror "+dataObj.mirrorTog;
        updateToggels(tb2, dataObj.mirrorTog);
        
        dataObj.guideTog = dataObjStr.guideTog;
        tb3.value = "TogGuides "+dataObj.guideTog;
        updateToggels(tb3, dataObj.guideTog);

        dataObj.textTog = dataObjStr.textTog;
        tb4.value = "TogText "+dataObj.textTog;
        updateToggels(tb4, dataObj.textTog); 

        dataObj.crop = dataObjStr.crop;
        tb5.value = "TogCrop "+dataObj.crop;
        updateToggels(tb5, dataObj.crop); 

       
        openNav();
    }
}//end sessionStorageArray


//Init   ///////////////////
function init(){ 
       dataObj = {
        "BOs": null,
        "LBOs": null,
        "level": 3,
        "cropAngel": 40,
        "singleTog": false,
        "mirrorTog": true,
        "guideTog": false,
        "textTog": false,
        "crop": true 
    };

    flakes = [];
    createBranchlist();
    createGuides();
    sessionStorageDecodeArray();
    updateCollapsible(false);
    createLineList();
    draw();
}//end init


//Update   ///////////////////
function update(type){
    flakes = [];
    createBranchlist();
    createGuides();
    createLineList(); 
    updateCollapsible(false);
    draw();
    //console.log(flakes);
}//end update


function updateCollapsible(init){
    let elist1 = document.getElementById("coll1").childNodes;
    let elist2 = document.getElementById("coll2").childNodes;
    let elist3 = document.getElementById("coll3").childNodes;
    let count = 1;   
    for(let i=0;i<elist1.length;i++){
        if(dataObj.level > 0){
            if(count <= dataObj.level){
                    let sp1= elist1[i].childNodes[1];
                    let ip1 = elist1[i].childNodes[3];

                    let bl = dataObj.BOs[(count-1)].len;

                    let sp2= elist2[i].childNodes[1];
                    let ip2 = elist2[i].childNodes[3];
                    let siz =  dataObj.BOs[(count-1)].size;

                    let sp3= elist3[i].childNodes[1];
                    let ip3 = elist3[i].childNodes[3];
                    let ofs = dataObj.BOs[(count-1)].ofs;
                    if (sp1 !== undefined){
                        sp1.innerHTML = 'Level '+count+': '+bl;
                    }
                    if (ip1 !== undefined){
                        ip1.value = bl;
                    }

                    if (sp2 !== undefined){
                        sp2.innerHTML = 'Size '+count+': '+siz;
                    }
                    if (ip2 !== undefined){
                        ip2.value = siz;
                    }

                    if (sp3 !== undefined){
                        sp3.innerHTML = 'Offset '+count+': '+offsetNumChange(ofs);
                    }
                    if (ip3 !== undefined){
                        ip3.value = ofs;
                    }
                
                if(elist3[i].tagName == 'DIV'){
                    elist3[i].style.display = "block";           
                }
                if(elist2[i].tagName == 'DIV'){
                    elist2[i].style.display = "block";         
                }
                if(elist1[i].tagName == 'DIV'){
                    elist1[i].style.display = "block";  
                    count++;          
                }
            }else{
                if(elist1[i].tagName == 'DIV'){
                    elist1[i].style.display = "none";
                }
                if(elist2[i].tagName == 'DIV'){
                    elist2[i].style.display = "none";         
                }
                if(elist3[i].tagName == 'DIV'){
                    elist3[i].style.display = "none";         
                }
            }
        }else{
            if(elist1[i].tagName == 'DIV'){
                elist1[i].style.display = "none";
            }
            if(elist2[i].tagName == 'DIV'){
                elist2[i].style.display = "none";         
            }
            if(elist3[i].tagName == 'DIV'){
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

function openNav() {
      document.getElementById("mySidenav").style.width = "250px";
      document.getElementById("con1").style.marginLeft = "250px";
      document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
      menuO.style.display = "none";
    
}//end openNav

function closeNav() {
      document.getElementById("mySidenav").style.width = "0";
      document.getElementById("con1").style.marginLeft= "0";
      document.body.style.backgroundColor = "white";
      menuO.style.display = "block";
    
}//end closeNav

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





//Drawing functions  ///////////////////

function copyToOnScreen() {
    ctx.drawImage(backImage2, 0, 0, offscreencanvas.width, offscreencanvas.height);
    //ctx.rotate(10*Math.PI/180);
    ctx.drawImage(offscreencanvas, 0, 0, offscreencanvas.width, offscreencanvas.height);
}//end copyToOnScreen

function draw() {

       // osctx.imageSmoothingEnabled = true;
        osctx.setTransform(1,0,0,1,0,0);
       // osctx.rect(0, 0, offscreencanvas.width, offscreencanvas.height);
       // osctx.fillStyle = "black";
       // osctx.fill();
       osctx.clearRect(0, 0, offscreencanvas.width, offscreencanvas.height);
    
       // osctx.drawImage(Tpng, 0, 0, offscreencanvas.width, offscreencanvas.height);
        osctx.translate(xleftView, ytopView);
       // osctx.translate((offscreencanvas.width / 2)-400, offscreencanvas.height / 2);

   

    for(let i=0;i<flakes.length;i++){
        //drawHexagon(fList[i].hexagon, 1, "rgba(0, 0, 255, 0.5)","rgba(255, 255, 255, 0.2)");    
        drawHexagonColor(flakes[i]);
    }



    for(let i=0;i<flakes.length;i++){                  
        if(dataObj.textTog){
            drawText(flakes[i].mid, flakes[i].text, '20px', 'Arial', 'cyan');
        }
        if(!dataObj.crop){
            if(check[i]){
                if(closest_intersection[i] !== null){
                    drawPoint(closest_intersection[i], 4, 1, 'magenta', 'magenta');
                    drawPoint(shortPoint[i], 2, 1, 'yellow', 'yellow');
                    drawPoint(peak[i], 2, 1, 'orange', 'orange');
                    drawLine(peakLine[i], 1, 'pink');
                    
                    let dist = Math.round(findDistance(closest_intersection[i], shortPoint[i]));
                    let cir = new Circle(shortPoint[i], dist);
                    if(PinC(cir, flakes[i].p1)){
                        drawCircle(cir, 2, 'red');
                        drawPoint(flakes[i].p1, 2, 1, 'blue', 'blue'); //p2 points
                    }else{
                        drawCircle(cir, 2, 'black');
                        drawPoint(flakes[i].p1, 2, 1, 'blue', 'blue'); //p2 points
                    }
                }      
            }
        }   
    }

    for(let i=0;i<dataObj.BOs.length;i++){
        //drawPoint(dataObj.BOs[i].midPoint(), 2, 1, 'red', 'red'); //p2 points
        drawPoint(dataObj.BOs[i].startPoint, 2, 1, 'yellow', 'yellow'); //p2 points
    }
    if (dataObj.guideTog) {
        for(let i=0;i<dataObj.LBOs.length;i++){
            drawLine(dataObj.LBOs[i], 2, 'green');
        }
    }
copyToOnScreen();

}//end draw

function drawText(point, text, size, font, color){
    osctx.font = ""+size+""+font+"";
    osctx.fillStyle = color;
    osctx.textAlign = "center";
    osctx.fillText(text, point.x, point.y);
}//end drawText

function drawPoint(Point, radious, line_width, color, fillColor){
    osctx.lineWidth = line_width;
    osctx.strokeStyle = color;
    osctx.beginPath();
    osctx.arc(Point.x, Point.y, radious, 0, 2 * Math.PI);
    osctx.closePath();
    osctx.stroke();
    osctx.fillStyle = fillColor;
    osctx.fill();
}//end drawPoint

function drawLine(Line, line_width, color){
    osctx.lineWidth = line_width;
    osctx.strokeStyle = color;
    osctx.beginPath();
    osctx.moveTo(Line.p1.x, Line.p1.y);
    osctx.lineTo(Line.p2.x, Line.p2.y);
    osctx.closePath();
    osctx.stroke();    
}//end drawLine 

function drawCircle(c, line_width, color){
    osctx.lineWidth = line_width;
    osctx.strokeStyle = color;
    osctx.beginPath();
    osctx.arc(c.p.x, c.p.y, c.r, 0, 2 * Math.PI);
    osctx.closePath();
    osctx.stroke();
}//end drawCircle

function drawHexagon(Hex, line_width, color, fillColor){
    osctx.lineWidth = line_width;
    osctx.strokeStyle = color;
    osctx.beginPath();
    osctx.moveTo(Hex.points[0].x, Hex.points[0].y);
    osctx.lineTo(Hex.points[1].x, Hex.points[1].y);
    osctx.lineTo(Hex.points[2].x, Hex.points[2].y);
    osctx.lineTo(Hex.points[3].x, Hex.points[3].y);
    osctx.lineTo(Hex.points[4].x, Hex.points[4].y);
    osctx.lineTo(Hex.points[5].x, Hex.points[5].y);
    osctx.closePath();
    osctx.stroke();
    osctx.fillStyle = fillColor;   
    osctx.fill(); 
}//end drawHexagon

function drawHexagonColor(fl){
    osctx.lineWidth = 5;
    let col1 = "rgba(0, 0, 0, 0.5)";
    let col2 = "rgba(255, 255, 255, 0.5)";


    switch(fl.dir){
        case 0:
            
            osctx.strokeStyle = col1;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.lineTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.stroke();

            osctx.strokeStyle = col2;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.stroke();  
                  
        break;

        case 1:
            osctx.strokeStyle = col1;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.lineTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.stroke();
            
            osctx.strokeStyle = col2;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.stroke();
        break;
        case 2:
            osctx.strokeStyle = col1;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.stroke();

            osctx.strokeStyle = col2;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.stroke(); 
        break;
        case 3:
            osctx.strokeStyle = col1;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.stroke();

            osctx.strokeStyle = col2;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.lineTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.stroke();
        break;
        case 4:
            osctx.strokeStyle = col1;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.stroke();

            osctx.strokeStyle = col2;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.lineTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.stroke();
        break;

        case 5:
            osctx.strokeStyle = col1;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
            osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
            osctx.lineTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.stroke();

            osctx.strokeStyle = col2;
            osctx.beginPath();
            osctx.moveTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
            osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
            osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
            osctx.lineTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
            osctx.stroke();
        break;
        default:
        break;
    }

    osctx.lineWidth = 2;
    let peakp = fl.hexagon.points[0];
    let pl = new Line(fl.p1, peakp); 
    osctx.beginPath();
    osctx.moveTo(pl.p1.x, pl.p1.y);
    osctx.lineTo(pl.p2.x, pl.p2.y);
    osctx.stroke();
   
    osctx.lineWidth = 1;
    osctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    osctx.beginPath();
    osctx.moveTo(fl.hexagon.points[0].x, fl.hexagon.points[0].y);
    osctx.lineTo(fl.hexagon.points[1].x, fl.hexagon.points[1].y);
    osctx.lineTo(fl.hexagon.points[2].x, fl.hexagon.points[2].y);
    osctx.lineTo(fl.hexagon.points[3].x, fl.hexagon.points[3].y);
    osctx.lineTo(fl.hexagon.points[4].x, fl.hexagon.points[4].y);
    osctx.lineTo(fl.hexagon.points[5].x, fl.hexagon.points[5].y);
    osctx.closePath();
    osctx.fillStyle = "rgba(255, 255, 255, 0.2)";   
    osctx.fill();
    osctx.stroke();



}//end drawHexagon
 

//Objects  ///////////////////

function Flake(p1, p2, level, size, dir, text, ofs){
     this.p1 = p1;
     this.p2 = p2;
     this.level = level;
     this.size = size; 
     this.dir = dir;
     this.text = text;
     this.ofs = ofs;
     this.line = new Line(this.p1, this.p2);
     this.hexObject = createHex(this.p1, this.p2, this.dir, this.size, this.ofs)
     this.hexagon = this.hexObject.hex;
     this.size1 = this.hexObject.size1;
     this.size2 = this.hexObject.size2;
}//end flake 
Flake.prototype.midPoint = function() {
    return new Point((this.p1.x + this.p2.x)/2, (this.p1.y + this.p2.y)/2); 
};



function Point(x, y) {
    this.x = x;
    this.y = y; 
}//end Point

function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.x1 = p1.x;
    this.y1 = p1.y;
    this.x2 = p2.x;
    this.y2 = p2.x;
}//end Line

function Circle(p, r){
    this.p = p;
    this.r = r;
}//end Circle

function Branch(startPoint, len, size, ofs){
    this.len = len;
    this.startPoint = startPoint;
    this.size = size;
    this.ofs = ofs;
}//end Branch

Branch.prototype.endPoint = function() {
    return new Point(this.startPoint.x, (this.startPoint.y - this.len));
};

Branch.prototype.midPoint = function() {
    return new Point(this.startPoint.x, (this.startPoint.y - (this.len/2))); 
};


function Hexagon(points, point, color, type, level, dir){
    this.points = points;
    this.point = point;
}//end Hexagon



//Create functions  ///////////////////

function createPlainHexagon(point, hexSize){
    let points = [];
    for(let i=0;i<6;i++){
        let p = convert(60 * i, new Point(point.x, point.y - hexSize), point);
        points[i] = new Point(p.x, p.y);
    }
    return new Hexagon(points, point);
}//end createHexagon

function createHex(p1, p2, dir, size, ofs) {
        let h1, h2, s1, s2;
        if(ofs < 25){
            ofs = 25 - ofs;
            s1 = size+ofs;
            s2 = size;
            h1 = createPlainHexagon(p1, size+ofs);
            h2 = createPlainHexagon(p2, size);
        }else if(ofs > 25){
            ofs = ofs-25;
            s1 = size;
            s2 = size+ofs;
            h1 = createPlainHexagon(p1, size);
            h2 = createPlainHexagon(p2, size+ofs);
        }else if(ofs == 25){
            ofs = 0;
            s1 = size;
            s2 = size;
            h1 = createPlainHexagon(p1, size);
            h2 = createPlainHexagon(p2, size);
        }
    return createHexCrystel(s1, s2, h1, h2, dir);
}//endcreateHex

function createHexCrystel(s1, s2, h1, h2, dir) {
        let points2 = [];
        let count = dir;
        for (let i = 0; i < 6; i++) {
            if (count > 5) {
                count = 0;
            }
            if (i == 0 || i == 1 || i == 5) {
                points2[i] = h2.points[count];
            } else {
                points2[i] = h1.points[count];
            }
            count++;
        }   
        return {size1: s1, size2: s2, hex: new Hexagon(points2, new Point(h1.point.x, h1.point.y))};
}//end createHexCrystel


function randomise(){
    dataObj.BOs = [];
    dataObj.BOs.push(new Branch(centerP, returnRandom(5, 300), returnRandom(1, 50), 25));
    for(let i=1;i<dataObj.level;i++){
        dataObj.BOs.push(new Branch(dataObj.BOs[i-1].endPoint, returnRandom(5, 300), returnRandom(1, 50), 25));
    }
}//end randomise

function returnRandom(low, high){
    return rd((((Math.random() * (low - high))) + low));
}//end returnRandom

function createBranchlist(){
    let size = scale;
    let bln = branchL;
    //if Branch Object List is null or empty populate it
    if(dataObj.BOs === null){
        dataObj.BOs = [];
        dataObj.BOs.push(new Branch(centerP, rd(Number(bln)), rd(size - (size / dataObj.level) / 2), 25));
        for (let i = 1; i < dataObj.level ; i++) {
            bln -= (bln / scaleFactor);
            dataObj.BOs.push(new Branch(dataObj.BOs[dataObj.BOs.length-1].endPoint(), rd(Number(bln)), rd(size - (size / i) / 2), 25));
        }
   }else{
        //Update add or remove Branch Object
        let BOsT = [];
        BOsT.push(new Branch(new Point(dataObj.BOs[0].startPoint.x, dataObj.BOs[0].startPoint.y), dataObj.BOs[0].len,  dataObj.BOs[0].size, dataObj.BOs[0].ofs));
        for (let i = 1; i < dataObj.level ; i++) {
            bln -= (bln / scaleFactor);
            if(i < dataObj.BOs.length){
                BOsT.push(new Branch(dataObj.BOs[i-1].endPoint(), dataObj.BOs[i].len, dataObj.BOs[i].size, dataObj.BOs[i].ofs));
            }else{
                BOsT.push(new Branch(dataObj.BOs[dataObj.BOs.length-1].endPoint(), rd(Number(bln)), rd(size - (size / i) / 2), 25));
            }    
        }
        dataObj.BOs = BOsT;
   } 
}//end createBranchlist

function SumBranch(){
    let sumBranch = 0;
    for (let i = 0; i < dataObj.BOs.length ; i++) {
        sumBranch += rd(Number(dataObj.BOs[i].len));
        if(i == dataObj.BOs.length-1){
            sumBranch += (dataObj.BOs[i].size)
        }
    }return sumBranch;
}//end sumBranch

function createGuides(){
    dataObj.LBOs = [];
    //vertical line 
    let verticleLine = convert(270, new Point(centerP.x + SumBranch(), centerP.y), centerP);

    //crop line temp
    let cropLineTemp = convert(dataObj.cropAngel, new Point(verticleLine.x + SumBranch()-50, verticleLine.y), verticleLine);
    
    //v line temp
    let vLineTemp = convert(300, new Point(centerP.x + SumBranch()+100, centerP.y), centerP);
    //let vLineTemp = convert(300, new Point(centerP.x + SumBranch()+100, centerP.y), new point(centerP.x, centerP.y-5));
    
    //find intersection
    let crop_v_inter = findIntersection(new Line(verticleLine, cropLineTemp), new Line(centerP, vLineTemp));

    //crop line
    let cropLine = new Line(verticleLine, crop_v_inter);
    dataObj.LBOs.push(cropLine);
    //v line
    let vLine = new Line(centerP, crop_v_inter);
    dataObj.LBOs.push(vLine);
    for(let i=0;i<dataObj.BOs.length;i++){
        let LineTemp = convert(330, new Point(dataObj.BOs[i].midPoint().x + SumBranch(), dataObj.BOs[i].midPoint().y), dataObj.BOs[i].midPoint());
        let LineTempline = new Line(dataObj.BOs[i].midPoint(), LineTemp);
        if(checkLine(LineTempline, cropLine, 0)){
            dataObj.LBOs.push(new Line(dataObj.BOs[i].midPoint(), findIntersection(LineTempline, cropLine)));
        }else{
            dataObj.LBOs.push(new Line(dataObj.BOs[i].midPoint(), findIntersection(LineTempline, vLine)));
        }
    }
}//end createGuides

function checkFlake(fs, tt, l, f){
    let cpp = new Point(0, 0);
    let peakp = f.hexagon.points[0];

    let pl = new Line(f.p1, peakp); 
    if(f.p2.x >= centerP.x){
        if(checkLines(pl, dataObj.LBOs, 0)){
            peakLine.push(pl);
            peak.push(subPoint(peakp, cpp));
            check.push(true);
          
            if(f.text !== "stem" && f.text !== "seed"){
                let cl = checkLinesClosest(pl, dataObj.LBOs, 0);
                closest_intersection.push(cl);
                let sp = shortLine(subPoint(f.p1, cpp), cl, f.size2);
                shortPoint.push(sp);

                if(dataObj.crop){
                    let dist = Math.round(findDistance(cl, sp));
                    let cir = new Circle(sp, dist);
                    if(!PinC(cir, f.p1)){
                        let ll = new Line(f.p1, sp);
                        let ff = new Flake(f.p1, sp, f.level, f.size, f.dir, f.text, f.ofs);
                        fs.push(ff);
                        tt.push(ll);
                    }
                }else{
                    fs.push(f);
                    tt.push(l);
                }
            }else{
                closest_intersection.push(null);
                shortPoint.push(null);
                fs.push(f);
                tt.push(l);
            }
        }else{
            peakLine.push(null);
            peak.push(null);
            check.push(false);
        
            closest_intersection.push(null);
            shortPoint.push(null);
            fs.push(f);
            tt.push(l);    
        }
    }
}//end chectFlake

function offsetNumChange(num){
    let localVal = num;
    if(localVal < 25){
        localVal = 25 - localVal;
    }else if(localVal > 25){
        localVal = localVal-25;
    }else if(localVal == 25){
        localVal = 0;
    }
    return localVal;
}//end offsetNumChange



function createLineList() {
    let fs = flakes;
    let b_list = dataObj.BOs;
    idCount = 0
    shortPoint = [];
    closest_intersection = [];
    check = [];
    peak = [];
    peakLine = [];

    let tas = []; //temp Array Seeds
    let tempTemp = [];
    let size = scale;
    let ang = findDir(centerP, new Point(centerP.x, centerP.y - b_list[0].len));
    ////////////////

    let testline0 = new Line(centerP, new Point(centerP.x, centerP.y - b_list[0].len));
    let test_flake0 = new Flake(centerP, new Point(centerP.x, centerP.y - b_list[0].len), 0,  b_list[0].size, ang, "seed", b_list[0].ofs);
    ////////////////
    checkFlake(fs, tempTemp, testline0, test_flake0);
    ////////////////
    for (let i = 0; i < dataObj.level; i++) {
        let bL = b_list[i].len;
        //let bL = 100;
        //float sz = (float)(((Math.random()*(0.1 - 1.5))) + 0.1); 
        //size = sz;
        size = rd(size - ((size / dataObj.level) * i) / 2);
        for(let j=0;j<tas.length;j++){
            let ang = findDir(tas[j].p1, tas[j].p2);
            if (tas[j].p2.x >= centerP.x) {

                let leftang = ang - 1;
                if (leftang == -1) {
                    leftang = 5;
                }
                let leftT = convert(angList3[leftang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2, tas[j].y2);          
                let testPoint1 = tas[j].p2;
                let testline1 = new Line(testPoint1, leftT);
                let test_flake1 = new Flake(testPoint1, leftT, i, b_list[i].size, leftang, "left", b_list[i].ofs);

                ////////////////
                checkFlake(fs, tempTemp, testline1, test_flake1);
                ////////////////

                if (rd(tas[j].p2.x) == centerP.x) {
                    let centerang = ang;
                    let centerT = convert(angList3[centerang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                    let testPoint2 = tas[j].p2;
                    let testline2 = new Line(testPoint2, centerT);
                    let test_flake2 = new Flake(testPoint2, centerT, i, b_list[i].size, centerang, "stem", b_list[i].ofs);

                ////////////////
                checkFlake(fs, tempTemp, testline2, test_flake2);
                ////////////////
                } else {
                    let centerang = ang;
                    let centerT = convert(angList3[centerang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                    let testPoint3 = tas[j].p2;
                    let testline3 = new Line(testPoint3, centerT);
                    let test_flake3 = new Flake(testPoint3, centerT, i, b_list[i].size, centerang, "center", b_list[i].ofs);
                           

                    ////////////////
                    checkFlake(fs, tempTemp, testline3, test_flake3);
                    ////////////////

                }
                
                let rightang = ang + 1;
                if (ang == 5) {
                    rightang = 0;
                }

                let rightT = convert(angList3[rightang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                let testPoint4 = tas[j].p2;
                let testline4 = new Line(testPoint4, rightT);
                let test_flake4 = new Flake(testPoint4, rightT, i, b_list[i].size, rightang, "right", b_list[i].ofs);

                ////////////////////
                checkFlake(fs, tempTemp, testline4, test_flake4);
                ///////////////////

            }
        }
            
        tas = tempTemp;
        tempTemp = [];
            
    }//end of loop

    //mirror half
    if(dataObj.mirrorTog){
        mirrorfalkes(fs);
    }

    // rotation sections
    if(dataObj.singleTog){
        createOtherSections(1, fs);
    }else{
        createOtherSections(6, fs);
    }

}//end createLineList

function mirrorfalkes(fs){
    let tempFlake1 = [];
    for(let i=0;i<fs.length;i++){
        
            let temD = fs[i].dir;
            switch (temD) {
                case 5:
                    temD = 1;
                break;
                case 1:
                    temD = 5;
                break;
                case 4:
                    temD = 2;
                break;
                case 2:
                    temD = 4;
                break;
                default:
                break;
            }
            let text = fs[i].text;
            if(fs[i].text == "right"){
                text = "left";
            }else if(fs[i].text == "left"){
                text = "right";
            }
            let id = "id "+fs[i].level+""+(++idCount);
            if (text !== "seed" && text !== "stem"){
                tempFlake1.push(
                new Flake(
                    new Point(centerP.x - (fs[i].p1.x - centerP.x), fs[i].p1.y),
                    new Point(centerP.x - (fs[i].p2.x - centerP.x), fs[i].p2.y),
                    fs[i].level,
                    fs[i].size,
                    temD,
                    text,
                    fs[i].ofs
                )
            );
        }
    }
    Array.prototype.push.apply(fs, tempFlake1);
    tempFlake1 = [];
}//end mirrorfalkes

function createOtherSections(num, fs){
    let tempFlake = [];
    let tempD;
    //create six sides
    let count = 0;
    for(let n=0;n<fs.length;n++){
        for (let i = 0; i < num; i++) {
            tempD = fs[n].dir + i;
            if (tempD > 5) {
                tempD -= 6;
            }
            let p1 = convert(i * 60, new Point(fs[n].p1.x, fs[n].p1.y), centerP);
            let p2 = convert(i * 60, new Point(fs[n].p2.x, fs[n].p2.y), centerP);
            let id = "id "+fs[n].level+""+(++idCount);
            tempFlake.push(
                new Flake(
                    new Point(p1.x, p1.y),
                    new Point(p2.x, p2.y),
                    fs[n].level,
                    fs[n].size,
                    tempD,
                    fs[n].text,
                    fs[n].ofs
                )
            );
            count++;
         }
    }
    fs = [];
    flakes = tempFlake;
    //Array.prototype.push.apply(fs, tempFlake);
}//end createOtherSections


//Helper functions  ///////////////////

function rd(num){
    //Round to One Decimal Place
    return (Math.round(num * 10) / 10);
}//end rd

function subPoint(p1, p2){
    return new Point(p1.x-p2.x, p1.y-p2.y);
}//end subPoint


function addPoint(p1, p2){
    return new Point(p1.x+p2.x, p1.y+p2.y);
}//end subPoint

function shortLine(sp, ep, size) {
    let angle = findAngel(sp, ep);
    let dist = findDistance(sp, ep);
    let totDist;
    if (size >= dist) {
        totDist = 0;
    } else {
        totDist = dist - size;
    }
    return newPosition(sp, totDist, angle);
}//end shortLine

function findDistance(po1, po2) {
    return Math.sqrt(((po1.x - po2.x) * (po1.x - po2.x)) + ((po1.y - po2.y) * (po1.y - po2.y)));
}//end findDistance

function newPosition(cp, speed, angle) {
    //https://stackoverflow.com/questions/39818833/moving-an-object-from-one-point-to-another
    let x = cp.x + (speed * Math.cos(angle));
    let y = cp.y + (speed * Math.sin(angle));
    return new Point(x, y);
}//end newPosition

function findDir(p1, p2) {
    let direction = 0;
    let rad = findAngel(p1, p2);
    let deg = radians_to_degrees(rad);
    let ang = Math.round(deg);

    for (let i = 0; i < angList3.length; i++) {
        if (ang == angList3[i]) {
            direction = i;
        }
    }
    return direction;
}//end findDir

function radians_to_degrees(radians){
  return radians * (180/Math.PI);
}//end radians_to_degrees

function findAngel(from, to) {
    //https://stackoverflow.com/questions/39818833/moving-an-object-from-one-point-to-another
    let deltaX = to.x - from.x;
    let deltaY = to.y - from.y;
    let angle = Math.atan2(deltaY, deltaX);
    return angle;
}//end findAngel

function checkLine(setmLine, lie2, tol) {
        let intersectionPoint = findIntersection(lie2, setmLine); //Point
        let dx2 = setmLine.p1.x - intersectionPoint.x;
        let dy2 = setmLine.p1.y - intersectionPoint.y;
        let distance2 = Math.abs(Math.sqrt(dx2 * dx2 + dy2 * dy2));
        let tolLine = new Line(new Point(intersectionPoint.x, intersectionPoint.x), new Point(setmLine.p1.x, setmLine.p1.y));
        return intersects(lie2, new Line(new Point(setmLine.p1.x, setmLine.p1.y), new Point(setmLine.p2.x, setmLine.p2.y))) ||
                distance2 < tol / 2 && intersects(tolLine, new Line(new point(lie2.p1.x, lie2.p1.y), new point(lie2.p2.x, lie2.p2.y)));
    
}//end checkLine

function checkLines(setmLine, ll, tol) {
    let ret = false;
    for(let i=0;i<ll.length;i++){
        if(checkLine(setmLine, ll[i], tol)){
            ret = true;
        }
    }
    return ret;  
}//end checkLines

function checkLinesClosest(inline, ll, tol) {
    let pl = [];
    for(let i=0;i<ll.length;i++){
        if (checkLine(inline, ll[i], tol)) {
            pl.push(findIntersection(inline, ll[i]));
        }
    }
    let rp = pl[0];
    for(let j=0;j<pl.length;j++){
        if (distance(pl[j], inline.p1) < distance(rp, inline.p1)) {
                rp = pl[j];
        }
    }
    return rp;
}//end checkLinesClosest

function distance(p1, p2){
    let a = p1.x - p2.x;
    let b = p1.y - p2.y;
    return Math.sqrt( a*a + b*b );
}//end distance

function intersects(l1, l2) {
//https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    var det, gamma, lambda;
    det = (l1.p2.x - l1.p1.x) * (l2.p2.y - l2.p1.y) - (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y);
    if (det === 0) {
        return false;
    } else {
        lambda = ((l2.p2.y - l2.p1.y) * (l2.p2.x - l1.p1.x) + (l2.p1.x - l2.p2.x) * (l2.p2.y - l1.p1.y)) / det;
        gamma = ((l1.p1.y - l1.p2.y) * (l2.p2.x - l1.p1.x) + (l1.p2.x - l1.p1.x) * (l2.p2.y - l1.p1.y)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}//end intersects

function findIntersection(l1, l2) {
        //https://rosettacode.org/wiki/Find_the_intersection_of_two_lines#Java
        let a1 = l1.p2.y - l1.p1.y;
        let b1 = l1.p1.x - l1.p2.x;
        let c1 = a1 * l1.p1.x + b1 * l1.p1.y;

        let a2 = l2.p2.y - l2.p1.y;
        let b2 = l2.p1.x - l2.p2.x;
        let c2 = a2 * l2.p1.x + b2 * l2.p1.y;

        let delta = a1 * b2 - a2 * b1;
        let ret = new Point((b2 * c1 - b1 * c2) / delta, (a1 * c2 - a2 * c1) / delta);
        if (((b2 * c1 - b1 * c2) / delta) == 0) {
            ret = new Point(0, 0);
        }
        return ret;    
}//end findIntersection

function PinC(c, p){
     return (((p.x - c.p.x) * (p.x - c.p.x)) + ((p.y - c.p.y) * (p.y - c.p.y)) <= (c.r * c.r));
}//end PinC

function convert(ang, xy, cxy) {    
    let p1 = cxy.x + Math.cos(ang * Math.PI / 180) * (xy.x - cxy.x) - Math.sin(ang * Math.PI / 180) * (xy.y - cxy.y);
    let p2 = cxy.y + Math.sin(ang * Math.PI / 180) * (xy.x - cxy.x) + Math.cos(ang * Math.PI / 180) * (xy.y - cxy.y);
    let point = new Point( p1, p2);
     
    if(isNaN(p1) || isNaN(p2)){
       // console.log("arglist: "+ang+' '+xy.x+" "+xy.y+" "+cxy.x+" "+cxy.y);
      //  console.log("points: "+p1+' '+p2);
    }
    return point;   
}//end convert

});

