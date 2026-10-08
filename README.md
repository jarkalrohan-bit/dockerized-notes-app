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
           │ HTTP (port 3000)
           ▼
┌──────────────────────┐
│   Node.js + Express  │
│      Backend         │
└──────────┬───────────┘
           │
           │ MySQL (port 3306)
           ▼
┌──────────────────────┐
│     MySQL Database   │
│    (Volume Managed)  │
└──────────────────────┘
```

The Node.js backend and MySQL database run in separate Docker containers, utilizing internal Docker DNS networking to securely communicate.



## Prerequisites
Before you begin, make sure you have the following installed:

* Docker & Docker Compose

* Git (optional, for cloning the repository)




## Production-Ready Environment Setup (🔒 Strict Approach)
1. **Clone this repository:**
   ```bash
   git clone https://github.com/jarkalrohan-bit/dockerized-notes-app.git
   cd dockerized-notes-app
   ```

2. **Create a `.env` file in the root project directory:**
   ```bash
   touch .env
   ```

3. **Open the `.env` file and define your strict database credentials:**
   ```ini
   DB_HOST=mysql
   DB_USER=root
   DB_PASS=your_secure_password
   DB_NAME=notesdb
   ```
---

## Method 1: The Modern Way (Using Docker Compose - Recommended) 🚀

Docker Compose orchestrates both containers, manages internal networks, handles stateful persistent volumes, and implements health checks to eliminate backend boot-up race conditions.

### Start the Application
Simply run the following command to build, link, and spin up the complete stack in the background:
```bash
docker compose up -d
```

### Stop and Clean Up
To stop the application while keeping your saved data safe:
```bash
docker compose down
```
To stop the application and completely wipe the database storage volume to start fresh:
```bash
docker compose down -v
```

---

## Method 2: The Manual Way (Without Docker Compose) 🛠️

If you prefer to orchestrate the infrastructure components manually via the Docker CLI:

### 1. Build your local image
```bash
docker build -t rohanjarkal/node-app:latest .
```

### 2. Create an isolated virtual network
```bash
docker network create helpdesk-net
```

### 3. Spin up the MySQL Database Container
```bash
docker run -d \
  --name notes-db \
  --network helpdesk-net \
  --network-alias mysql \
  -e MYSQL_ROOT_PASSWORD=your_secure_password \
  -e MYSQL_DATABASE=notesdb \
  -p 3306:3306 \
  mysql:8.0
```
*Note: Wait 15 seconds after running this command to allow the database internal systems to completely initialize.*

### 4. Spin up the Node.js API Backend Container
```bash
docker run -d \
  --name notes-web \
  --network helpdesk-net \
  -p 3000:3000 \
  -e DB_HOST=mysql \
  -e DB_USER=root \
  -e DB_PASS=your_secure_password \
  -e DB_NAME=notesdb \
  rohanjarkal/node-app:latest
```

## Check Running Containers
To verify that both your API and database microservices are successfully running side-by-side, run:
```bash
docker ps
```
You should see both **`notes-web`** and **`notes-db`** actively listed as `Up`.

### Manual Cleanup
To safely stop and clear the standalone containers:
```bash
docker stop notes-web notes-db
docker rm notes-web notes-db
```

---

## Access the Application
Once the containers are running via either method, open your browser and access the client interface at:
* **http://localhost:3000**



## Project Features & Architecture Status
* [x] Decoupled HTML/CSS/JavaScript static frontend asset serving
* [x] Strict Twelve-Factor Node.js + Express environment variable ingestion
* [x] Containerized stateful MySQL database distribution
* [x] Resilient Health Checked Docker Compose orchestration
* [x] Dynamic database network routing via custom Docker networks
* [x] Persistent host-mapped volume management


## Future Milestones
* [ ] GitHub Actions workflow for automated CI/CD image delivery to Docker Hub
* [ ] Database migration management tool integration (Knex.js)
* [ ] JWT-based User Authentication layer
* [ ] Cloud Production Deployment (AWS / DigitalOcean)
