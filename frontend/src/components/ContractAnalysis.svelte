<script lang="ts">
  import { fade } from 'svelte/transition';
  import { 
      UploadCloud, Play, Loader2, AlertTriangle, FileText as FileIcon, 
      CheckCircle2, XCircle, HelpCircle, ArrowRight, ArrowLeft, ChevronDown 
  } from 'lucide-svelte';

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

  let currentStep: 1 | 2 | 3 = 1;
  let selectedLawType: 'civil' | 'common' = 'common';
  let uploadedFile: File | null = null;
  let uploadedFileName: string | null = null;
  let isAnalyzing = false;
  let requirementsResult: ContractRequirementsResponse | null = null;
  let errorMessage: string | null = null;
  // Define backend URL (adjust if necessary)
  const API_BASE_URL = 'http://localhost:8000'; 

  function goToStep(step: 1 | 2 | 3) {
      currentStep = step;
      // Clear errors when moving steps
      errorMessage = null;
      // Clear results only when moving back from results (step 3)
      if (step === 1 || step === 2) {
          requirementsResult = null; 
      }
      // Optionally reset file when going back to step 1?
      // if (step === 1) { 
      //    uploadedFile = null;
      //    uploadedFileName = null; 
      // }
  }

  function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
          uploadedFile = target.files[0];
          uploadedFileName = uploadedFile.name;
          errorMessage = null;
          requirementsResult = null; // Clear previous results
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
    requirementsResult = null; // Clear previous results
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
      requirementsResult = result;
      goToStep(3); // <-- Go to step 3 on success

    } catch (error) {
        console.error("Analysis API call failed:", error);
        // Check if error is an instance of Error to access message property
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unexpected error occurred connecting to the analysis service.";
        }
        // Stay on step 2 if there is an error
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
<div class="max-w-4xl mx-auto p-4 md:p-6 lg:p-8"> <!-- Centered, slightly narrower content -->

    {#if currentStep === 1}
        <!-- Step 1: Select Law Type -->
        <div in:fade={{ duration: 300 }}>
            <h1 class="text-2xl font-bold font-serif text-neutral-darkest mb-6">Step 1: Select Law Type</h1>
            <section aria-labelledby="law-type-heading" class="mb-8">
                <h2 id="law-type-heading" class="text-base font-semibold text-neutral-darkest mb-3">Applicable Law System</h2>
                <div class="bg-neutral-white p-4 rounded-md border border-neutral-light space-y-2 shadow-sm">
                    <label class="flex items-center p-3 rounded cursor-pointer transition duration-150 ease-in-out" class:bg-neutral-lightest={selectedLawType === 'common'} class:hover:bg-neutral-lightest={selectedLawType !== 'common'}>
                        <input type="radio" name="lawType" value="common" bind:group={selectedLawType} class="form-radio h-4 w-4 text-brand-muted focus:ring-brand-muted border-neutral-medium">
                        <span class="ml-3 text-sm text-neutral-darkest">Common Law</span>
                    </label>
                    <label class="flex items-center p-3 rounded cursor-pointer transition duration-150 ease-in-out" class:bg-neutral-lightest={selectedLawType === 'civil'} class:hover:bg-neutral-lightest={selectedLawType !== 'civil'}>
                        <input type="radio" name="lawType" value="civil" bind:group={selectedLawType} class="form-radio h-4 w-4 text-brand-muted focus:ring-brand-muted border-neutral-medium">
                        <span class="ml-3 text-sm text-neutral-darkest">Civil Law</span>
                    </label>
                </div>
            </section>

            <div class="flex justify-end">
                <button
                    on:click={() => goToStep(2)}
                    class="px-5 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
                >
                    <span>Next Step</span>
                    <svelte:component this={ArrowRight} class="w-4 h-4" />
                </button>
            </div>
        </div>

    {:else if currentStep === 2}
        <!-- Step 2: Upload Document -->
         <div in:fade={{ duration: 300 }}>
             <div class="flex justify-between items-center mb-6">
                 <h1 class="text-2xl font-bold font-serif text-neutral-darkest">Step 2: Upload & Analyze</h1>
                 <button 
                    on:click={() => goToStep(1)}
                    class="px-3 py-1.5 text-sm text-neutral-dark hover:text-neutral-darkest hover:bg-neutral-lightest rounded-md transition duration-150 ease-in-out flex items-center space-x-1"
                 >
                    <svelte:component this={ArrowLeft} class="w-4 h-4" />
                    <span>Back to Step 1</span>
                 </button>
            </div>

            <!-- Upload Section -->
            <section aria-labelledby="upload-heading" class="mb-6">
                <h2 id="upload-heading" class="text-base font-semibold text-neutral-darkest mb-3">Upload Contract Document</h2>
                <div class="bg-neutral-white p-4 rounded-md border border-neutral-light shadow-sm">
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
                    <!-- Error message shown here if analysis fails -->
                    {#if errorMessage}
                         <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start space-x-2">
                             <svelte:component this={AlertTriangle} class="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <div>
                                 <span class="font-medium">Analysis Failed:</span> {errorMessage}
                             </div>
                        </div>
                    {/if}
                </div>
            </section>

            <!-- Action Button -->
            <div class="mb-8 flex justify-end">
                <button
                    on:click={startAnalysis}
                    disabled={!uploadedFile || isAnalyzing}
                    class="px-5 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
                >
                    {#if isAnalyzing}
                        <svelte:component this={Loader2} class="animate-spin h-4 w-4 text-white" />
                        <span>Analyzing...</span>
                    {:else}
                        <svelte:component this={Play} class="w-5 h-5" fill="currentColor" />
                        <span>Analyze & View Results</span>
                    {/if}
                </button>
            </div>
         </div>

    {:else if currentStep === 3}
        <!-- Step 3: Display Results -->
        <div in:fade={{ duration: 300 }}>
             <div class="flex justify-between items-center mb-6">
                 <h1 class="text-2xl font-bold font-serif text-neutral-darkest">Analysis Results</h1>
                 <button 
                    on:click={() => goToStep(2)} 
                    class="px-3 py-1.5 text-sm text-neutral-dark hover:text-neutral-darkest hover:bg-neutral-lightest rounded-md transition duration-150 ease-in-out flex items-center space-x-1"
                 >
                    <svelte:component this={ArrowLeft} class="w-4 h-4" />
                    <span>Back to Upload</span>
                 </button>
            </div>

             {#if uploadedFileName}
                <p class="text-sm text-neutral-medium mb-4">File: <span class="font-medium text-neutral-dark">{uploadedFileName}</span></p>
             {/if}

            <!-- Results Section -->
            <section aria-labelledby="results-heading">
                <h2 id="results-heading" class="sr-only">Contract Requirements Analysis</h2>
                
                <!-- Added Heading -->
                <h3 class="text-lg font-semibold text-neutral-dark mb-3 font-serif">General contract requirements</h3>

                <div class="bg-neutral-white p-1 md:p-2 rounded-md border border-neutral-light min-h-[200px] shadow-sm">
                    {#if isAnalyzing} <!-- Should generally not be seen here, but as fallback -->
                        <div class="text-neutral-dark flex items-center justify-center h-full text-center p-10">
                            <div><svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" /> Loading...</div>
                        </div>
                    {:else if requirementsResult}
                        <!-- Collapsible Results -->
                        <div class="space-y-3 p-2 md:p-4">
                            {#each Object.entries(requirementsResult) as [category, criteria]}
                                {@const criteriaResults = Object.values(criteria).filter(r => r && typeof r === 'object' && 'met' in r)}
                                {@const falseCount = criteriaResults.filter(r => r.met === false).length}
                                {@const maybeCount = criteriaResults.filter(r => r.met === 'maybe').length}
                                {@const isAllGood = falseCount === 0 && maybeCount === 0}
                                <details class="border border-neutral-light rounded-md group" open>
                                    <summary class="list-none flex items-center justify-between bg-neutral-lightest px-4 py-3 cursor-pointer hover:bg-neutral-lighter transition duration-150 ease-in-out rounded-t-md">
                                        <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                                            <span class="font-semibold font-serif text-base text-neutral-darkest">{category}</span>
                                             <!-- Status Badges -->
                                             {#if isAllGood}
                                                 <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                      <svelte:component this={CheckCircle2} class="w-3 h-3 mr-1"/> All Good
                                                 </span>
                                             {:else}
                                                {#if falseCount > 0}
                                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <svelte:component this={XCircle} class="w-3 h-3 mr-1"/> {falseCount}
                                                    </span>
                                                {/if}
                                                {#if maybeCount > 0}
                                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <svelte:component this={HelpCircle} class="w-3 h-3 mr-1"/> {maybeCount}
                                                    </span>
                                                {/if}
                                            {/if}
                                        </div>
                                        <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                                    </summary>
                                    <ul class="divide-y divide-neutral-light bg-white rounded-b-md">
                                        {#each Object.entries(criteria) as [key, result]}
                                            {#if result && typeof result === 'object' && 'met' in result && 'explanation' in result}
                                                <li class="flex items-start p-4 space-x-3 text-sm">
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
                                </details>
                            {/each}
                        </div>
                     {:else if errorMessage} <!-- Error specific to step 3 - should not normally happen -->
                         <div class="text-red-600 px-4 flex items-center justify-center h-full text-center p-10">
                             <div>
                                 <svelte:component this={AlertTriangle} class="h-8 w-8 mx-auto mb-1" strokeWidth={1.5} />
                                 <p><strong>Error Displaying Results:</strong> {errorMessage}</p>
                             </div>
                        </div>
                    {:else} <!-- No results yet -->
                        <div class="text-neutral-medium px-4 flex items-center justify-center h-full text-center p-10">
                            <div>
                                <svelte:component this={FileIcon} class="w-12 h-12 mx-auto mb-2 text-neutral-light" strokeWidth={1.5} />
                                Results will appear here after successful analysis.
                            </div>
                        </div>
                    {/if}
                </div>
            </section>
        </div>
    {/if}
</div> 