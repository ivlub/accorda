<script lang="ts">
  import { fade } from 'svelte/transition';

  let selectedLawType: 'civil' | 'common' = 'common';
  let uploadedFile: File | null = null;
  let uploadedFileName: string | null = null;
  let isUploading = false;
  let analysisResult: string | null = null;
  let errorMessage: string | null = null;

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
    console.log(`Starting analysis for ${uploadedFileName} with ${selectedLawType} law type...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    analysisResult = `<h4 class="font-serif text-lg font-semibold mb-3 text-neutral-darkest">Analysis Summary: ${uploadedFileName}</h4><p class="text-sm mb-2">Law Type: <span class="font-medium">${selectedLawType === 'common' ? 'Common Law' : 'Civil Law'}</span></p><p class="text-sm mb-2">Key Findings:</p><ul class="list-disc pl-5 text-sm space-y-1"><li>Identified potential risk in termination clause (Section 8.2).</li><li>Payment terms (Section 4) appear standard.</li><li>Liability limitations (Section 11) require review based on jurisdiction.</li></ul><p class="text-sm mt-3">Overall Risk Assessment: <span class="font-semibold text-orange-700">Medium</span></p>`; // Example Rich Text
    isUploading = false;
  }

</script>

<!-- Main component structure -->
<div class="max-w-7xl mx-auto">
  <h1 class="text-3xl font-serif font-semibold text-brand-dark mb-6 border-b border-neutral-light pb-3">Contract Analysis</h1>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <!-- Left Column: Controls -->
    <div class="lg:col-span-4 space-y-6">
      <!-- Law Type Section -->
      <section aria-labelledby="law-type-heading">
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
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" class="text-sm font-semibold text-neutral-darkest mb-3">Upload Contract</h2>
        <div class="bg-neutral-white p-4 rounded-md border border-neutral-light">
           <label 
                for="contract-upload"
                class="relative flex flex-col items-center justify-center w-full p-5 bg-neutral-white border-2 border-neutral-light border-dashed rounded-md cursor-pointer hover:border-brand-muted transition duration-150 ease-in-out group text-center min-h-[120px]"
            >
                <!-- Icon: upload -->
                <svg class="w-8 h-8 text-neutral-medium group-hover:text-brand-muted mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
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
      <button
            on:click={startAnalysis}
            disabled={!uploadedFile || isUploading}
            class="w-full px-4 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
        >
            {#if isUploading}
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Analyzing...</span>
            {:else}
                 <!-- Icon: play / process -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0V2.75z" />
                  <path d="M9.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0V2.75z" />
                  <path d="M15.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0V2.75z" />
                </svg>
                <span>Start Analysis</span>
            {/if}
        </button>
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
                                    <svg class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing Document...
                                </div>
                            {:else if analysisResult}
                                <!-- Results Area - using prose for potential markdown/rich text -->
                                <div class="prose prose-sm max-w-none text-neutral-darkest text-left w-full h-full overflow-auto p-1 prose-headings:font-serif prose-headings:font-semibold prose-headings:text-brand-dark">
                                    {@html analysisResult}
                                </div>
                            {:else if errorMessage && !uploadedFile}
                                <div class="text-red-600 px-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                    {errorMessage}
                                </div>
                            {:else}
                                <div class="text-neutral-medium px-4">
                                     <!-- Icon: document text -->
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 text-neutral-light">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
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