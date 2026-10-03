# Notes Storage App with MySQL Docker Setup

A simple two-tier Notes Storage application built using HTML, CSS, JavaScript, Node.js, Express.js, MySQL, and Docker. A simple app where users write notes, and each note is stored in the MySQL database.

### Architecture

This project uses a two-tier architecture:
```
┌──────────────────────┐
│   Client / Browser   │
│    HTML/CSS/JS       │
└──────────┬───────────┘
           │
           │ HTTP
           ▼
┌──────────────────────┐
│   Node.js + Express  │
│      Backend         │
└──────────┬───────────┘
           │
           │ MySQL
           ▼
┌──────────────────────┐
│     MySQL Database   │
│      Container       │
└──────────────────────┘
```

The Node.js backend and MySQL database run in separate Docker containers and communicate through a Docker network.



## Prerequisites
Before you begin, make sure you have the following installed:

Docker 

Git (optional, for cloning the repository)




## Setup
### Clone this repository (if you haven't already):
 ```bash
git clone https://github.com/jarkalrohan-bit/dockerized-notes-app.git
```
### Navigate to the project directory:
 ```bash
cd dockerized-notes-app
```

### Create a .env file in the project directory to store your MySQL environment variables:
 ```bash
touch .env
```

### Open the .env file and add your MySQL configuration:
 ```bash
MYSQL_HOST=mysql
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=your_database
```


# To run this two-tier application using without docker-compose

### First create a docker image from Dockerfile
```bash
docker build -t notes-app .
```

Now, make sure that you have created a network using following command
docker network create twotier

Attach both the containers in the same network, so that they can communicate with each other
```bash
i) MySQL container

docker run -d \
    --name mysql \
    -v mysql-data:/var/lib/mysql \
    --network=twotier \
    -e MYSQL_DATABASE=notesdb \
    -e MYSQL_ROOT_PASSWORD=admin \
    -p 3306:3306 \
    mysql

ii) Backend container

docker run -d \
    --name node \
    --network=twotier \
    -e MYSQL_HOST=mysql \
    -e MYSQL_USER=root \
    -e MYSQL_PASSWORD=admin \
    -e MYSQL_DB=notesdb \
    -p 3000:3000 \
    notes-app
```

### Access the Application

Once both containers are running, open:

- http://localhost:3000


### Check Running Containers
```bash
docker ps
```

You should see both:

mysql

node

### Stop the Containers
```bash
docker stop node mysql
```

### Remove the Containers
```bash
docker rm node mysql
```

The mysql-data volume is separate from the container, so removing the container does not remove the database data.


## Current Project Status
 HTML/CSS/JavaScript frontend

 Node.js + Express backend

 MySQL database

 Dockerfile

 Docker networking

 MySQL Docker volume

 Two-tier application setup
## Future Improvements
 Improve UI/design

 Add more features

 Docker Compose

 Authentication

 Production deployment
