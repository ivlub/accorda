# Accorda AI Coding Assistant Backend & Frontend

This project contains the backend API and the frontend web application for the Accorda AI coding assistant.

## Tech Stack

*   **Containerization:** Docker, Docker Compose
*   **Backend:** Python, FastAPI
*   **Frontend:** Svelte, Vite, Tailwind CSS
*   **AI:** Google Gemini API

## Running the Project

There are two ways to access the application:

1.  **Hosted Version (Recommended):**
    *   Access the live application at: [https://accorda.kolvian.com](https://accorda.kolvian.com)
    *   Please contact the development team for login credentials.

2.  **Local Development Setup:**

    *   **Prerequisites:**
        *   Docker
        *   Docker Compose (v2)
    *   **Environment Setup:**
        *   Create a `.env` file in the project root directory (where `docker-compose.yml` is located).
        *   Add the following line to the `.env` file, replacing `XXXX` with your actual key:
            ```
            GOOGLE_API_KEY=XXXX
            ```
        *   You can obtain a Google API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **Build and Run:**
        *   Open your terminal in the project's root directory.
        *   Run the command:
            ```bash
            docker compose up --build
            ```
        *   The `--build` flag is crucial for the first run or after dependency changes. Subsequent runs can use `docker compose up`.
    *   **Accessing Local Services:**
        *   **Frontend:** [http://localhost:5173](http://localhost:5173)
        *   **Backend:** [http://localhost:8000](http://localhost:8000)
    *   **API Documentation:**
        *   Swagger UI documentation for the backend API is available at: [http://localhost:8000/docs](http://localhost:8000/docs)

## Development Notes

*   **Backend:** Changes to Python files in the `/backend` directory trigger an automatic reload of the FastAPI server using `uvicorn --reload`.
*   **Frontend:** Changes to Svelte/TS/CSS files in the `/frontend/src` directory trigger Vite's Hot Module Replacement (HMR) for instant updates in the browser.

## Stopping the Local Application

1.  Press `Ctrl+C` in the terminal where `docker compose up` is running.
2.  To remove the containers and associated networks/volumes, run:
    ```bash
    docker compose down
    ```

## Frontend Structure & Components

The frontend application, located in `/frontend`, is a Single Page Application (SPA) built with Svelte and TypeScript, using Vite for development and builds, and Tailwind CSS for styling.

**Key Directories & Files:**

*   **`frontend/src/`**: Core application code.
    *   `main.ts`: Application entry point.
    *   `App.svelte`: Root component orchestrating the UI.
    *   `app.css`: Global styles.
    *   `components/`: Contains reusable UI components:
        *   `Login.svelte`: Handles user authentication.
        *   `Sidebar.svelte`: Navigation panel, likely for selecting analysis types or managing documents.
        *   `TopBar.svelte`: Application header, possibly including user info or global actions.
        *   `Welcome.svelte`: Initial view or dashboard.
        *   `ContractAnalysis.svelte`, `ContractComparison.svelte`, `ContractSummary.svelte`: Components dedicated to specific contract interaction features.
        *   `SettingsView.svelte`: Interface for user/application settings.
        *   `Modal.svelte`: Reusable modal dialog component.
        *   `LoadingSpinner.svelte`: Visual indicator for ongoing operations.
        *   `HelpTutorial.svelte`: Component providing guidance or tutorials.
    *   `stores/`: Svelte stores for state management.
        *   `settingsStore.ts`: Manages application-wide settings.
*   **`frontend/public/`**: Static assets.
*   **`frontend/index.html`**: Main HTML entry point.
*   **Configuration Files**: `vite.config.ts`, `svelte.config.cjs`, `tailwind.config.cjs`, `tsconfig.json`, etc.
*   **`frontend/Dockerfile`**: Defines the build process for the frontend container.