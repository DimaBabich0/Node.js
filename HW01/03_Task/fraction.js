function Fraction(numerator, denominator)
{
  this.numerator = numerator;
  this.denominator = denominator;

  this.print = () => {
    if (this.denominator === 0)
    {
      console.log("Denominator cannot be zero");
    }
    else
    {
      console.log(`${this.numerator}/${this.denominator}`);
    }
  }
}

function sum(A, B)
{
  const numerator = A.numerator * B.denominator + B.numerator * A.denominator;
  const denominator = A.denominator * B.denominator;
  const res = new Fraction(numerator, denominator);
  return res;
}

function sub(A, B)
{
  const numerator = A.numerator * B.denominator - B.numerator * A.denominator;
  const denominator = A.denominator * B.denominator;
  const res = new Fraction(numerator, denominator);
  return res;
}

function mult(A, B)
{
  const numerator = A.numerator * B.numerator;
  const denominator = A.denominator * B.denominator;
  const res = new Fraction(numerator, denominator);
  return res;
}

function division(A, B)
{
  const numerator = A.numerator * B.denominator;
  const denominator = A.denominator * B.numerator;
  const res = new Fraction(numerator, denominator);
  return res;
}

module.exports =
{
  Fraction: Fraction,
  sum: sum,
  sub: sub,
  mult: mult,
  division: division
};
