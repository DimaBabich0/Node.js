function Journal(...students)
{
  this.students = students;

  this.print = () => {
    var num = 1;
    this.students.forEach((student) => {
      console.log(`\tStudent #${num++}`);
      student.print();
    });
  };

  this.addStudent = (student) => {
    this.students.push(student);
  };

  this.deleteStudentByName = (fName, lName) => {
    this.students = this.students.filter(student => !(student.fName === fName && student.lName === lName));
  };

  this.updateStudentByName = (fName, lName, newFName, newLName, newAge) => {
    const student = this.students.find(student => student.fName === fName && student.lName === lName);

    if (student)
    {
      student.fName = newFName;
      student.lName = newLName;
      student.age = newAge;
    }
    else
    {
      console.log(`Student "${fName} ${lName}" not found`);
    }
  };
}

exports.Journal = Journal;