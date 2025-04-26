<script lang="ts">
  import { onMount } from 'svelte';

  let helloMessage = "Loading..."; // Renamed from message
  
  // State for AI Prompt
  let prompt = "";
  let aiResponse = "";
  let isLoadingAi = false; // Renamed
  let errorAiMessage = ""; // Renamed

  // State for File Upload
  let selectedFile: File | null = null;
  let isUploading = false;
  let errorUploadMessage = "";
  let fileInput: HTMLInputElement; // To reset the input


  // Fetch the initial hello message
  onMount(async () => {
    try {
      const response = await fetch('/api/hello');
      if (response.ok) {
        const data = await response.json();
        helloMessage = data.message;
      } else {
        helloMessage = `Error: ${response.statusText}`;
      }
    } catch (error) {
      helloMessage = `Error fetching hello data: ${error}`;
    }
  });

  // Function to call the /api/generate endpoint
  async function callGenerateApi() {
    if (!prompt.trim()) {
        errorAiMessage = "Please enter a prompt.";
        aiResponse = "";
        return;
    }
    isLoadingAi = true;
    errorAiMessage = "";
    aiResponse = "";

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.response;
      } else {
        const errorData = await response.json();
        errorAiMessage = `Error ${response.status}: ${errorData.detail || response.statusText}`;
      }
    } catch (error) {
      errorAiMessage = `Network or other error: ${error}`;
    } finally {
      isLoadingAi = false;
    }
  }

  // Function to handle file selection
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        selectedFile = target.files[0];
        errorUploadMessage = ""; // Clear previous error on new selection
    } else {
        selectedFile = null;
    }
  }

  // Function to upload file and extract text
  async function uploadAndExtract() {
    if (!selectedFile) {
      errorUploadMessage = "Please select a file first.";
      return;
    }

    isUploading = true;
    errorUploadMessage = "";
    console.clear(); // Clear console before new output
    console.log(`Uploading file: ${selectedFile.name}...`);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/extract_text', {
        method: 'POST',
        body: formData, // Use FormData for file uploads
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`--- Text Extracted from ${data.filename} ---`);
        console.log(data.text);
        console.log("---------------------------------------------");
        // Optionally clear file input after successful upload
        selectedFile = null;
        if(fileInput) fileInput.value = ""; // Reset file input visually
      } else {
        const errorData = await response.json();
        errorUploadMessage = `Upload Error ${response.status}: ${errorData.detail || response.statusText}`;
        console.error(errorUploadMessage);
      }
    } catch (error) {
        const errorMsg = `Network or client-side error during upload: ${error}`;
        errorUploadMessage = errorMsg;
        console.error(errorMsg);
    } finally {
      isUploading = false;
    }
  }

</script>

<main class="flex flex-col items-center p-6 min-h-screen bg-gray-100 space-y-6">
  <h1 class="text-4xl font-bold text-blue-600">Svelte + FastAPI Demo</h1>

  <!-- Display Hello Message -->
  <p class="text-lg text-gray-700 bg-blue-50 p-4 rounded shadow w-full max-w-xl text-center">
    Backend status: <span class="font-semibold">{helloMessage}</span>
  </p>

  <!-- AI Prompt Section -->
  <div class="w-full max-w-xl bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Ask Gemini</h2>
    <textarea
      bind:value={prompt}
      placeholder="Enter your prompt here..."
      class="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="3" 
      disabled={isLoadingAi}
    ></textarea>
    <button
      on:click={callGenerateApi}
      disabled={isLoadingAi || !prompt.trim()}
      class="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
    >
      {#if isLoadingAi}
        Generating...
      {:else}
        Send Prompt
      {/if}
    </button>
    <!-- AI Response/Error -->
    <div class="mt-4">
        {#if errorAiMessage}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm" role="alert">
            {errorAiMessage}
          </div>
        {/if}
        {#if aiResponse}
          <div class="bg-green-50 p-3 rounded border border-green-200 mt-2">
            <h3 class="text-lg font-semibold text-green-800 mb-1">Response:</h3>
            <p class="text-gray-700 whitespace-pre-wrap text-sm">{aiResponse}</p>
          </div>
        {/if}
    </div>
  </div>

  <!-- File Upload Section -->
  <div class="w-full max-w-xl bg-white p-6 rounded shadow">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Extract Text from File</h2>
      <div class="mb-4">
          <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-1">Select PDF or DOCX file:</label>
          <input 
              type="file" 
              id="file-upload"
              bind:this={fileInput} 
              on:change={handleFileSelect}
              accept=".pdf,.docx"
              class="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-full file:border-0 
                     file:text-sm file:font-semibold 
                     file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100 
                     disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading}
          />
      </div>
      <button
          on:click={uploadAndExtract}
          disabled={isUploading || !selectedFile}
          class="w-full px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
          {#if isUploading}
              Uploading & Extracting...
          {:else}
              Upload and Extract Text
          {/if}
      </button>
      <!-- Upload Error -->
      {#if errorUploadMessage}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm mt-4" role="alert">
              {errorUploadMessage}
          </div>
      {/if}
      <p class="text-xs text-gray-500 mt-3">Extracted text will be printed to the browser's developer console (Press F12).</p>
  </div>

</main>

<style>
  /* Tailwind handles styling */
</style> 