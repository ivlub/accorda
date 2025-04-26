# FastAPI + Svelte + Docker Sample Project

This project sets up a simple web application using FastAPI for the backend and Svelte with Tailwind CSS for the frontend, all containerized with Docker.

## Features

*   **FastAPI Backend:** A simple Python backend serving a `/api/hello` endpoint.
*   **Svelte Frontend:** A basic Svelte app (using TypeScript) that fetches data from the backend.
*   **Tailwind CSS:** Utility-first CSS framework for styling.
*   **Docker:** Containerization for both frontend and backend services.
*   **Docker Compose:** Orchestrates the services for easy setup.
*   **Live Reload:** Changes in both backend (Python) and frontend (Svelte/TS/CSS) code trigger automatic reloading in the running containers.

## Prerequisites

*   Docker
*   Docker Compose (usually included with Docker Desktop)

## Getting Started

1.  **Clone the repository (or ensure you have all the generated files).**

2.  **Run Docker Compose:**

    Open your terminal in the project's root directory (where `docker-compose.yml` is located) and run:

    ```bash
    docker compose up --build
    ```

    The `--build` flag ensures the images are built (or rebuilt if necessary). The first time you run this, it might take a few minutes to download the base images and install dependencies.

3.  **Access the application:**

    *   The **Frontend** (Svelte App) will be available at: [http://localhost:5173](http://localhost:5173)
    *   The **Backend** (FastAPI) API endpoint `/api/hello` can be accessed directly or through the frontend proxy. The raw API docs (if needed) might be accessible at [http://localhost:8000/docs](http://localhost:8000/docs), although CORS might block direct browser access depending on your setup.

## Development

*   **Backend:** Edit files in the `/backend` directory. `watchfiles` (run via the `CMD` in `backend/Dockerfile`) monitors for changes and restarts the `uvicorn` server automatically.
*   **Frontend:** Edit files in the `/frontend/src` directory. Vite's HMR (Hot Module Replacement) will update the frontend in your browser automatically without a full page reload.

## Stopping the Application

Press `Ctrl+C` in the terminal where `docker compose up` is running. To remove the containers, you can run:

```bash
docker compose down
``` 