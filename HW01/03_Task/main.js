var fraction = require('./fraction')
var frac_1 = new fraction.Fraction(3, 5);
var frac_2 = new fraction.Fraction(1, 7);

console.log('Fraction 1:');
frac_1.print();
console.log('Fraction 2:');
frac_2.print();

console.log('\nSummation:');
var res = fraction.sum(frac_1, frac_2);
res.print();

console.log('\nSubtraction:');
res = fraction.sub(frac_1, frac_2);
res.print();

console.log('\nMultiplication:');
res = fraction.mult(frac_1, frac_2);
res.print(); 

console.log('\nDivision:');
res = fraction.division(frac_1, frac_2);
res.print(); 