SELECT * FROM employees_db.departments;
INSERT INTO `employees_db`.`departments` (`id`, `dept_name`) VALUES ('1', 'Operations');
INSERT INTO `employees_db`.`departments` (`id`, `dept_name`) VALUES ('2', 'Engineering');
INSERT INTO `employees_db`.`departments` (`id`, `dept_name`) VALUES ('3', 'Quality');
INSERT INTO `employees_db`.`departments` (`id`, `dept_name`) VALUES ('4', 'Production');

SELECT * FROM employees_db.employees;
INSERT INTO `employees_db`.`roles` (`id`, `title`, `salary`, `dept_id`) VALUES ('1', 'Operation Manager', '120000', '1');
INSERT INTO `employees_db`.`roles` (`id`, `title`, `salary`, `dept_id`) VALUES ('2', 'Lead Engineer', '90000', '2');
INSERT INTO `employees_db`.`roles` (`id`, `title`, `salary`, `dept_id`) VALUES ('3', 'Production Artist', '70000', '7');
INSERT INTO `employees_db`.`roles` (`id`, `title`, `salary`, `dept_id`) VALUES ('4', 'Quality Analyst', '75000', '1');
INSERT INTO `employees_db`.`roles` (`id`, `title`, `salary`, `dept_id`) VALUES ('5', 'Operation Specialist', '65000', '1');

SELECT * FROM employees_db.employees;
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`) VALUES ('2', 'Joanna', 'Brady', '2');
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES ('3', 'Butch', 'Dixon', '4', '1');
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`) VALUES ('4', 'Dennis', 'Young', '1');
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES ('5', 'Landon', 'Griffith', '5', '2');
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES ('6', 'Heather', 'White', '5', '2');
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES ('7', 'Harry', 'Alexander', '3', '3');
INSERT INTO `employees_db`.`employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES ('8', 'Ruben', 'Batrez', '3', '3');

