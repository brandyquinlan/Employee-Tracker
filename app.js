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
                'Add Role',
                'Add Department',
                'Remove Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'Exit'
            ],
        })
        .then((answer) => {
            if (answer.startMenu === 'View All Employees') {
                viewAllEmployees();
            } else if (answer.startMenu === 'View Al Employees by Department') {
                viewAllByDept();
            } else if (answer.startMenu === 'View All Employees by Manager') {
                viewAllByMgr();
            } else if (answer.startMenu === 'Add Employee') {
                addEmployee();
            } else if (answer.startMenu === 'Add Role') {
                addRole();
            } else if (answer.startMenu === 'Add Department') {
                addDepartment();
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

const viewAllByMgr = () => {
    console.log(logo({ name: 'ALL EMPLOYEES BY MANAGER' }).render());
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
    ORDER by manager;`,
        function(err, results) {
            if (err) throw err;
            console.table(results);
            start();
        }
    );
};

const addEmployee = () => {
    inquirer
        .prompt([{
                name: 'first_name',
                type: 'input',
                message: 'Enter employee\'s first name',
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'Enter employee\'s last name',
            },
            {
                name: 'role',
                type: 'list',
                message: 'What is the employee\'s role?',
                choices: [
                    'Operation Manager',
                    'Lead Engineer',
                    'Quality Analyst',
                    'Operation Specialist',
                ],
            },
            {
                name: 'manager',
                type: 'list',
                message: 'Who is the employee\'s manager?',
                choices: [
                    `id 1 - Evelyn Lathrop`,
                    'id 4 - Dennis Young',
                ],
            },
        ])
        .then((answers) => {
            const query = `INSERT INTO employee(first_name, last_name, role_id, manager_id)VALUES(?,?,(SELECT role.id FROM role WHERE role.title = ?), ?)`
            const manager = answers.manager.split(' ');
            const manager_id = manager[1];

            connection.query(query, [answers.first_name, answers.last_name, answers.role, manager_id],
                (err, result) => {
                    if (err) throw err;
                    console.log(`New Employee Added Successfully`);
                });
        });
}
const addRole = () => {
    inquirer
        .prompt([{
                name: 'title',
                type: 'input',
                message: 'What is the name of the role you would like to add?',
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary for this role?',
            },
            {
                name: 'dept',
                type: 'list',
                message: 'Which department is the role in?',
                choices: [
                    '1 Operations',
                    '2 Engineering',
                ],
            },
        ])
        .then((answers) => {
            const query = `INSERT INTO role(title, salary, dept_id)VALUES(?,?,(SELECT role.dept_id FROM role WHERE role.title = ?)`
            const dept = answers.dept.split(' ');
            const dept_id = dept[1];

            connection.query(query, [answers.title, answers.salary, dept_id],
                (err, result) => {
                    if (err) throw err;
                    console.log(`New Employee Added Successfully`);
                });
        });
}

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});