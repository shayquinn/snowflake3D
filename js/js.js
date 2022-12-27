

/*jshint esversion: 6 */


$(function() {

    var flakes = [];
    var flakesRandom = [];

    var branchObjects;
    var branchObjectsRandom;

    //var angList3 = [-60, 0, 60, 120, 180, -120];
    //var angList3 = [270, 330, 30, 90, 150, 210];
    var angList3 = [-90, -30, 30, 90, 150, -150];

    var sw = ((screen.width/2)/50), sh =  (screen.height / 2)/50;
    
    const centerP = new Point(sw, sh);

    var level = 3;
    var scaleFactor = 2;
    var branchL = 100;
    var scale = 20;
    var crop = 40;
    var offset = 25;

    var guideTog = false;
    var singleTog = false;
    var mirrorTog = true;
    var textTog = false;
    var crop = false;
    var random = false;


    var idCount;



const img = new Image(); // Create new img element
img.src = "data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==";


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

function copyToOnScreen() {
    ctx.drawImage(offscreencanvas, 0, 0, offscreencanvas.width, offscreencanvas.height);
}//end copyToOnScreen


var linebranchObhect;
var linebranchObhectRandom;

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


window.onload = function(){
    
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
        level = levelS.value;
        levelL.innerHTML = "Level "+ level;
        sessionStorage.setItem("level", level);
        update();
    });
  
    var bS = document.getElementById("branchS");
    var bL = document.getElementById("branchL");
    branchS.addEventListener('input',(e)=>{
        branchL = bS.value;
        bL.innerHTML = "Branch "+ branchL;
        sessionStorage.setItem("branchL", branchL);
        update();
    });
    
    var scaleS = document.getElementById("scaleS");
    var scaleL = document.getElementById("scaleL");
    scaleS.addEventListener('input',(e)=>{
        scale = scaleS.value;
        scaleL.innerHTML = "Scale "+ scale;
        sessionStorage.setItem("scale", scale);
        update();
    });

    var scaleFS = document.getElementById("scaleFS");
    var scaleFL = document.getElementById("scaleFL");
    scaleFS.addEventListener('input',(e)=>{
        scaleFactor = scaleFS.value;
        scaleFL.innerHTML = "Scale-F "+ scaleFactor;
        sessionStorage.setItem("scaleFactor", scaleFactor);
        update();
    });

    var cropS = document.getElementById("cropS");
    var cropL = document.getElementById("cropL");
    cropS.addEventListener('input',(e)=>{
        crop = cropS.value;
        cropL.innerHTML = "Crop-angle "+ crop;
        sessionStorage.setItem("crop", crop);
        update();
    });

    

    var offsetS = document.getElementById("offsetS");
    var offsetL = document.getElementById("offsetL");
    offsetS.addEventListener('input',(e)=>{
        offset = offsetS.value;
        let val = offsetS.value;
        if(val < 25){
            val = 25 - val;
        }else if(val > 25){
            val = val-25;
        }else if(val == 25){
            val = 0;
        }
        offsetL.innerHTML = "Offset "+ val;
        sessionStorage.setItem("offset", offset);
        update();
    });


    var tb1 = document.getElementById("tb1");
    tb1.addEventListener('click',(e)=>{
        singleTog == false ? singleTog = true : singleTog = false;
        console.log(singleTog);
        tb1.value = "TogSingle "+singleTog;
        sessionStorage.setItem("singleTog", singleTog);
        updateToggels(tb1, singleTog);
        update();
    });

    var tb2 = document.getElementById("tb2");
    tb2.addEventListener('click',(e)=>{
        mirrorTog == false ? mirrorTog = true : mirrorTog = false;
        tb2.value = "TogMirror "+mirrorTog;
        sessionStorage.setItem("mirrorTog", mirrorTog);
        updateToggels(tb2, mirrorTog);
        update();
    });

    var tb3 = document.getElementById("tb3");
    tb3.addEventListener('click',(e)=>{
        guideTog == false ? guideTog = true : guideTog = false;
        tb3.value = "TogGuides "+guideTog;
        sessionStorage.setItem("guideTog", guideTog); 
        updateToggels(tb3, guideTog);
        update();
    });

    var tb4 = document.getElementById("tb4");
    tb4.addEventListener('click',(e)=>{
        textTog == false ? textTog = true : textTog = false;
        tb4.value = "TogText "+textTog;
        sessionStorage.setItem("textTog", textTog); 
        updateToggels(tb4, textTog);
        update();
    });

    var tb5 = document.getElementById("tb5");
    tb5.addEventListener('click',(e)=>{
        crop == false ? crop = true : crop = false;
        tb5.value = "TogCrop "+crop;
        sessionStorage.setItem("crop", crop); 
        updateToggels(tb5, crop);
        update();
    });

    var tb6 = document.getElementById("tb6");
    tb6.addEventListener('click',(e)=>{
        random === false ? random = true : random = false;
        console.log(random);
        tb6.value = "Random "+random;
        sessionStorage.setItem("random", random); 
        updateToggels(tb6, random);
        update();
    });


    var ReF = document.getElementById("Refresh");
    ReF.addEventListener('click',(e)=>{
        sessionStorage.clear();
        location.reload();
        console.log('clear: '+sessionStorage.getItem("level"));
        update();
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




    document.getElementById("menuO").onclick = openNav;
    document.getElementById("menuC").onclick = closeNav;
    
/*
    if(sessionStorage.getItem("xleftView") != null){
        xleftView = sessionStorage.getItem("xleftView");
    }
    if(sessionStorage.getItem("ytopView") != null){
        ytopView = sessionStorage.getItem("ytopView");
    }

     if(sessionStorage.getItem("lastX") != null){
        lastX = sessionStorage.getItem("lastX");
    }
    if(sessionStorage.getItem("lastY") != null){
        lastY = sessionStorage.getItem("lastY");
    }
*/

    //reload sessionStorage ///////////////////

    if(sessionStorage.getItem("level") != null){
        level = sessionStorage.getItem("level");
        levelL.innerHTML = "Level "+ level;
        levelS.value = level;
    }
    if(sessionStorage.getItem("branchL") != null){
        branchL = sessionStorage.getItem("branchL");
        bL.innerHTML = "Branch "+ branchL;
        bS.value = branchL;
        openNav();
    }
    if(sessionStorage.getItem("scale") != null){
        scale = sessionStorage.getItem("scale");
        scaleL.innerHTML = "Scale "+ scale;
        scaleS.value = scale;
        openNav();
    }
    if(sessionStorage.getItem("scaleFactor") != null){
        scaleFactor = sessionStorage.getItem("scaleFactor");
        scaleFL.innerHTML = "Scale-F "+ scaleFactor;
        scaleFS.value = scaleFactor;
        openNav();
    }  

    if(sessionStorage.getItem("crop") != null){
        crop = sessionStorage.getItem("crop");
        cropL.innerHTML = "Crop-angle "+ crop;
        cropS.value = crop;

    }
    if(sessionStorage.getItem("offset") != null){
        offset = sessionStorage.getItem("offset");
        let val = offset;
        if(val < 25){
            val = 25 - val;
        }else if(val > 25){
            val = val-25;
        }else if(val == 25){
            val = 0;
        }
        offsetL.innerHTML = "Offset "+ val;
        offsetS.value = offset;
        openNav();
    }

     

    if(sessionStorage.getItem("singleTog") != null){
        singleTog = sessionStorage.getItem("singleTog");
        tb1.value = "TogSingle "+singleTog;
        updateToggels(tb1, singleTog);
        openNav();
    }
    if(sessionStorage.getItem("mirrorTog") != null){
        mirrorTog = sessionStorage.getItem("mirrorTog");
        tb2.value = "TogMirror "+mirrorTog;
        updateToggels(tb2, mirrorTog);   
        openNav();
    }
    if(sessionStorage.getItem("guideTog") != null){
        guideTog = sessionStorage.getItem("guideTog");
        tb3.value = "TogGuides "+guideTog;
        updateToggels(tb3, guideTog);
        openNav();
    }
    

    if(sessionStorage.getItem("textTog") != null){
        textTog = sessionStorage.getItem("textTog");
        tb4.value = "TogText "+textTog;
        updateToggels(tb4, textTog);   
        openNav();
    }

    if(sessionStorage.getItem("crop") != null){
        crop = sessionStorage.getItem("crop");
        tb5.value = "TogCrop "+crop;
        updateToggels(tb5, crop);   
        openNav();
    }

    if(sessionStorage.getItem("random") != null){
        random = sessionStorage.getItem("random");
        tb6.value = "Random "+random;
        updateToggels(tb6, random);   
        openNav();
    }

//Start Call ///////////////////

update();
console.log(flakes);

};//end onload

function updateToggels(element, variable){
        if(variable == 1){
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





//Drawing functions  ///////////////////

function draw() { 
   // osctx.imageSmoothingEnabled = true;
    osctx.setTransform(1,0,0,1,0,0);
    osctx.rect(0, 0, offscreencanvas.width, offscreencanvas.height);
    osctx.fillStyle = "black";
    osctx.fill();

    osctx.translate(xleftView, ytopView);
   // osctx.translate((offscreencanvas.width / 2)-400, offscreencanvas.height / 2); 
let fList = flakes;
if(random){
    fList = flakesRandom;
}
console.log(fList.length);
    for(let i=0;i<fList.length;i++){
        drawHexagon(fList[i].hexagon, 1, "rgba(0, 0, 255, 0.5)","rgba(255, 255, 255, 0.2)");    
    }

    if (guideTog) {
        for(let i=0;i<linebranchObhect.length;i++){
            drawLine(linebranchObhect[i], 1, 'green');
        }
    }

    for(let i=0;i<fList.length;i++){                  
        if(textTog){
            drawText(fList[i].mid, fList[i].text, '20px', 'Arial', 'cyan');
        }
        if(!crop && !random){
            if(check[i]){
                if(closest_intersection[i] !== null){
                    drawPoint(closest_intersection[i], 4, 1, 'magenta', 'magenta');
                    drawPoint(shortPoint[i], 2, 1, 'yellow', 'yellow');
                    drawPoint(peak[i], 2, 1, 'orange', 'orange');
                    drawLine(peakLine[i], 1, 'pink');
                    

                    let dist = Math.round(findDistance(closest_intersection[i], shortPoint[i]));
                    let cir = new Circle(shortPoint[i], dist);
                    if(PinC(cir, fList[i].p1)){
                        drawCircle(cir, 2, 'red');
                        drawPoint(fList[i].p1, 2, 1, 'blue', 'blue'); //p2 points
                    }else{
                        drawCircle(cir, 2, 'black');
                        drawPoint(fList[i].p1, 2, 1, 'blue', 'blue'); //p2 points
                    }
                }      
            }
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


//Update   ///////////////////

function update(){
    branchObjects = [];
    branchObjectsRandom = [];
    flakes = [];
    falsesRandom = [];
    createBranchlist();
    
    draw();

   // console.log(branchLs);
   // console.log(netList);
   // console.log(flakes);
}//end update

function updateCrop(){


}//end update

function rebuild(){

}//end rebuild

 

//Objects  ///////////////////

function Flake(p1, p2, level, size, dir, text, id){
     this.p1 = p1;
     this.p2 = p2;
     this.level = level;
     this.size = size; 
     this.dir = dir;
     this.text = text;
     this.id = id;
     this.line = new Line(this.p1, this.p2);
     this.mid = midpoint(this.p1, this.p2); 
     this.hexObject = createHex(this.p1, this.p2, this.dir, this.size)
     this.hexagon = this.hexObject.hex;
     this.size1 = this.hexObject.size1;
     this.size2 = this.hexObject.size2;
  
}//end flake 

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

function Branch(startPoint, length, size){
    this.len = length;
    this.size = size;
    this.startPoint = startPoint;
    this.endPoint = new Point(startPoint.x, (startPoint.y - length));
    this.midPoint = new Point(startPoint.x, (startPoint.y - (length/2))); 
}//end Branch

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

function createHex(p1, p2, dir, size) {
        let h1, h2, s1, s2;
        let val = offset;
        if(val < 25){
            val = 25 - val;
            s1 = size+val;
            s2 = size;
            h1 = createPlainHexagon(p1, size+val);
            h2 = createPlainHexagon(p2, size);
        }else if(val > 25){
            val = val-25;
            s1 = size;
            s2 = size+val;
            h1 = createPlainHexagon(p1, size);
            h2 = createPlainHexagon(p2, size+val);
        }else if(val == 25){
            val = 0;
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

function createBranchlist(){
    let cpp = new Point(0, 0);
    let sumBranch = 0;
    let sumBranchRandom = 0;
    let bln = branchL;
/*
    let blr = branchL;
    branchObjectsRandom.push(new Branch(centerP, blr));
    sumBranchRandom += Number(blr);
    for (let i = 0; i < level; i++) {
        blr = rd((((Math.random() * (200.0 - 500.0))) + 200.0));
         blr -= (blr / scaleFactor);
        sumBranchRandom += Number(blr);
        branchObjectsRandom.push(new Branch(branchObjectsRandom[branchObjectsRandom.length-1].endPoint, blr));
    }
*/
    branchObjects.push(new Branch(centerP, bln));
    sumBranch += Number(bln);
    for (let i = 0; i < level ; i++) {
        bln -= (bln / scaleFactor);
        sumBranch += Number(bln);
        branchObjects.push(new Branch(branchObjects[branchObjects.length-1].endPoint, bln));
    }

    linebranchObhect = [];
    linebranchObhectRandom = [];

    createGuides(linebranchObhect, branchObjects, sumBranch);
   // createGuides(linebranchObhectRandom, branchObjectsRandom, sumBranchRandom);


    createLineList(flakes, branchObjects); 
   // createLineList(flakesRandom, branchObjectsRandom);

}//end createBranchlist


function createGuides(lbo, bo, sb){
    //vertical line 
    let verticleLine = convert(270, new Point(centerP.x + sb, centerP.y), centerP);
    //lbo.push(new Line(new Point(centerP.x, centerP.y), verticleLine));

    //crop line temp
    let cropLineTemp = convert(crop, new Point(verticleLine.x + sb-50, verticleLine.y), verticleLine);
    
    //v line temp
    let vLineTemp = convert(300, new Point(centerP.x + sb+100, centerP.y), centerP);
    
    //find intersection
    let crop_v_inter = findIntersection(new Line(verticleLine, cropLineTemp), new Line(centerP, vLineTemp));

    //crop line
    let cropLine = new Line(verticleLine, crop_v_inter);
    lbo.push(cropLine);
    //v line
    let vLine = new Line(centerP, crop_v_inter);
    lbo.push(vLine);

    for(let i=1;i<bo.length-2;i++){
        let LineTemp = convert(330, new Point(bo[i].midPoint.x + sb, bo[i].midPoint.y), bo[i].midPoint);
        let LineTempline = new Line(bo[i].midPoint, LineTemp);
        if(checkLine(LineTempline, cropLine, 0)){
            lbo.push(new Line(bo[i].midPoint, findIntersection(LineTempline, cropLine)));
        }else{
            lbo.push(new Line(bo[i].midPoint, findIntersection(LineTempline, vLine)));
        }
    }
}//end createGuides


function checkFlake(fs, tt, l, f){
    let cpp = new Point(0, 0);
    let peakp = f.hexagon.points[0];

    let pl = new Line(f.p1, peakp); 
    if(f.p2.x >= centerP.x){
        if(checkLines(pl, linebranchObhect, 0)){
            peakLine.push(pl);
            peak.push(subPoint(peakp, cpp));
            check.push(true);
          
            if(f.text !== "stem" && f.text !== "seed"){
                let cl = checkLinesClosest(pl, linebranchObhect, 0);
                closest_intersection.push(cl);
                let sp = shortLine(subPoint(f.p1, cpp), cl, f.size2);
                shortPoint.push(sp);

                if(crop){
                    let dist = Math.round(findDistance(cl, sp));
                    let cir = new Circle(sp, dist);
                    if(!PinC(cir, f.p1)){
                        let ll = new Line(f.p1, sp);
                        let ff = new Flake(f.p1, sp, f.level, f.size, f.dir, f.text, f.id);
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


function createLineList(fs, b_list) {
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
    let test_flake0 = new Flake(centerP, new Point(centerP.x, centerP.y - b_list[0].len), 0, size = rd(size - ((size / level) * 0) / 2), ang, "seed", "id 0"+idCount);

    //let testline0 = new Line(centerP, new Point(centerP.x, centerP.y - b_list[0].len));
    //let test_flake0 = new Flake(centerP, new Point(centerP.x, centerP.y - b_list[0].len), 0, size = rd(size - ((size / level) * 0) / 2), ang, "seed", "id 0"+idCount);
    ////////////////
    checkFlake(fs, tempTemp, testline0, test_flake0);
    ////////////////
    for (let i = 1; i < level; i++) {
        let bL = b_list[i].len;
        //let bL = 100;
        //float sz = (float)(((Math.random()*(0.1 - 1.5))) + 0.1); 
        //size = sz;
        size = rd(size - ((size / level) * i) / 2);
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
                let test_flake1 = new Flake(testPoint1, leftT, i, size, leftang, "left", "id "+i+""+(++idCount));

                ////////////////
                checkFlake(fs, tempTemp, testline1, test_flake1);
                ////////////////

                if (rd(tas[j].p2.x) == centerP.x) {
                    let centerang = ang;
                    let centerT = convert(angList3[centerang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                    let testPoint2 = tas[j].p2;
                    let testline2 = new Line(testPoint2, centerT);
                    let test_flake2 = new Flake(testPoint2, centerT, i, size, centerang, "stem", "id "+i+""+(++idCount));

                ////////////////
                checkFlake(fs, tempTemp, testline2, test_flake2);
                ////////////////
                } else {
                    let centerang = ang;
                    let centerT = convert(angList3[centerang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                    let testPoint3 = tas[j].p2;
                    let testline3 = new Line(testPoint3, centerT);
                    let test_flake3 = new Flake(testPoint3, centerT, i, size, centerang, "center", "id "+i+""+(++idCount));
                           

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
                let test_flake4 = new Flake(testPoint4, rightT, i, size, rightang, "right", "id "+i+""+(++idCount));

                ////////////////////
                checkFlake(fs, tempTemp, testline4, test_flake4);
                ///////////////////

            }
        }
            
        tas = tempTemp;
        tempTemp = [];
            
    }//end of loop

    //mirror half
    if(mirrorTog){
        mirrorfalkes(fs);
    }

    // rotation sections
    if(singleTog){
        createOtherSections(1, fs);
    }else{
        createOtherSections(6, fs);
    }
    
    console.log("createOtherSections fs: "+fs.length);

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
                    id
                )
            );
        }
    }
    Array.prototype.push.apply(fs, tempFlake1);
    tempFlake1 = [];
}//end mirrorfalkes

function createOtherSections(num, fs){
    console.log("num: "+num);
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
                    id
                )
            );
            count++;
         }
    }
    fs = [];
    flakes = tempFlake;
    console.log("count: "+count);
    console.log("tempFlake: "+tempFlake.length);
    console.log("flakes: "+fs.length);
    //Array.prototype.push.apply(fs, tempFlake);
    console.log("flakes: "+fs.length);
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

function midpoint(p1, p2) {
    let x = (p1.x + p2.x)  / 2;
    let y = (p1.y + p2.y)  / 2;
    return new Point(x, y);
}//end midpoint

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

