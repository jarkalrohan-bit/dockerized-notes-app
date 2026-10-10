# Notes App (Node.js + MySQL on Kubernetes)

A full-stack Notes Application featuring a Node.js backend API and a MySQL database, fully containerized and orchestrated locally using **Kind (Kubernetes in Docker)**.

---

## 🛠️ Infrastructure & Troubleshooting Log

Deploying a full-stack containerised application into a local Kubernetes ecosystem presents unique networking and configuration challenges. Below is the production engineering log documenting the core blocks faced during deployment and the structured troubleshooting steps taken to resolve them.

### 1. Interception by Local Services (Port/Context Collision)
*   **Situation:** Initial cluster status queries (`kubectl cluster-info`) returned unauthenticated `hudson.model.Hudson` API server faults. `kubectl` defaulted to checking standard local loopback routes, accidentally attempting to communicate with an active background Jenkins instance instead of the Kubernetes control plane.
*   **Task:** Isolate the active terminal session's CLI context and ensure all commands route exclusively to the local Kubernetes cluster without host process interference.
*   **Action:** Purged stale configuration entries from the local `kubeconfig` and provisioned an isolated, dedicated KinD context named `notes-storage` using a custom configuration blueprint (`cluster.yaml`).
*   **Result:** Successfully decoupled local cluster routing from host background processes, restoring clean API control plane communications.

### 2. Microservice Container Image Resolution (`ImagePullBackOff`)
*   **Situation:** The application deployment pods stalled out in an `ImagePullBackOff` loop state. Kubernetes' default orchestration loop attempted to pull the container manifest from public registries (Docker Hub), but the custom Node.js application binary (`rohanjarkal/node-app:latest`) only existed locally on the host Docker daemon.
*   **Task:** Make the locally built Docker image available to the internal nodes of the isolated Kind cluster without pushing it to a public registry.
*   **Action:** Side-loaded the compiled application binary image directly into the cluster infrastructure using `kind load docker-image rohanjarkal/node-app:latest` and updated the deployment manifest configuration spec to force `imagePullPolicy: IfNotPresent`.
*   **Result:** Resolved the registry lookup failure, enabling the node to pull the container directly from local storage and transition the pod to an active initialization state.

### 3. Application State & Environment Variables Alignment (`CrashLoopBackOff`)
*   **Situation:** Pod execution failed runtime execution health-checks (`CrashLoopBackOff`), logging an internal app database failure: `ER_ACCESS_DENIED_ERROR (using password: NO)`. The Node.js application runtime expected database access parameters keyed under `process.env.DB_PASS`, whereas the Kubernetes manifest injected values using the key `DB_PASSWORD`, evaluating the secret string as `undefined`. Additionally, the database failed to authenticate because the app defaulted to an `admin` username, while the base MySQL image initializes exclusively with `root` access.
*   **Task:** Realign the environment variables between the application codebase logic and the declarative infrastructure layer while fixing the user context alignment.
*   **Action:** Realigned the key maps within the core Kubernetes manifest (`node-deployment.yaml`) to match the codebase logic exactly (`DB_PASS`), shifted the execution user context to `root` to match the database initialization token, and performed a zero-downtime deployment rollout (`kubectl rollout restart`).
*   **Result:** Synchronized runtime configurations seamlessly across the application layer, resolving the authentication handshake error and establishing a stable database connection.


### Project Structure

```text
notes-app/
├── cluster.yaml            # Blueprint to build the local Kind Kubernetes cluster
└── k8s/                    # Declarative manifests for the application layer
    ├── namespace.yml       # Isolated logical environment (notes-app)
    ├── mysql-deployment.yml# MySQL Database Deployment & Persistent Volume Claims
    ├── mysql-svc.yml       # Internal ClusterIP Service for DB connectivity
    ├── node-deployment.yml # Node.js Application Deployment
    └── node-svc.yml        # NodePort Service exposing the app to the host machine
```

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed and running on your local machine:
*   [Docker Desktop](https://docker.com)
*   [Kind](https://k8s.io)
*   [kubectl](https://kubernetes.io)

### Setup Instructions

Follow these steps sequentially from your terminal:

#### 1. Spin up the Kubernetes Cluster
From the **root** of the project directory, use the Kind blueprint to build your isolated environment and establish the network port mappings:
```bash
kind create cluster --name notes-storage --config cluster.yml
```

#### 2. Deploy the Application Stack
Change directories into the configuration folder and apply the declarative manifests to the cluster:
```bash
# Navigate to the manifests folder
cd k8s

# Apply the environment components
kubectl apply -f namespace.yml
kubectl apply -f mysql-deployment.yml
kubectl apply -f mysql-svc.yml
# Wait for the database container to fully initialize before applying the app layer
kubectl wait --namespace notes-app --for=condition=ready pod -l app=mysql --timeout=90s
kubectl apply -f node-deployment.yml
kubectl apply -f node-svc.yml
```

#### 3. Verify System Health
Verify that all pods have cleared initialization routines and display a `1/1 Running` status:

```bash
kubectl get pods -n notes-app
```

#### 4. Access the Application
Once the pods are in the `Running` state, open your preferred web browser and navigate to:
```text
http://localhost:3000
```

---

## 🧹 Teardown & Cleanup
To completely delete the Kubernetes cluster and wipe the temporary container instances from your Docker engine, run:
```bash
kind delete cluster --name notes-storage
```

## 🚀 Future Infrastructure Roadmap

To transition this local development environment into an enterprise-grade production setup, the following cloud-native enhancements are planned:

*   **State Persistent Management (PV/PVC):** Transition database storage from ephemeral node paths to dedicated **Persistent Volumes (PV)** and **Persistent Volume Claims (PVC)** backed by dynamic cloud storage providers (e.g., AWS EBS, GCP Persistent Disk) to guarantee data persistence across pod restarts and rescheduling.
*   **Decoupled Configuration & Secrets:** Extract database credentials and environment variables from core deployment manifests into native Kubernetes **ConfigMaps** and **Secrets** to improve security posture and enforce strict separation of configuration from code.
*   **Production Ingress Controller:** Replace the local Kind port-forwarding bridge with an **NGINX Ingress Controller** coupled with **Cert-Manager** to handle production-grade routing, load balancing, and automated SSL/TLS termination.
*   **GitOps & CI/CD Pipeline:** Implement automated delivery pipelines using **GitHub Actions** and **ArgoCD** to automatically validate, build, and deploy manifest updates directly to live clusters upon main branch merges.
