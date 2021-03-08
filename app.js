// require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
const logo = require('asciiart-logo');
const cTable = require('console.table');
const chalk = require('chalk');

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employees_db'
});

// Function with menu options for the user
const start = () => {
    inquirer
        .prompt({
            name: 'startMenu',
            type: 'list',
            message: '\nWhat would you like to do?',
            choices: [
                'View All Employees',
                'View All Employees, Sorted by Manager',
                'View All Employees, Sorted by Department',
                'View Employees by Select Manager',
                'View Employees by Select Department',
                'View All Departments',
                'View All Roles',
                'View All Managers',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Remove Employee',
                'Update Employee Role',
                'Exit'
            ],
        })
        // Call function for selected action
        .then((answer) => {
            if (answer.startMenu === 'View All Employees') {
                viewAllEmployees();
            } else if (answer.startMenu === 'View All Employees, Sorted by Manager') {
                viewAllByMgr();
            } else if (answer.startMenu === 'View All Employees, Sorted by Department') {
                viewAllByDept();
            } else if (answer.startMenu === 'View Employees by Select Department') {
                viewEmpByDept();
            } else if (answer.startMenu === 'View Employees by Select Manager') {
                viewEmpByMgr();
            } else if (answer.startMenu === 'View All Departments') {
                viewAllDepartments();
            } else if (answer.startMenu === 'View All Roles') {
                viewAllRoles();
            } else if (answer.startMenu === 'View All Managers') {
                viewAllManagers();
            } else if (answer.startMenu === 'Add Department') {
                addDepartment();
            } else if (answer.startMenu === 'Add Role') {
                addRole();
            } else if (answer.startMenu === 'Add Employee') {
                addEmployee();
            } else if (answer.startMenu === 'Remove Employee') {
                removeEmployee();
            } else if (answer.startMenu === 'Update Employee Role') {
                updateEmployeeRole();
            } else if (answer.startMenu === 'Exit') {
                connection.end();
            }
        });
};

const viewAllEmployees = () => {
    // Query mySQL and display a table with all of the employees
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
    LEFT JOIN department ON department.id = role.dept_id`,
        (err, res) => {
            if (err) throw err;
            console.log(chalk.cyan(logo({ name: 'ALL EMPLOYEES' }).render()));
            console.table(res);
            start();
        }
    );
};

const viewAllByMgr = () => {
    // Query employee, role and department tables and display a table with all of the employees sorted by manager
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
        (err, res) => {
            if (err) throw err;
            console.log(chalk.cyan(logo({ name: 'ALL EMPLOYEES BY MANAGER' }).render()));
            console.table(res);
            start();
        }
    );
};

const viewAllByDept = () => {
    // Query employee, role and department tables and display a table with all of the employees sorted by department
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
        function(err, res) {
            if (err) throw err;
            console.log(chalk.cyan(logo({ name: 'ALL EMPLOYEES BY DEPARTMENT' }).render()));
            console.table(res);
            start();
        }
    );
};

const viewEmpByMgr = () => {
    // Query employee table to create manager list to provide in inquirer prompt
    let query = `SELECT DISTINCT m.first_name, m.last_name, m.id
    FROM employee
    LEFT JOIN employee m ON (employee.manager_id = m.id)`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let mgrList = [];
        let mgrIdList = [];
        for (let i = 0; i < res.length; i++) {
            if (res[i].first_name != null || res[i].last_name != null) {
                mgrList.push(`${res[i].first_name} ${res[i].last_name}`);
                mgrIdList.push(res[i].id);
            };
        };
        inquirer
            .prompt([{
                name: 'manager',
                type: 'list',
                message: 'What is the manager\s name?\n',
                choices: mgrList
            }, ])
            .then((answers) => {
                // Get manager id by mapping manager
                let newMgrId = '';
                for (let i = 0; i < mgrList.length; i++) {
                    if (mgrList[i] === answers.manager) {
                        newMgrId = mgrIdList[i];
                    }
                }
                // Query employee, role and department tables and display a table with all of the employees for selected manager
                const query2 = `SELECT CONCAT(first_name, ' ',last_name) AS 'Employee',
                role.title AS 'Title',
                department.dept_name AS 'Department',
                role.salary AS 'Salary'
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON department.id = role.dept_id
                WHERE employee.manager_id = ?`

                connection.query(query2, [newMgrId], (err, res) => {
                    if (err) throw err;
                    const mgrName = answers.manager;
                    console.log(chalk.cyan(logo({ name: mgrName }).render()));
                    console.log(`${mgrName}\'s Employees:\n`);
                    console.table(res);
                    start();
                });
            });
    });
};

