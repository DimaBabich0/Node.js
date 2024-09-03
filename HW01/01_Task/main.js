var point = require('./point');

var point_1 = new point.Point(10, 20);
var point_2 = new point.Point(10, 10);

point_1.print();
point_2.print();

point.isParallel(point_1, point_2);
