import { subPoint, shortLine, findDistance, findDir,checkLine, checkLines, checkLinesClosest, findIntersection, PinC, convert } from './helper_functions.js';
import { Flake, Point, Line, Circle, Branch, Hexagon } from './objects.js';

//Create functions  ///////////////////
export function createPlainHexagon(point, hexSize){
    let points = [];
    for(let i=0;i<6;i++){
        let p = convert(60 * i, new Point(point.x, point.y - hexSize), point);
        points[i] = new Point(p.x, p.y);
    }
    return new Hexagon(points, point);
}//end createHexagon

export function createHex(p1, p2, dir, size, ofs) {
        let h1, h2, s1, s2;
        if(ofs < 25){
            ofs = 25 - ofs;
            s1 = size+(ofs/100);
            s2 = size;
            h1 = createPlainHexagon(p1, size+(ofs/100));
            h2 = createPlainHexagon(p2, size);
        }else if(ofs > 25){
            ofs = ofs-25;
            s1 = size;
            s2 = size+(ofs/100);
            h1 = createPlainHexagon(p1, size);
            h2 = createPlainHexagon(p2, size+(ofs/100));
        }else if(ofs == 25){
            ofs = 0;
            s1 = size;
            s2 = size;
            h1 = createPlainHexagon(p1, size);
            h2 = createPlainHexagon(p2, size);
        }
    return createHexCrystel(s1, s2, h1, h2, dir);
}//endcreateHex

