function Person(fName, lName, age)
{
  this.fName = fName;
  this.lName = lName;
  this.age = age;

  this.print = () => {
    console.log(`\tPerson:\nFirst name: ${this.fName}\nLast name: ${this.lName}\nAge: ${this.age}`);
  };
}

exports.Person = Person;