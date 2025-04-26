<script lang="ts">
  import { fade } from 'svelte/transition';
  import { UploadCloud, Scale, Loader2, AlertTriangle, FileUp, FileDiff } from 'lucide-svelte';

  let uploadedFile1: File | null = null;
  let uploadedFile1Name: string | null = null;
  let uploadedFile2: File | null = null;
  let uploadedFile2Name: string | null = null;
  let isComparing = false;
  let comparisonResult: string | null = null;
  let errorMessage: string | null = null;

  function handleFileSelect(event: Event, fileNumber: 1 | 2) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
          const file = target.files[0];
          errorMessage = null; comparisonResult = null;
          if (fileNumber === 1) {
              if (uploadedFile2 && file === uploadedFile2) { errorMessage = "Cannot select the same file instance."; target.value = ''; return; }
              uploadedFile1 = file; uploadedFile1Name = file.name;
          } else {
              if (uploadedFile1 && file === uploadedFile1) { errorMessage = "Cannot select the same file instance."; target.value = ''; return; }
              uploadedFile2 = file; uploadedFile2Name = file.name;
          }
      } else {
          if (fileNumber === 1) { uploadedFile1 = null; uploadedFile1Name = null; }
          else { uploadedFile2 = null; uploadedFile2Name = null; }
      }
  }

  async function startComparison() {
      if (!uploadedFile1 || !uploadedFile2) { errorMessage = "Please select two contract files."; return; }
      errorMessage = null; isComparing = true; comparisonResult = null;
      console.log(`Starting comparison between ${uploadedFile1Name} and ${uploadedFile2Name}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      comparisonResult = `<h4 class="font-serif text-lg font-semibold mb-3 text-neutral-darkest">Comparison Summary</h4><div class="grid grid-cols-2 gap-4 mb-3 text-sm"><p>File 1: <span class="font-medium">${uploadedFile1Name}</span></p><p>File 2: <span class="font-medium">${uploadedFile2Name}</span></p></div><p class="text-sm mb-2">Key Differences:</p><ul class="list-disc pl-5 text-sm space-y-1"><li>Discrepancy found in Section 3.1 (Payment Terms).</li><li>Section 5.2 (Liability Cap) differs significantly.</li><li>Minor wording changes in Confidentiality Clause (Section 9).</li></ul><p class="text-sm mt-3">Similarity Score: <span class="font-semibold text-green-700">85%</span></p>`; // Example Rich Text
      isComparing = false;
  }

  // Reusable File Input Component (Conceptual)
  // In a real Svelte app, create a separate FileInputArea.svelte component
  // function FileInputArea({ fileNumber, fileName, onFileSelect }) { ... }

</script>

<div class="max-w-7xl mx-auto">
  <div class="space-y-8">
    <!-- Upload Section -->
    <section aria-labelledby="upload-heading-comparison" in:fade={{ duration: 300, delay: 100 }}>
      <h2 id="upload-heading-comparison" class="text-lg font-serif font-semibold text-brand-dark mb-4">Upload Contracts</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <!-- Contract 1 Upload Area -->
        <div class="bg-neutral-white p-4 rounded-md border border-neutral-light">
          <h3 class="text-sm font-semibold text-neutral-darkest mb-3">Contract 1</h3>
          <label for="contract1-upload" class="relative flex flex-col items-center justify-center w-full p-5 bg-neutral-white border-2 border-neutral-light border-dashed rounded-md cursor-pointer hover:border-brand-muted transition duration-150 ease-in-out group text-center min-h-[120px]">
              <svelte:component this={UploadCloud} class="w-8 h-8 text-neutral-medium group-hover:text-brand-muted mb-1" strokeWidth={1.5}/>
              <p class="text-sm text-neutral-dark group-hover:text-brand-dark">
                  {#if uploadedFile1Name}<span class="font-medium break-all">{uploadedFile1Name}</span>{:else}<span class="font-medium text-brand-muted">Browse files</span> or drag here{/if}
              </p>
              <p class="text-xs text-neutral-medium mt-0.5">PDF, DOCX, TXT</p>
              <input id="contract1-upload" type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" on:change={(e) => handleFileSelect(e, 1)} accept=".pdf,.docx,.txt"/>
          </label>
           {#if uploadedFile1Name}<p class="text-xs text-green-600 mt-2 px-1 truncate">Selected: {uploadedFile1Name}</p>{/if}
        </div>

        <!-- Contract 2 Upload Area -->
         <div class="bg-neutral-white p-4 rounded-md border border-neutral-light">
          <h3 class="text-sm font-semibold text-neutral-darkest mb-3">Contract 2</h3>
          <label for="contract2-upload" class="relative flex flex-col items-center justify-center w-full p-5 bg-neutral-white border-2 border-neutral-light border-dashed rounded-md cursor-pointer hover:border-brand-muted transition duration-150 ease-in-out group text-center min-h-[120px]">
              <svelte:component this={UploadCloud} class="w-8 h-8 text-neutral-medium group-hover:text-brand-muted mb-1" strokeWidth={1.5}/>
              <p class="text-sm text-neutral-dark group-hover:text-brand-dark">
                  {#if uploadedFile2Name}<span class="font-medium break-all">{uploadedFile2Name}</span>{:else}<span class="font-medium text-brand-muted">Browse files</span> or drag here{/if}
              </p>
              <p class="text-xs text-neutral-medium mt-0.5">PDF, DOCX, TXT</p>
              <input id="contract2-upload" type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" on:change={(e) => handleFileSelect(e, 2)} accept=".pdf,.docx,.txt"/>
          </label>
           {#if uploadedFile2Name}<p class="text-xs text-green-600 mt-2 px-1 truncate">Selected: {uploadedFile2Name}</p>{/if}
        </div>
      </div>
      {#if errorMessage && !isComparing}
          <p class="text-sm text-red-600 mt-4 text-center">{errorMessage}</p>
      {/if}
    </section>

    <!-- Action Button Section -->
    <div class="text-center pt-2" in:fade={{ duration: 300, delay: 200 }}>
      <button
        on:click={startComparison}
        disabled={!uploadedFile1 || !uploadedFile2 || isComparing}
        class="px-8 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out inline-flex items-center justify-center space-x-2 shadow-sm"
      >
        {#if isComparing}
          <svelte:component this={Loader2} class="animate-spin h-4 w-4 text-white" />
          <span>Comparing...</span>
        {:else}
          <svelte:component this={Scale} class="w-5 h-5" />
          <span>Compare Contracts</span>
        {/if}
      </button>
    </div>

    <!-- Results Section -->
    <section aria-labelledby="results-heading-comparison">
      <h2 id="results-heading-comparison" class="sr-only">Comparison Results</h2>
      <div class="bg-neutral-white mt-8 p-6 rounded-md border border-neutral-light min-h-[300px] flex flex-col">
        <div class="flex-grow flex items-center justify-center">
           {#key comparisonResult || isComparing || errorMessage}
              <div class="w-full h-full flex items-center justify-center text-center" in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
                  {#if isComparing}
                      <div class="text-neutral-dark">
                          <svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" />
                          Comparing Documents...
                      </div>
                  {:else if comparisonResult}
                      <div class="prose prose-sm max-w-none text-neutral-darkest text-left w-full h-full overflow-auto p-1 prose-headings:font-serif prose-headings:font-semibold prose-headings:text-brand-dark">
                          {@html comparisonResult}
                      </div>
                  {:else if errorMessage && (!uploadedFile1 || !uploadedFile2)}
                      <div class="text-red-600 px-4">
                          <svelte:component this={AlertTriangle} class="h-8 w-8 mx-auto mb-1" strokeWidth={1.5} />
                          {errorMessage}
                      </div>
                  {:else}
                      <div class="text-neutral-medium px-4">
                           <svelte:component this={FileDiff} class="w-12 h-12 mx-auto mb-2 text-neutral-light" strokeWidth={1.5} />
                          Comparison results will be displayed here.
                      </div>
                  {/if}
              </div>
          {/key}
        </div>
      </div>
    </section>

  </div>
</div> 