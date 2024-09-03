function Student(fName, lName, age)
{
  this.fName = fName;
  this.lName = lName;
  this.age = age;

  this.print = () => {
    console.log(`First name: ${this.fName}\nLast name: ${this.lName}\nAge: ${this.age}`);
  };
}

exports.Student = Student;