export function createHexCrystel(s1, s2, h1, h2, dir) {
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

export function randomise(type, centerP, BOs, level) {
    // Branch(startPoint, len, size, ofs)
    let BOsTemp = [];

    function getRandomLength(min, max, size) {
        let length = returnRandom(min, max) / 100;
        return length < size ? size : length;
    }

    if (type === "all") {
        let size = returnRandom(1, 50) / 100;
        BOsTemp.push(new Branch(centerP, getRandomLength(5, 300, size), size, returnRandom(0, 50)));
        for (let i = 1; i < level; i++) {
            size = returnRandom(1, 100) / 100;
            BOsTemp.push(
                new Branch(
                    BOsTemp[BOsTemp.length - 1].endPoint(),
                    getRandomLength(5, 400, size),
                    size,
                    returnRandom(10, 40)
                )
            );
        }
    } else if (type === "length") {
        if (BOs.length > 0) {
            BOsTemp.push(new Branch(centerP, getRandomLength(5, 400, BOs[0].size), BOs[0].size, BOs[0].ofs));
            for (let i = 1; i < level; i++) {
                BOsTemp.push(
                    new Branch(
                        BOsTemp[BOsTemp.length - 1].endPoint(),
                        getRandomLength(5, 400, BOs[i].size),
                        BOs[i].size,
                        BOs[i].ofs
                    )
                );
            }
        } else {
            console.error("dataObj.BOs is empty or not properly initialized.");
        }
    } else if (type === "size") {
        if (BOs.length > 0) {
            let size = returnRandom(1, 100) / 100;
            BOsTemp.push(new Branch(centerP, BOs[0].len, size, BOs[0].ofs));
            for (let i = 1; i < level; i++) {
                size = returnRandom(1, 100) / 100;
                BOsTemp.push(
                    new Branch(
                        BOsTemp[BOsTemp.length - 1].endPoint(),
                        BOs[i].len,
                        size,
                        BOs[i].ofs
                    )
                );
            }
        } else {
            console.error("dataObj.BOs is empty or not properly initialized.");
        }
    } else if (type === "offset") {
        if (BOs.length > 0) {
            BOsTemp.push(new Branch(centerP, BOs[0].len, BOs[0].size, returnRandom(0, 50)));
            for (let i = 1; i < level; i++) {
                BOsTemp.push(
                    new Branch(
                        BOsTemp[BOsTemp.length - 1].endPoint(),
                        BOs[i].len,
                        BOs[i].size,
                        returnRandom(0, 50)
                    )
                );
            }
        } else {
            console.error("dataObj.BOs is empty or not properly initialized.");
        }
    }
    return BOsTemp;
}//end randomise

export function returnRandom(min, max){
    return Math.floor(Math.random() * (max - min) ) + min;
}//end returnRandom

export function rd(num){
    //Round to One Decimal Place
    return (Math.round(num * 10) / 10);
}//end rd

export function createBranchlist(BOs, level, scale, branchL, centerP){
    let size = scale;
    let bln = branchL;
    //if Branch Object List is null or empty populate it
    //Branch(startPoint, len, size, ofs)

    let BOsT = [];
    
    //Update add or remove Branch Object
    BOsT.push(new Branch(new Point(BOs[0].startPoint.x, BOs[0].startPoint.y), BOs[0].len,  BOs[0].size, BOs[0].ofs));
    for (let i = 1; i < level ; i++) {
        if(i < BOs.length){
            BOsT.push(new Branch(BOs[i-1].endPoint(), BOs[i].len, BOs[i].size, BOs[i].ofs));
        }else{
            BOsT.push(new Branch(BOs[BOs.length-1].endPoint(), bln, size, 25));
        }    
    }
    
    return BOsT
}//end createBranchlist


/**
 * Calculates the sum of the lengths of the branches in the given array of branch objects.
 * Additionally, adds the size of the last branch to the total sum.
 *
 * @param {Array} BObjs - An array of branch objects, where each object contains properties `len` and `size`.
 * @returns {number} - The total sum of the lengths of the branches, including the size of the last branch.
 */
export function SumBranch(dataObj){
    let sumBranch = 0;
    for (let i = 0; i < dataObj.BOs.length; i++) {
        // Add the length of the current branch to the total sum
        sumBranch += rd(Number(dataObj.BOs[i].len));
        // If this is the last branch, add its size to the total sum
        if(i == dataObj.BOs.length-1){
            sumBranch += (dataObj.BOs[i].size);
        }
    }return sumBranch;
}//end sumBranch

export function createGuides(dataObj, centerP) {
    dataObj.LBOs = [];
    let sumBranch = SumBranch(dataObj);
    //vertical line 
    let verticleLine = convert(270, new Point(centerP.x + sumBranch, centerP.y), centerP);

    //crop line temp
    let cropLineTemp = convert(dataObj.cropAngel, new Point(verticleLine.x + sumBranch - 50, verticleLine.y), verticleLine);
    
    //v line temp SpaceLines
    let vLineTemp = convert(300, new Point(centerP.x + sumBranch + 100, centerP.y), centerP);
    let vLineTemp1 = convert(300, new Point(centerP.x + sumBranch + 100, centerP.y - Number(dataObj.SpaceLines) / 100), new Point(centerP.x, centerP.y - Number(dataObj.SpaceLines) / 100));
    
    //find intersection
    let crop_v_inter = findIntersection(new Line(verticleLine, cropLineTemp), new Line(centerP, vLineTemp));
    let crop_v_inter1 = findIntersection(new Line(verticleLine, cropLineTemp), new Line(new Point(centerP.x, centerP.y - Number(dataObj.SpaceLines) / 100), vLineTemp1));
    
    //crop line
    let cropLine = new Line(verticleLine, crop_v_inter1);
    dataObj.LBOs.push(cropLine);
    
    //v line
    let vLine = new Line(new Point(centerP.x, centerP.y), crop_v_inter);
    let vLine1 = new Line(new Point(centerP.x, centerP.y - Number(dataObj.SpaceLines) / 100), crop_v_inter1);
    dataObj.LBOs.push(vLine);
    dataObj.LBOs.push(vLine1);
    
    for (let i = 0; i < dataObj.BOs.length; i++) {
        // Skip if branch length is equal to or less than its size
        if (dataObj.BOs[i].len <= dataObj.BOs[i].size) {
            continue;
        }

        let LineTemp = convert(330, new Point(dataObj.BOs[i].midPoint().x + sumBranch, dataObj.BOs[i].midPoint().y), dataObj.BOs[i].midPoint());
        let LineTempline = new Line(dataObj.BOs[i].midPoint(), LineTemp);
        if (checkLine(LineTempline, cropLine, 0)) {    
            dataObj.LBOs.push(new Line(dataObj.BOs[i].midPoint(), findIntersection(LineTempline, cropLine)));
        } else if (checkLine(LineTempline, vLine1, 0)) {
            dataObj.LBOs.push(new Line(dataObj.BOs[i].midPoint(), findIntersection(LineTempline, vLine1)));
        }
    }
}//end createGuides

export function checkFlake(dataObj, flakes, tempLines, line, flake, centerPoint, peakLine, peak, check, closestIntersection, shortPoint) {
    let originPoint = new Point(0, 0);
    let peakPoint = flake.hexagon.points[0];

    let peakLineSegment = new Line(flake.p1, peakPoint); 
    
    // if branch is not a stem or a seed
    if (flake.text !== "stem" && flake.text !== "seed") {
        // if a branch is to the left of the center line
        if (flake.p2.x >= centerPoint.x) {
            if (flake.p1.y < dataObj.LBOs[2].startPoint.y) {
                // if a branch hits a guide or crop line
                if (checkLines(peakLineSegment, dataObj.LBOs, 0)) {
                    peakLine.push(peakLineSegment);
                    peak.push(subPoint(peakPoint, originPoint));
                    check.push(true);
                    let closestLine = checkLinesClosest(peakLineSegment, dataObj.LBOs, 0);
                    closestIntersection.push(closestLine);
                    let shortLineSegment = shortLine(subPoint(flake.p1, originPoint), closestLine, flake.size2);
                    shortPoint.push(shortLineSegment);
                    // if cropping is active
                    let distance = findDistance(closestLine, shortLineSegment);
                    //let distance = Math.round(findDistance(closestLine, shortLineSegment));
                    let circle = new Circle(shortLineSegment, distance);
                    // if branch start point is below SpaceLines do not add    
                    if (rd(flake.p1.y) < rd(dataObj.LBOs[2].startPoint.y)) {
                        // if branch start point is in the radius or size do not add
                        if (!PinC(circle, flake.p1)) {
                            if(circle.r > 0){
                                dataObj.circles.push(circle);
                            }
                            let lineSegment = new Line(flake.p1, shortLineSegment);
                            let newFlake = new Flake(flake.p1, shortLineSegment, flake.level, flake.size, flake.dir, flake.text, flake.ofs);
                            flakes.push(newFlake);
                            tempLines.push(lineSegment);           
                        }
                    }   
                }else{
                    peakLine.push(null);
                    peak.push(null);
                    check.push(false);
                    // if cropping is active
                    if (dataObj.crop) {
                        // if branch start point is in the radius or size do not add
                        flakes.push(flake);
                        tempLines.push(line);
    
                    } else {
                        flakes.push(flake);
                        tempLines.push(line);
                    }
                }
            }
        }
    } else {
        closestIntersection.push(null);
        shortPoint.push(null);
        flakes.push(flake);
        tempLines.push(line);
    }

}// end checkFlake


export function createFlakes(dataObj, flakes, scale, centerP, angList3, peakLine, peak, check, closest_intersection, shortPoint) {
    flakes.length = 0; // Clear the array without losing the reference
    let fs = flakes;   
    let b_list = dataObj.BOs;
    let tas = []; //temp Array Seeds
    let tempTemp = [];
    let size = scale;
    let ang = findDir(centerP, new Point(centerP.x, centerP.y - b_list[0].len), angList3);

    dataObj.circles = [];
    ////////////////
    // Initial seed flake
    let testline0 = new Line(centerP, new Point(centerP.x, centerP.y - b_list[0].len));
    let test_flake0 = new Flake(centerP, new Point(centerP.x, centerP.y - b_list[0].len), 0,  b_list[0].size, ang, "seed", b_list[0].ofs);
    ////////////////
    checkFlake(dataObj, fs, tempTemp, testline0, test_flake0, centerP, peakLine, peak, check, closest_intersection, shortPoint);
    ////////////////
    for (let i = 0; i < dataObj.level; i++) {
        if(b_list[i] !== undefined){          
            let bL = b_list[i].len;
            //let bL = 100;
            //float sz = (float)(((Math.random()*(0.1 - 1.5))) + 0.1); 
            //size = sz;
            size = rd(size - ((size / dataObj.level) * i) / 2);
            for(let j=0;j<tas.length;j++){
                let ang = findDir(tas[j].p1, tas[j].p2, angList3);
                if (tas[j].p2.x >= centerP.x) {
                    // Check left branch
                    
                    let leftang = ang - 1;
                    if (leftang == -1) {
                        leftang = 5;
                    }
                    let leftT = convert(angList3[leftang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2, tas[j].y2);          
                    let testPoint1 = tas[j].p2;
                    let testline1 = new Line(testPoint1, leftT);
                    let test_flake1 = new Flake(testPoint1, leftT, i, b_list[i].size, leftang, "left", b_list[i].ofs);
                    
                    ////////////////
                    checkFlake(dataObj, fs, tempTemp, testline1, test_flake1, centerP, peakLine, peak, check, closest_intersection, shortPoint);
                    ////////////////
                    // Check center branch
                    if (rd(tas[j].p2.x) == centerP.x) {
                        let centerang = ang;
                        let centerT = convert(angList3[centerang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                        let testPoint2 = tas[j].p2;
                        let testline2 = new Line(testPoint2, centerT);
                        let test_flake2 = new Flake(testPoint2, centerT, i, b_list[i].size, centerang, "stem", b_list[i].ofs);
                        ////////////////
                        checkFlake(dataObj, fs, tempTemp, testline2, test_flake2, centerP, peakLine, peak, check, closest_intersection, shortPoint);
                        ////////////////
                    } else {
                        let centerang = ang;
                        let centerT = convert(angList3[centerang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                        let testPoint3 = tas[j].p2;
                        let testline3 = new Line(testPoint3, centerT);
                        let test_flake3 = new Flake(testPoint3, centerT, i, b_list[i].size, centerang, "center", b_list[i].ofs);                        
                        ////////////////
                        checkFlake(dataObj, fs, tempTemp, testline3, test_flake3, centerP, peakLine, peak, check, closest_intersection, shortPoint);
                        ////////////////
                    }
                    // Check right branch
                    let rightang = ang + 1;
                    if (ang == 5) {
                        rightang = 0;
                    }

                    let rightT = convert(angList3[rightang], new Point(tas[j].p2.x + bL, tas[j].p2.y), tas[j].p2);
                    let testPoint4 = tas[j].p2;
                    let testline4 = new Line(testPoint4, rightT);
                    let test_flake4 = new Flake(testPoint4, rightT, i, b_list[i].size, rightang, "right", b_list[i].ofs);
                    ////////////////////
                    checkFlake(dataObj, fs, tempTemp, testline4, test_flake4, centerP, peakLine, peak, check, closest_intersection, shortPoint);
                    ///////////////////
                }
            }
        }
            
        tas = tempTemp;
        tempTemp = [];
            
    }//end of loop
    //mirror half
    if(dataObj.mirrorTog){
        mirrorfalkes(fs, centerP);
    }

    // rotation sections
    if(dataObj.singleTog){
        createOtherSections(1, fs, flakes, centerP);
    }else{
        createOtherSections(6, fs, flakes, centerP);
    }
    
}//end createFlakes

export function mirrorfalkes(fs, centerP){
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

export function createOtherSections(num, fs, flakes, centerP){
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
    fs.length = 0; // Clear the array without losing the reference
    Array.prototype.push.apply(fs, tempFlake);
    flakes.length = 0; // Clear the array without losing the reference
    Array.prototype.push.apply(flakes, tempFlake);
}//end createOtherSections


