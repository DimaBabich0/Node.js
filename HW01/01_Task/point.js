function Point(x, y)
{
  this.x = x;
  this.y = y;
  this.print = () => {
    console.log(`Point: X = ${this.x}; Y = ${this.y}`);
  };
}

function isParallel(A, B)
{
  if (A.y === B.y)
  {
    console.log('Parallel to X');
  }
  else if (A.x === B.x)
  {
    console.log('Parallel to Y');
  }
  else
  {
    console.log('Not parallel'); 
  }
}

module.exports = {
  Point: Point,
  isParallel: isParallel
};