const viewEmpByDept = () => {
    // Query department table to create department list to provide in inquirer prompt
    let query = `SELECT * FROM department`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let deptList = [];
        let deptIdList = [];
        for (let i = 0; i < res.length; i++) {
            deptList.push(`${res[i].dept_name}`);
            deptIdList.push(`${res[i].dept_id}`);
        };
        inquirer
            .prompt([{
                name: 'dept',
                type: 'list',
                message: 'Which department you would like to view?',
                choices: deptList
            }, ])
            .then((answers) => {
                console.log(deptList);
                let newDeptId = '';
                for (let i = 0; i < deptList.length; i++) {
                    if (deptList[i] === answers.manager) {
                        newDeptId = mgrIdList[i];
                    }
                }
                // Query employee, role and department tables and display a table with all of the employees for selected manager
                const query2 = `SELECT employee.id AS 'ID',
                CONCAT(employee.first_name, ' ',employee.last_name) AS 'Employee',
                role.title AS 'Title',
                department.dept_name AS 'Department',
                role.salary AS 'Salary',
                CONCAT(m.first_name, ' ',m.last_name) AS 'Manager'
                FROM employee
                LEFT JOIN employee m ON (employee.manager_id = m.id)
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON department.id = role.dept_id
                WHERE dept_name = ?`

                connection.query(query2, [answers.dept],
                    (err, res) => {
                        if (err) throw err;
                        const deptName = answers.dept;
                        console.log(chalk.cyan(logo({ name: deptName }).render()));
                        console.table(res);
                        start();
                    });
            });
    });
};

const viewAllDepartments = () => {
    console.log(chalk.cyan(logo({ name: 'ALL Departments' }).render()));
    // Query department table and display a table with all of the departments
    const query = `SELECT dept_name AS 'Departments'
    FROM department;`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
};

const viewAllRoles = () => {
    console.log(chalk.cyan(logo({ name: 'ALL Roles' }).render()));
    // Query mySQL and return a table with all of the roles
    const query = `SELECT role.title AS 'Roles'
    FROM role;`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
};

const viewAllManagers = () => {
    console.log(chalk.cyan(logo({ name: 'ALL Managers' }).render()));

    // Query mySQL and return a table with all of the managers
    const query = `SELECT DISTINCT IFNULL(CONCAT(m.first_name, ' ',m.last_name),"") AS 'Managers'
    FROM employee
    LEFT JOIN employee m ON (employee.manager_id = m.id);`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
};

