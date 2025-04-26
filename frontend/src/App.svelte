<script lang="ts">
  import { onMount } from 'svelte';

  let message = "Loading...";

  onMount(async () => {
    try {
      // The /api prefix is handled by the Vite proxy
      const response = await fetch('/api/hello');
      if (response.ok) {
        const data = await response.json();
        message = data.message;
      } else {
        message = `Error: ${response.statusText}`;
      }
    } catch (error) {
      message = `Error fetching data: ${error}`;
    }
  });
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <h1 class="text-4xl font-bold text-blue-600 mb-4">Svelte + FastAPI Start</h1>
  <p class="text-lg text-gray-700 bg-white p-4 rounded shadow">
    Message from backend: <span class="font-semibold">{message}</span>
  </p>
</main>

<style>
  /* Add any global styles here if needed, or component-specific styles */
  /* Tailwind handles most styling via classes */
</style> 