const mysql = require('mysql');
const inquirer = require('inquirer');
const logo = require('asciiart-logo');

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: 'localhost',

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: 'root',

    // Your password
    password: '2Calicos!',
    database: 'employees_db'
});

// function which prompts the user for what action they should take
const start = () => {
    inquirer
        .prompt({
            name: 'startMenu',
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees',
                'View Al Employees by Department',
                'View All Employees by Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'Exit'
            ],
        })
        .then((answer) => {
            // based on their answer, either call the bid or the post functions
            if (answer.startMenu === 'View All Employees') {
                viewAllEmployees();
            } else if (answer.startMenu === 'View Al Employees by Department') {
                viewAllByDept();
            } else if (answer.startMenu === 'View All Employees by Manager') {
                viewAllByMgr();
            } else if (answer.startMenu === 'Add Employee') {
                addEmployee();
            } else if (answer.startMenu === 'Remove Employee') {
                removeEmployee();
            } else if (answer.startMenu === 'Update Employee Role') {
                updateEmployeeRole();
            } else if (answer.startMenu === 'Update Employee Manager') {
                updateEmployeeMgr();
            } else if (answer.startMenu === 'Exit') {
                connection.end();
            }
        });
};

const viewAllEmployees = () => {
    console.log(logo({ name: 'ALL EMPLOYEES' }).render());
    connection.query(`SELECT employee.id AS 'ID',
    employee.first_name AS 'First Name',
    employee.last_name AS 'Last Name',
    role.title AS 'Title',
    department.dept_name AS 'Department',
    role.salary AS 'Salary',
    CONCAT(m.first_name, ' ',m.last_name) AS 'Manager'
    FROM employee
    LEFT JOIN employee m ON (employee.manager_id = m.id)
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON department.id = role.dept_id;`,
        function(err, res) {
            if (err) throw err;
            console.table(res);
            start();
        }
    );
};

const viewAllByDept = () => {
    console.log(logo({ name: 'ALL EMPLOYEES BY DEPARTMENT' }).render());
    connection.query(`SELECT employee.id AS 'ID',
    employee.first_name AS 'First Name',
    employee.last_name AS 'Last Name',
    role.title AS 'Title',
    department.dept_name AS 'Department',
    role.salary AS 'Salary',
    CONCAT(m.first_name, ' ',m.last_name) AS 'Manager'
    FROM employee
    LEFT JOIN employee m ON (employee.manager_id = m.id)
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON department.id = role.dept_id
    ORDER by dept_name;`,
        function(err, results) {
            if (err) throw err;
            console.table(results);
            start();
        }
    );
};

// const addEmployee = () => {
//         inquirer
//             .prompt([{
//                     name: 'first_name',
//                     type: 'input',
//                     message: 'Enter employee\'s first name',
//                 },
//                 {
//                     name: 'last_name',
//                     type: 'input',
//                     message: 'Enter employee\'s last name',
//                 },
//                 {
//                     name: 'role',
//                     type: 'list',
//                     message: 'What is the employee\'s role?',
//                     choices: [
//                         'Operation Manager',
//                         'Lead Engineer',
//                         'Quality Analyst',
//                         'Operation Specialist',
//                     ],
//                 },
//                 {
//                     name: 'manager',
//                     type: 'list',
//                     message: 'Who is the employee\'s manager?',
//                     choices: [
//                         'Evelyn Lathrop',
//                         'Dennis Young',
//                     ],
//                 },
//             ])
//             .then((answers) => {
//                 const firstName = answers.first_name;
//                 const lastName = answers.last_name;
//                 const role = answers.role;
//                 const manager = answers.manager.split(' ');
//                 const manager_id = manager[1];

//                 connection.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id)VALUES(?,?,(SELECT role.id FROM role WHERE title = ?, (SELECT employee.id FROM employee WHERE last_name = ?))`, [firstName, lastName, role, manager_id],
//                     (err, result) => {
//                         if (err) throw err;
//                         console.log(`New Employee Added Successfully`);
//                     });
//             });

//     }



// (SELECT role.id FROM role LEFT JOIN employee ON (employee.manager_id = employee.id)WHERE employee.manager_id = ?)
// ,(SELECT employee.id FROM employee WHERE manager_id = managerID)

// const manager = answers.
// let role_id1 = answers.role;
// if (answers.role === 'Operation Manager') {
//     let role_id = 1;
//     let manager_id = 4;
// let role_id2 = answers.role;
// if (role_id2 === 'Lead Engineer') role_id2 = 1;
// let role_id3 = answers.role;
// if (role_id3 === 'Quality Analyst') role_id3 = 1;
// let role_id4 = answers.role;
// if (role_id4 === 'Operations Specialist') role_id4 = 1;

// console.log(role_id);
//             connection.query('INSERT INTO employee SET ?', {
//                     first_name: answers.first_name,
//                     last_name: answers.last_name,
//                     role_id: role_id,
//                 },
//                 (err) => {
//                     if (err) throw err;
//                     console.log('Employee Added Successfully');
//                     start();
//                 }
//             );
//             // };
//         });
// }


// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    start();
});