const addEmployee = () => {
    // Query db to return role list and then push to array
    let query = `Select * FROM role`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let roleList = [];
        let roleIdList = [];
        for (let i = 0; i < res.length; i++) {
            roleList.push(`${res[i].title}`);
            roleIdList.push(res[i].id);
        };

        // Query db to return manager list and then push to array
        const query2 = `SELECT DISTINCT m.first_name, m.last_name, m.id
        FROM employee
        LEFT JOIN employee m ON (employee.manager_id = m.id)`;

        connection.query(query2, (err, res) => {
            if (err) throw err;
            let mgrList = [];
            let mgrIdList = [];
            for (let i = 0; i < res.length; i++) {
                if (res[i].first_name != null || res[i].last_name != null) {
                    mgrList.push(`${res[i].first_name} ${res[i].last_name}`);
                    mgrIdList.push(res[i].id);
                };
            };
            mgrList.push('None');

            inquirer
                .prompt([{
                        name: 'first_name',
                        type: 'input',
                        message: 'Enter employee\'s first name: ',
                        validate: validateText
                    },
                    {
                        name: 'last_name',
                        type: 'input',
                        message: 'Enter employee\'s last name: ',
                        validate: validateText
                    },
                    {
                        name: 'role',
                        type: 'list',
                        message: 'What is the employee\'s role?',
                        choices: roleList
                    },
                    {
                        name: 'manager',
                        type: 'list',
                        message: 'Who is the employee\'s manager?',
                        choices: mgrList
                    },
                ])
                // Get manager id by mapping manager in db query
                .then((answers) => {
                    let newMgrId = '';
                    for (let i = 0; i < mgrList.length; i++) {
                        if (mgrList[i] === answers.manager) {
                            newMgrId = mgrIdList[i];
                        }
                    }
                    if (answers.manager === 'none') {
                        let newMgrId = '';
                    } else {

                        // Add employee to db based on user inquirer responses
                        const query3 = `INSERT INTO employee(first_name, last_name, role_id, manager_id)VALUES(?,?,(SELECT role.id FROM role WHERE role.title = ?), ?)`

                        connection.query(query3, [answers.first_name, answers.last_name, answers.role, newMgrId],
                            (err, res) => {
                                if (err) throw err;
                                let first_name = answers.first_name;
                                let last_name = answers.last_name;
                                let role = answers.role;
                                let manager = answers.manager;

                                inquirer
                                    .prompt([{
                                        name: 'confirm',
                                        type: 'confirm',
                                        message: 'Would you like to add another employee?'
                                    }, ])
                                    .then((answers) => {
                                        if (!answers.confirm) {
                                            console.log(chalk.yellow(`\nNew Employee Added Successfully:\nName: ${first_name} ${last_name}\nRole: ${role}\nManager: ${manager}`));
                                            start();
                                        } else {
                                            addEmployee();
                                        };
                                    });

                            });
                    };
                });
        });
    });
};

const addRole = () => {
    // Query db to return department list and then push to array
    let query = `SELECT * FROM department`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let deptList = [];
        let deptIdList = [];
        for (let i = 0; i < res.length; i++) {
            deptList.push(`${res[i].dept_name}`);
            deptIdList.push(res[i].id);
        };

        inquirer
            .prompt([{
                    name: 'title',
                    type: 'input',
                    message: '\nWhat is the name of the role you would like to add?',
                    validate: validateText
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary for this role?',
                    validate: validateNumber
                },
                {
                    name: 'dept',
                    type: 'list',
                    message: 'Which department is the role in?',
                    choices: deptList
                },
            ])
            // Get dept id by mapping dept in db query
            .then((answers) => {
                let newDeptId = '';
                for (let i = 0; i < deptList.length; i++) {
                    if (deptList[i] === answers.dept) {
                        newDeptId = deptIdList[i];
                    }
                }
                // Add role to db based on user inquirer responses
                const query = `INSERT INTO role(title, salary, dept_id)VALUES(?,?,?)`

                connection.query(query, [answers.title, answers.salary, newDeptId],
                    (err, res) => {
                        if (err) throw err;
                        console.log(chalk.yellow(`\n${answers.title} Role Added\nDepartment: ${answers.dept}\nSalary: ${answers.salary}`));
                        start();
                    });
            });
    });
};

