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

## ☸️ Kubernetes Deployment
For documentation on how to orchestrate and deploy this application using Kubernetes (KinD), please check out the [Kubernetes Deployment Guide](./k8s/README.md).



---
----
---

Example: Deploy an application
Assuming you already have a working cluster and kubectl is configured:

bash
# 1. Create a Deployment
kubectl create deployment nginx --image=nginx

# 2. Check the Pods
kubectl get pods

# 3. Scale to three replicas
kubectl scale deployment nginx --replicas=3

# 4. Create a Service
kubectl expose deployment nginx --port=80 --type=ClusterIP

# 5. Check the resources
kubectl get deployments,pods,services
In this example, Kubernetes creates the Pods for you through the Deployment. The Service gives those Pods a stable network endpoint, but ClusterIP is accessible only within the cluster by default.

Remember the main concept: You define what you want Kubernetes to run; Kubernetes works to maintain that desired state. You don't have to manually create and manage every application container.





Create a clean, beginner-friendly Kubernetes architecture diagram showing one Kubernetes cluster containing one control-plane node and two worker nodes. Show multiple applications running as Pods across the worker nodes, with each Pod containing application containers. Label every component clearly and use arrows to show the relationships. Use a simple flat-design style, professional colors, a white background, and a 16:9 layout. Make it suitable for a Kubernetes tutorial.

Tip: For learning Kubernetes, search for or request labeled architecture diagrams and step-by-step workflow diagrams. They are usually more useful than decorative illustrations because they explain how components relate to one another.









---
# 1. NEW COMPONENT: THE STORAGE REQUEST (PVC)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi # Requests 1 Gigabyte of persistent storage
---
# 2. UPDATED MYSQL DATABASE DEPLOYMENT
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "secretpassword"
        - name: MYSQL_DATABASE
          value: "notes_db"
        ports:
        - containerPort: 3306
        # --- NEW: Mount the storage folder inside the container ---
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql # This is where MySQL saves all data [1, 2]
      # --- NEW: Define the volume link ---
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc # Links to the PVC defined above [1]

---
# (Keep your mysql-service, notes-deployment, and notes-service exactly the same below this line!)





apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: dev
type: Opaque
stringData:
  # Kubernetes will automatically base64 encode these for security
  mysql-root-password: "admin"





        env:
        - name: DB_HOST
          value: "mysql-service"
        - name: DB_USER
          value: "root"
        - name: DB_NAME
          value: "notesdb"
        - name: DB_PASSWORD
          # --- UPDATED: Fetch password from the secret safely ---
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: mysql-root-password







-----
IMPORTANT
----

3. How to use admin instead of root on a fresh setup

If you want your Kubernetes cluster to use admin as the username (matching your Node.js code and .env file perfectly on a fresh setup), you just need to tell the MySQL container to create that user when it boots up for the first time [Authoritative and Current Sources].
To do this, you must add MYSQL_USER and MYSQL_PASSWORD variables into your mysql-deployment.yaml file [Authoritative and Current Sources].

Update your mysql-deployment.yaml to create the admin user:

yaml
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "supersecretrootpassword" # Keep root separate and secure!
        - name: MYSQL_DATABASE
          value: "notesdb"
        - name: MYSQL_USER               # <-- Add this! Tells MySQL to create a custom user
          value: "admin"
        - name: MYSQL_PASSWORD           # <-- Add this! Sets the password for the custom user
          value: "admin"
Use code with caution.

Update your node-deployment.yaml to connect as admin:

Now that the database actually builds the admin user on startup, your application can safely switch back to using it:
yaml
        env:
        - name: DB_HOST
          value: "mysql-service" 
        - name: DB_USER
          value: "admin"         # <-- Now this will work perfectly on a fresh cluster!
        - name: DB_PASS        
          value: "admin"        
        - name: DB_NAME
          value: "notesdb"
Use code with caution.
By adding those two extra lines to your MySQL file, Kubernetes will successfully spin up a fresh database, create the admin account automatically, and let your Node.js application log in seamlessly without ever needing the root account!
----  