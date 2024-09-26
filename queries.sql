--Create users table --
Create table users(
    id serial primary key,
    email varchar(100) UNIQUE NOT NULL,
    password varchar(100) UNIQUE NOT NULL,
    allocation_tables varchar(100)
);

