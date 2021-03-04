const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const logo = require('asciiart-logo');
const chalk = require('chalk');

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
            message: '\nWhat would you like to do?',
            choices: ['View All Employees',
                'View Al Employees by Department',
                'View All Employees by Manager',
                'View All Departments',
                'View All Roles',
                'View All Managers',
                'Add Department',
                'Add Role',
                'Add Employee',
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
            } else if (answer.startMenu === 'View All Departments') {
                viewAllDepartments();
            } else if (answer.startMenu === 'View All Roles') {
                viewAllRoles();
            } else if (answer.startMenu === 'View All Managers') {
                viewAllManagers();
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
    console.log(chalk.cyan(logo({ name: 'ALL EMPLOYEES' }).render()));
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
    console.log(chalk.cyan(logo({ name: 'ALL EMPLOYEES BY DEPARTMENT' }).render()));
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
            console.table(res);
            start();
        }
    );
};

const viewAllByMgr = () => {
    let query = `SELECT DISTINCT m.first_name, m.last_name, m.id
    FROM employee
    LEFT JOIN employee m ON (employee.manager_id = m.id)`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let mgrList = [];
        let mgrIdList = [];
        for (let i = 0; i < res.length; i++) {
            mgrList.push(`${res[i].first_name} ${res[i].last_name}`);
            mgrIdList.push(res[i].id);
        };
        mgrList.shift();
        mgrIdList.shift();

        inquirer
            .prompt([{
                name: 'manager',
                type: 'list',
                message: 'What is the manager\s name?\n',
                choices: mgrList
            }, ])
            .then((answers) => {
                let newMgrId = '';
                for (let i = 0; i < mgrList.length; i++) {
                    if (mgrList[i] === answers.manager) {
                        newMgrId = mgrIdList[i];
                    }
                }
                const query2 = `SELECT CONCAT(first_name, ' ',last_name) AS ?
                FROM employee
                WHERE employee.manager_id = ?`

                connection.query(query2, [answers.manager, newMgrId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.cyan(logo({ name: 'EMPLOYEES BY MANAGER' }).render()));
                    console.table(res);
                    start();
                });
            });
    });
};

const viewAllDepartments = () => {
    console.log(chalk.cyan(logo({ name: 'ALL Departments' }).render()));
    const query = `SELECT dept_name AS 'Departments'
    FROM department;`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
};

const viewAllRoles = () => {
    console.log(logo({ name: 'ALL Roles' }).render());
    let roleList = [];
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
    let query = `Select * FROM role`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let roleList = [];
        let roleIdList = [];
        for (let i = 0; i < res.length; i++) {
            roleList.push(`${res[i].title}`);
            roleIdList.push(res[i].id);
        };

        const query2 = `SELECT DISTINCT m.first_name, m.last_name, m.id
        FROM employee
        LEFT JOIN employee m ON (employee.manager_id = m.id)`;

        connection.query(query2, (err, res) => {
            if (err) throw err;
            let mgrList = [];
            let mgrIdList = [];
            for (let i = 0; i < res.length; i++) {
                mgrList.push(`${res[i].first_name} ${res[i].last_name}`);
                mgrIdList.push(res[i].id);
            };
            mgrList.shift();
            mgrIdList.shift();

            inquirer
                .prompt([{
                        name: 'first_name',
                        type: 'input',
                        message: 'Enter employee\'s first name: ',
                    },
                    {
                        name: 'last_name',
                        type: 'input',
                        message: 'Enter employee\'s last name: ',
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
                .then((answers) => {
                    let newMgrId = '';
                    for (let i = 0; i < mgrList.length; i++) {
                        if (mgrList[i] === answers.manager) {
                            newMgrId = mgrIdList[i];
                        }
                    }
                    const query3 = `INSERT INTO employee(first_name, last_name, role_id, manager_id)VALUES(?,?,(SELECT role.id FROM role WHERE role.title = ?), ?)`

                    connection.query(query3, [answers.first_name, answers.last_name, answers.role, newMgrId],
                        (err, res) => {
                            console.log(newMgrId);
                            if (err) throw err;
                            console.log(`\n${answers.first_name} ${answers.last_name} added Successfully`);
                            start();
                        });
                });
        });
    });
};


const addRole = () => {
    let query = `SELECT * FROM department`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let deptList = [];
        let deptIdList = [];
        for (let i = 0; i < res.length; i++) {
            deptList.push(`${res[i].dept_name}`);
            deptIdList.push(res[i].id);
        };
        console.log(`\nCurrent Roles:`);
        console.log(deptList);
        inquirer
            .prompt([{
                    name: 'title',
                    type: 'input',
                    message: '\nWhat is the name of the role you would like to add?\n(See above list for current department roles)',
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
                    choices: deptList
                },
            ])
            .then((answers) => {
                let newDeptId = '';
                for (let i = 0; i < deptList.length; i++) {
                    if (deptList[i] === answers.dept) {
                        newDeptId = deptIdList[i];
                    }
                }
                const query = `INSERT INTO role(title, salary, dept_id)VALUES(?,?,?)`

                connection.query(query, [answers.title, answers.salary, newDeptId],
                    (err, res) => {
                        if (err) throw err;
                        console.log(chalk.magenta(`\n${answers.title} Role Added Successfully`));
                        start();
                    });
            });
    });
};

