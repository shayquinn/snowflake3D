import {Point, Line} from './objects.js';
//Helper functions  //////////////////
export function subPoint(p1, p2){
    return new Point(p1.x-p2.x, p1.y-p2.y);
}//end subPoint

export function shortLine(sp, ep, size) {
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

export function findDistance(po1, po2) {
    return Math.sqrt(((po1.x - po2.x) * (po1.x - po2.x)) + ((po1.y - po2.y) * (po1.y - po2.y)));
}//end findDistance

export function newPosition(cp, speed, angle) {
    //https://stackoverflow.com/questions/39818833/moving-an-object-from-one-point-to-another
    let x = cp.x + (speed * Math.cos(angle));
    let y = cp.y + (speed * Math.sin(angle));
    return new Point(x, y);
}//end newPosition

export function findDir(p1, p2, angList3) {
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

export function radians_to_degrees(radians){
    return radians * (180/Math.PI);
}//end radians_to_degrees


export function findAngel(from, to) {
    //https://stackoverflow.com/questions/39818833/moving-an-object-from-one-point-to-another
    let deltaX = to.x - from.x;
    let deltaY = to.y - from.y;
    let angle = Math.atan2(deltaY, deltaX);
    return angle;
}//end findAngel

export function checkLine(setmLine, lie2, tol) {
    let intersectionPoint = findIntersection(lie2, setmLine); //Point
    let dx2 = setmLine.p1.x - intersectionPoint.x;
    let dy2 = setmLine.p1.y - intersectionPoint.y;
    let distance2 = Math.abs(Math.sqrt(dx2 * dx2 + dy2 * dy2));
    let tolLine = new Line(new Point(intersectionPoint.x, intersectionPoint.x), new Point(setmLine.p1.x, setmLine.p1.y));
    return intersects(lie2, new Line(new Point(setmLine.p1.x, setmLine.p1.y), new Point(setmLine.p2.x, setmLine.p2.y))) ||
        distance2 < tol / 2 && intersects(tolLine, new Line(new point(lie2.p1.x, lie2.p1.y), new point(lie2.p2.x, lie2.p2.y)));   
}//end checkLine

export function checkLines(setmLine, ll, tol) {
    let ret = false;
    for(let i=0;i<ll.length;i++){
        if(checkLine(setmLine, ll[i], tol)){
            ret = true;
        }
    }
    return ret;  
}//end checkLines

export function checkLinesClosest(inline, ll, tol) {
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

export function distance(p1, p2){
    let a = p1.x - p2.x;
    let b = p1.y - p2.y;
    return Math.sqrt( a*a + b*b );
}//end distance

export function intersects(l1, l2) {
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

export function findIntersection(l1, l2) {
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

export function PinC(circle, point) {
    const dx = point.x - circle.p.x;
    const dy = point.y - circle.p.y;
    return (Math.pow(dx, 2) + Math.pow(dy, 2)) <= Math.pow(circle.r, 2);
}//end PinC

export function convert(ang, xy, cxy) {    
    let p1 = cxy.x + Math.cos(ang * Math.PI / 180) * (xy.x - cxy.x) - Math.sin(ang * Math.PI / 180) * (xy.y - cxy.y);
    let p2 = cxy.y + Math.sin(ang * Math.PI / 180) * (xy.x - cxy.x) + Math.cos(ang * Math.PI / 180) * (xy.y - cxy.y);
    return new Point( p1, p2);   
}//end convert