const addDepartment = () => {
    // Query db to return department list and then push to array and display to user for reference of current departments
    let query = `SELECT * FROM department`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let deptList = [];
        for (let i = 0; i < res.length; i++) {
            deptList.push(`${res[i].dept_name}`)
        };
        console.log(`\nCurrent Departments:`);
        console.log(deptList);
        inquirer
            .prompt([{
                name: 'dept',
                type: 'input',
                message: 'What is the name of the new department you would like to add?\n(See above list for current department titles)',
                validate: validateText
            }, ])
            // Add department to db based on user inquirer responses

        .then((answers) => {
            const query = `INSERT INTO department(dept_name)VALUES(?)`

            connection.query(query, [answers.dept],
                (err, res) => {
                    console.log(chalk.yellow(`\n${answers.dept} Department Added Successfully`));
                    start();
                });
        });
    });
};

const removeEmployee = () => {
    // Query employee table to get list of employees, push to array and display in inquirer prompt
    let query = `SELECT * FROM employee`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let employeeList = [];
        for (let i = 0; i < res.length; i++) {
            employeeList.push(`${res[i].first_name} ${res[i].last_name}`)
        };
        inquirer
            .prompt([{
                name: 'employees',
                type: 'list',
                message: 'What is the name of the employee you would like to remove?',
                choices: employeeList
            }, ])
            .then((answers) => {
                // Split employee name from list into first_name and last_name
                let removeEmployee = answers.employees.split(' ');
                let employee = answers.employees;

                inquirer
                    .prompt([{
                        name: 'confirm',
                        type: 'confirm',
                        message: `Are you sure you want to remove employee ${answers.employees}?`
                    }, ])
                    .then((answers) => {
                        if (!answers.confirm) {
                            start();
                        } else {
                            // Delete employee from employee table in db
                            let query2 = `DELETE FROM employee where first_name = "${removeEmployee[0]}" AND last_name = "${removeEmployee[1]}"`;
                            connection.query(query2, (err, res) => {
                                if (err) throw err;
                                console.log((chalk.yellow(`Employee ${employee} Removed Successfully`)));
                                start();
                            });
                        };
                    });
            });
    });
};

const updateEmployeeRole = () => {
    // Query employee table and create array of employees to display as list in inquirer prompt
    let query = `SELECT * FROM employee`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let employeeList = [];
        for (let i = 0; i < res.length; i++) {
            employeeList.push(`${res[i].first_name} ${res[i].last_name}`)
        };

        // Query role table, create array of roles to display to user. Get role id from mapping to role
        let query2 = `Select * FROM role`;

        connection.query(query2, (err, res) => {
            if (err) throw err;
            let roleList = [];
            let roleIdList = [];
            for (let i = 0; i < res.length; i++) {
                roleList.push(`${res[i].title}`);
                roleIdList.push(res[i].id);
            };

            inquirer
                .prompt([{
                        name: 'employees',
                        type: 'list',
                        message: 'What is the name of the employee you would like to update?',
                        choices: employeeList
                    },
                    {
                        name: 'newRole',
                        type: 'list',
                        message: 'What is the name of the employee\'s new role?',
                        choices: roleList
                    },
                ])
                .then((answers) => {
                    // Get role from inquirer response and get role id by mapping to role
                    let newRoleId = '';
                    for (let i = 0; i < roleList.length; i++) {
                        if (roleList[i] === answers.newRole) {
                            newRoleId = roleIdList[i];
                        }
                    }
                    // Split name of employee into first_name and last_name
                    let updateEmployee = answers.employees.split(' ');
                    // Query employee db to add employee and role names
                    let query3 = `UPDATE employee SET role_id = ${newRoleId} WHERE first_name = "${updateEmployee[0]}" AND last_name = "${updateEmployee[1]}"`;

                    connection.query(query3, (err, res) => {
                        if (err) throw err;
                        console.log((chalk.yellow(`\n${answers.employees}\'s Role Updated to ${answers.newRole}`)));
                        start();
                    });
                });
        });
    });
};

let validateNumber = (input) => {
    if (isNaN(input)) {
        return "Please enter a number";
    }
    return true;
}

let validateText = (input) => {
    if (!input) {
        return "Input cannot be blank";
    }
    return true;
}

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    start();
});