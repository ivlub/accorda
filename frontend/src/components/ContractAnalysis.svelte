<script lang="ts">
  import { fade } from 'svelte/transition';
  import { UploadCloud, Play, Loader2, AlertTriangle, FileText as FileIcon } from 'lucide-svelte';

  let selectedLawType: 'civil' | 'common' = 'common';
  let uploadedFile: File | null = null;
  let uploadedFileName: string | null = null;
  let isUploading = false;
  let analysisResult: string | null = null;
  let errorMessage: string | null = null;
  // Define backend URL (adjust if necessary)
  const API_BASE_URL = 'http://localhost:8000'; 

  function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
          uploadedFile = target.files[0];
          uploadedFileName = uploadedFile.name;
          errorMessage = null;
          analysisResult = null;
      } else {
          uploadedFile = null;
          uploadedFileName = null;
      }
  }

  async function startAnalysis() {
    if (!uploadedFile) {
        errorMessage = "Please select a contract file."; return;
    }
    errorMessage = null;
    isUploading = true;
    analysisResult = null;
    console.log(`Starting category analysis for ${uploadedFileName}...`);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze/categorize`, {
          method: 'POST',
          body: formData,
      });

      if (!response.ok) {
          let errorDetail = "An unknown error occurred during analysis.";
          try {
              // Try to parse the error message from the backend
              const errorJson = await response.json();
              errorDetail = errorJson.detail || `Server responded with status ${response.status}`;
          } catch (parseError) {
              errorDetail = `Server responded with status ${response.status}. Could not parse error details.`;
          }
          throw new Error(errorDetail);
      }

      const result = await response.json();
      console.log("Analysis Result:", result);

      // Display the category in the results area
      analysisResult = `<h4 class="font-serif text-lg font-semibold mb-3 text-neutral-darkest">Contract Category Detected:</h4><p class="text-base text-brand-dark font-medium">${result.category}</p><p class="text-xs text-neutral-medium mt-2">File: ${result.filename}</p>`;

    } catch (error) {
        console.error("Analysis API call failed:", error);
        // Check if error is an instance of Error to access message property
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unexpected error occurred connecting to the analysis service.";
        }
    } finally {
        isUploading = false;
    }
  }

</script>

<!-- Main component structure -->
<div class="max-w-7xl mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <!-- Left Column: Controls -->
    <div class="lg:col-span-4 space-y-6">
      <!-- Law Type Section -->
      <section aria-labelledby="law-type-heading" in:fade={{ duration: 300, delay: 100 }}>
        <h2 id="law-type-heading" class="text-sm font-semibold text-neutral-darkest mb-3">Law Type</h2>
        <div class="bg-neutral-white p-4 rounded-md border border-neutral-light space-y-2">
           <label class="flex items-center p-2 rounded cursor-pointer transition duration-150 ease-in-out" class:bg-neutral-lightest={selectedLawType === 'common'} class:hover:bg-neutral-lightest={selectedLawType !== 'common'}>
                <input type="radio" name="lawType" value="common" bind:group={selectedLawType} class="form-radio h-4 w-4 text-brand-muted focus:ring-brand-muted border-neutral-medium">
                <span class="ml-2 text-sm text-neutral-darkest">Common Law</span>
            </label>
            <label class="flex items-center p-2 rounded cursor-pointer transition duration-150 ease-in-out" class:bg-neutral-lightest={selectedLawType === 'civil'} class:hover:bg-neutral-lightest={selectedLawType !== 'civil'}>
                <input type="radio" name="lawType" value="civil" bind:group={selectedLawType} class="form-radio h-4 w-4 text-brand-muted focus:ring-brand-muted border-neutral-medium">
                <span class="ml-2 text-sm text-neutral-darkest">Civil Law</span>
            </label>
        </div>
      </section>

      <!-- Upload Section -->
      <section aria-labelledby="upload-heading" in:fade={{ duration: 300, delay: 200 }}>
        <h2 id="upload-heading" class="text-sm font-semibold text-neutral-darkest mb-3">Upload Contract</h2>
        <div class="bg-neutral-white p-4 rounded-md border border-neutral-light">
           <label 
                for="contract-upload"
                class="relative flex flex-col items-center justify-center w-full p-5 bg-neutral-white border-2 border-neutral-light border-dashed rounded-md cursor-pointer hover:border-brand-muted transition duration-150 ease-in-out group text-center min-h-[120px]"
            >
                <svelte:component this={UploadCloud} class="w-8 h-8 text-neutral-medium group-hover:text-brand-muted mb-1" strokeWidth={1.5}/>
                <p class="text-sm text-neutral-dark group-hover:text-brand-dark">
                    {#if uploadedFileName}
                        <span class="font-medium break-all">{uploadedFileName}</span>
                    {:else}
                         <span class="font-medium text-brand-muted">Browse files</span> or drag here
                    {/if}
                </p>
                <p class="text-xs text-neutral-medium mt-0.5">PDF, DOCX, TXT up to 50MB</p>
                <input id="contract-upload" type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" on:change={handleFileSelect} accept=".pdf,.docx,.txt"/>
            </label>
            {#if errorMessage && !isUploading}
                <p class="text-sm text-red-600 mt-3 px-1">{errorMessage}</p>
            {/if}
        </div>
      </section>

      <!-- Action Button -->
      <div in:fade={{ duration: 300, delay: 300 }}>
        <button
              on:click={startAnalysis}
              disabled={!uploadedFile || isUploading}
              class="w-full px-4 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
          >
              {#if isUploading}
                  <svelte:component this={Loader2} class="animate-spin h-4 w-4 text-white" />
                  <span>Analyzing...</span>
              {:else}
                  <svelte:component this={Play} class="w-5 h-5" fill="currentColor" />
                  <span>Start Analysis</span>
              {/if}
          </button>
      </div>
    </div>

    <!-- Right Column: Results -->
    <div class="lg:col-span-8">
        <section aria-labelledby="results-heading">
            <h2 id="results-heading" class="sr-only">Analysis Results</h2> <!-- Screen reader only heading -->
            <div class="bg-neutral-white p-6 rounded-md border border-neutral-light min-h-[400px] lg:min-h-[calc(100vh-12rem)] flex flex-col">
                 <div class="flex-grow flex items-center justify-center">
                    {#key analysisResult || isUploading || errorMessage}
                        <div class="w-full h-full flex items-center justify-center text-center" in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
                            {#if isUploading}
                                <div class="text-neutral-dark">
                                    <svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" />
                                    Processing Document...
                                </div>
                            {:else if analysisResult}
                                <!-- Results Area - using prose for potential markdown/rich text -->
                                <div class="prose prose-sm max-w-none text-neutral-darkest text-left w-full h-full overflow-auto p-1 prose-headings:font-serif prose-headings:font-semibold prose-headings:text-brand-dark">
                                    {@html analysisResult}
                                </div>
                            {:else if errorMessage && !uploadedFile}
                                <div class="text-red-600 px-4">
                                    <svelte:component this={AlertTriangle} class="h-8 w-8 mx-auto mb-1" strokeWidth={1.5} />
                                    {errorMessage}
                                </div>
                            {:else}
                                <div class="text-neutral-medium px-4">
                                     <!-- Icon: document text -->
                                    <svelte:component this={FileIcon} class="w-12 h-12 mx-auto mb-2 text-neutral-light" strokeWidth={1.5} />
                                    Analysis results will be displayed here.
                                </div>
                            {/if}
                        </div>
                    {/key}
                </div>
            </div>
        </section>
    </div>
  </div>
</div> 