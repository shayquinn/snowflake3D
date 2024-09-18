import {createHex} from './utility.js';

//Objects  ///////////////////
export function Flake(p1, p2, level, size, dir, text, ofs){
    this.p1 = p1;
    this.p2 = p2;
    this.level = level;
    this.size = size; 
    this.dir = dir;
    this.text = text;
    this.ofs = ofs;
    this.line = new Line(this.p1, this.p2);
    this.hexObject = createHex(this.p1, this.p2, this.dir, this.size, this.ofs);
    this.hexagon = this.hexObject.hex;
    this.size1 = this.hexObject.size1;
    this.size2 = this.hexObject.size2;
}//end flake 

Flake.prototype.midPoint = function() {
   return new Point((this.p1.x + this.p2.x)/2, (this.p1.y + this.p2.y)/2); 
};

export function Point(x, y) {
    this.x = x;
    this.y = y; 
}//end Point

export function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.x1 = p1.x;
    this.y1 = p1.y;
    this.x2 = p2.x;
    this.y2 = p2.x;
    this.startPoint = p1;
    this.endPoint = p2;
}//end Line

export function Circle(p, r){
    this.p = p;
    this.r = r;
}//end Circle

export function Branch(startPoint, len, size, ofs){
    this.startPoint = startPoint;
    this.len = len;
    this.size = size;
    this.ofs = ofs;
}//end Branch

Branch.prototype.endPoint = function() {
    return new Point(this.startPoint.x, (this.startPoint.y - this.len));
};

Branch.prototype.midPoint = function() {
    return new Point(this.startPoint.x, (this.startPoint.y - (this.len/2))); 
};

export function Hexagon(points, point){
    this.points = points;
    this.point = point;
}//end Hexagon