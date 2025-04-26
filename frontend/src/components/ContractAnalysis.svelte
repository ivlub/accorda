<script lang="ts">
  import { fade } from 'svelte/transition';
  import { UploadCloud, Play, Loader2, AlertTriangle, FileText as FileIcon, CheckCircle2, XCircle, HelpCircle } from 'lucide-svelte';

  // Define the structure of the expected response
  interface RequirementCheckResult {
    met: boolean | 'maybe';
    explanation: string;
  }

  interface CompletenessCheck {
    date_of_contract_formation: RequirementCheckResult;
    parties_involved: RequirementCheckResult;
    object_of_contract: RequirementCheckResult;
    obligations_of_parties: RequirementCheckResult;
    date_of_conclusion?: RequirementCheckResult | null; // Optional
  }

  interface PrecisionCheck {
    terms_clearly_defined: RequirementCheckResult;
  }

  interface FirmnessCheck {
    reciprocal_obligations_established: RequirementCheckResult;
  }

  interface FormalAdequacyCheck {
    formal_requirements_met: RequirementCheckResult;
  }

  interface ContractRequirementsResponse {
    Completeness: CompletenessCheck;
    Precision: PrecisionCheck;
    Firmness: FirmnessCheck;
    FormalAdequacy: FormalAdequacyCheck;
  }

  let selectedLawType: 'civil' | 'common' = 'common';
  let uploadedFile: File | null = null;
  let uploadedFileName: string | null = null;
  let isAnalyzing = false;
  let requirementsResult: ContractRequirementsResponse | null = null;
  let errorMessage: string | null = null;
  // Define backend URL (adjust if necessary)
  const API_BASE_URL = 'http://localhost:8000'; 

  function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
          uploadedFile = target.files[0];
          uploadedFileName = uploadedFile.name;
          errorMessage = null;
          requirementsResult = null;
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
    isAnalyzing = true;
    requirementsResult = null;
    console.log(`Starting requirements check for ${uploadedFileName}...`);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze/check-requirements`, {
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

      const result: ContractRequirementsResponse = await response.json();
      console.log("Requirements Analysis Result:", result);

      // Store the structured result
      requirementsResult = result;

    } catch (error) {
        console.error("Analysis API call failed:", error);
        // Check if error is an instance of Error to access message property
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unexpected error occurred connecting to the analysis service.";
        }
    } finally {
        isAnalyzing = false;
    }
  }

  // Helper to format criterion ID (e.g., date_of_contract_formation -> Date Of Contract Formation)
  function formatCriterionKey(key: string): string {
      return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
                <p class="text-xs text-neutral-medium mt-0.5">PDF, DOCX up to 50MB</p>
                <input id="contract-upload" type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" on:change={handleFileSelect} accept=".pdf,.docx"/>
            </label>
            {#if errorMessage && !isAnalyzing}
                <p class="text-sm text-red-600 mt-3 px-1">{errorMessage}</p>
            {/if}
        </div>
      </section>

      <!-- Action Button -->
      <div in:fade={{ duration: 300, delay: 300 }}>
        <button
              on:click={startAnalysis}
              disabled={!uploadedFile || isAnalyzing}
              class="w-full px-4 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
          >
              {#if isAnalyzing}
                  <svelte:component this={Loader2} class="animate-spin h-4 w-4 text-white" />
                  <span>Analyzing...</span>
              {:else}
                  <svelte:component this={Play} class="w-5 h-5" fill="currentColor" />
                  <span>Check Requirements</span>
              {/if}
          </button>
      </div>
    </div>

    <!-- Right Column: Results -->
    <div class="lg:col-span-8">
        <section aria-labelledby="results-heading">
            <h2 id="results-heading" class="text-lg font-semibold text-neutral-darkest mb-4 font-serif">Contract Requirements Analysis</h2>
            <div class="bg-neutral-white p-6 rounded-md border border-neutral-light min-h-[400px] lg:min-h-[calc(100vh-12rem)] flex flex-col">
                 <div class="flex-grow">
                    {#key requirementsResult || isAnalyzing || errorMessage}
                        <div class="w-full h-full" in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
                            {#if isAnalyzing}
                                <div class="text-neutral-dark flex items-center justify-center h-full text-center">
                                    <div>
                                        <svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" />
                                        Processing Document...
                                     </div>
                                </div>
                            {:else if requirementsResult}
                                <!-- Display Structured Requirements -->
                                <div class="space-y-6 text-sm">
                                    {#each Object.entries(requirementsResult) as [category, criteria]} 
                                        <div class="border border-neutral-light rounded-md overflow-hidden">
                                            <h3 class="bg-neutral-lightest text-neutral-darkest px-4 py-2 font-semibold font-serif text-base">{category}</h3>
                                            <ul class="divide-y divide-neutral-light">
                                                {#each Object.entries(criteria) as [key, result]} 
                                                    {#if result && typeof result === 'object' && 'met' in result && 'explanation' in result}
                                                     <li class="flex items-start p-4 space-x-3">
                                                        {#if result.met === true}
                                                            <svelte:component this={CheckCircle2} class="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" strokeWidth={2}/>
                                                        {:else if result.met === false}
                                                            <svelte:component this={XCircle} class="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" strokeWidth={2}/>
                                                        {:else}
                                                             <svelte:component this={HelpCircle} class="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" strokeWidth={2}/>
                                                        {/if}
                                                        <div class="flex-grow">
                                                             <p class="font-medium text-neutral-darkest">{formatCriterionKey(key)}</p>
                                                             <p class="text-neutral-dark mt-1">{result.explanation}</p>
                                                        </div>
                                                    </li>
                                                    {/if}
                                                {/each}
                                            </ul>
                                        </div>
                                    {/each}
                                </div>
                            {:else if errorMessage}
                                <div class="text-red-600 px-4 flex items-center justify-center h-full text-center">
                                    <div>
                                        <svelte:component this={AlertTriangle} class="h-8 w-8 mx-auto mb-1" strokeWidth={1.5} />
                                        <p><strong>Analysis Failed:</strong> {errorMessage}</p>
                                    </div>
                                </div>
                            {:else}
                                <div class="text-neutral-medium px-4 flex items-center justify-center h-full text-center">
                                     <div>
                                        <svelte:component this={FileIcon} class="w-12 h-12 mx-auto mb-2 text-neutral-light" strokeWidth={1.5} />
                                        Upload a document and click "Check Requirements" to see the analysis.
                                    </div>
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