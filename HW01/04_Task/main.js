var student = require('./student');
var student_1 = new student.Student('Dima', 'Babich', 19);
var student_2 = new student.Student('Ivan', 'Ivanovich', 15);

var journal = require('./journal');
var journal_1 = new journal.Journal(student_1, student_2);

console.log("Journal after creating:")
journal_1.print(); 

console.log("--------------------------")
console.log("Journal after deleting:")
journal_1.deleteStudentByName('Dima', 'Babich');
journal_1.print(); 

console.log("--------------------------")
console.log("Journal after changes:")
journal_1.updateStudentByName('Ivan', 'Ivanovich', 'Dima', 'Babich', 19);
journal_1.print();