const addDepartment = () => {
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
            }, ])
            .then((answers) => {
                const query = `INSERT INTO department(dept_name)VALUES(?)`

                connection.query(query, [answers.dept],
                    (err, res) => {
                        if (err) throw err;
                        console.log(chalk.magenta(`\n${answers.dept} Department Added Successfully`));
                        start();
                    });
            });
    });
};

const removeEmployee = () => {
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
                let removeEmployee = answers.employees.split(' ');
                let query2 = `DELETE FROM employee where first_name = "${removeEmployee[0]}" AND last_name = "${removeEmployee[1]}"`;
                connection.query(query2, (err, res) => {
                    if (err) throw err;
                    console.log((chalk.magenta(`Employee ${answers.employees} Removed`)));
                    start();
                });
            });
    });
};

const updateEmployeeRole = () => {
    let query = `SELECT * FROM employee`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let employeeList = [];
        for (let i = 0; i < res.length; i++) {
            employeeList.push(`${res[i].first_name} ${res[i].last_name}`)
        };
        console.log(`Employees: ${employeeList}`);

        let query2 = `Select * FROM role`;
        connection.query(query2, (err, res) => {
            if (err) throw err;
            let roleList = [];
            let roleIdList = [];
            for (let i = 0; i < res.length; i++) {
                roleList.push(`${res[i].title}`);
                roleIdList.push(res[i].id);
            };
            console.log(`Roles: ${roleList}`);

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
                    let newRoleId = '';
                    for (let i = 0; i < roleList.length; i++) {
                        if (roleList[i] === answers.newRole) {
                            newRoleId = roleIdList[i];
                        }
                    }
                    let updateEmployee = answers.employees.split(' ');
                    let query3 = `UPDATE employee SET role_id = ${newRoleId} WHERE first_name = "${updateEmployee[0]}" AND last_name = "${updateEmployee[1]}"`;
                    connection.query(query3, (err, res) => {
                        if (err) throw err;
                        console.log((chalk.magenta(`\n${answers.employees}\'s Role Updated to ${answers.newRole}`)));
                        start();
                    });
                });
        });
    });
};
// const updateEmployeeMgr = () => {
//     const query = `SELECT * FROM employee`;

//     connection.query(query, (err, res) => {
//         if (err) throw err;
//         let employeeList = [];
//         for (let i = 0; i < res.length; i++) {
//             employeeList.push(`${res[i].first_name} ${res[i].last_name}`)
//         };
//         // console.log(`Employees: ${employeeList}`);

//         const query2 = `SELECT DISTINCT IFNULL(CONCAT(m.first_name, ' ',m.last_name),"") AS 'Managers'
//         FROM employee
//         LEFT JOIN employee m ON (employee.manager_id = m.id);`
//         connection.query(query2, (err, res) => {
//             if (err) throw err;
//             let mgrList = [];
//             let mgrIdList = [];
//             for (let i = 0; i < res.length; i++) {
//                 if ('Managers') {
//                     mgrList.push(`${res[i].first_name} ${res[i].last_name}`)
//                     mgrIdList.push(res[i].id);
//                 };
//             };
//             console.log(res);
//             console.log(`Managers: ${mgrList}`);
//             console.log(`Managers: ${mgrIdList}`);


//             inquirer
//                 .prompt([{
//                         name: 'employees',
//                         type: 'list',
//                         message: 'What is the name of the employee you would like to update?',
//                         choices: employeeList
//                     },
//                     {
//                         name: 'newManager',
//                         type: 'list',
//                         message: 'What is the name of the employee\'s new manager?',
//                         choices: mgrList

//                     },
//                 ])
//                 .then((answers) => {
//                     let newManagerId = '';
//                     for (let i = 0; i < mgrList.length; i++) {
//                         if (mgrList[i] === answers.newManager) {
//                             newManagerId = mgrIdList[i];
//                         }
//                     }
//                     let updateEmployee = answers.employees.split(' ');
//                     // let updateManager = answers.newManager.split(' ');
//                     let query3 = `UPDATE employee SET manager_id = ${newManagerId} WHERE first_name = "${updateEmployee[0]}" AND last_name = "${updateEmployee[1]}"`;
//                     connection.query(query3, (err, res) => {
//                         if (err) throw err;
//                         console.log(`\n${answers.employees}\'s Manager Updated to ${answers.newManager}`);
//                         start();
//                     });
//                 });
//         });
//     });
// };

// const updateEmployeeMgr = () => {
//     const query2 = `SELECT DISTINCT IFNULL(CONCAT(m.first_name, ' ',m.last_name),"") AS 'Managers'
//     FROM employee
//     LEFT JOIN employee m ON (employee.manager_id = m.id);`
//     connection.query(query2, (err, res) => {
//         if (err) throw err;
//         const mgrList = [];
//         for (let i = 0; i < res.length; i++) {
//             mgrList.push(`${res[i].first_name} ${res[i].last_name}`)
//         };
//         console.table(res);
//         start();
//     });
// };

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});