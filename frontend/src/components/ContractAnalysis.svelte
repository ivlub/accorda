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

  // Category-Specific Requirements (New)
  interface CategoryRequirementsResult {
      met: boolean | 'maybe';
      explanation: string;
  }
  // Use Record<string, T> for dictionaries with string keys
  interface CategoryRequirementsResponse {
      category: string;
      analysis: Record<string, CategoryRequirementsResult> | null; 
      message?: string | null;
  }

  // --- Component State ---
  type AnalysisPhase = 'idle' | 'general' | 'category' | 'done' | 'error';

  let currentStep: 1 | 2 | 3 = 1;
  let selectedLawType: 'civil' | 'common' = 'common';
  let uploadedFile: File | null = null;
  let uploadedFileName: string | null = null;
  
  let analysisPhase: AnalysisPhase = 'idle';
  let generalRequirementsResult: ContractRequirementsResponse | null = null; // Renamed
  let contractCategory: string | null = null;
  let categoryAnalysisResult: Record<string, CategoryRequirementsResult> | null = null;
  let categoryAnalysisMessage: string | null = null; // For messages like "not supported"
  let analysisError: string | null = null; // Consolidated error message

  // Define backend URL (adjust if necessary)
  const API_BASE_URL = 'http://localhost:8000'; 

  function goToStep(step: 1 | 2 | 3) {
      currentStep = step;
      analysisError = null; // Clear errors when moving steps
      if (step === 1 || step === 2) {
          generalRequirementsResult = null; 
          contractCategory = null;
          categoryAnalysisResult = null;
          categoryAnalysisMessage = null;
          analysisPhase = 'idle';
      }
      // if (step === 1) { uploadedFile = null; uploadedFileName = null; }
  }

  function handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
          uploadedFile = target.files[0];
          uploadedFileName = uploadedFile.name;
          analysisError = null;
          generalRequirementsResult = null; // Clear previous results fully
          contractCategory = null;
          categoryAnalysisResult = null;
          categoryAnalysisMessage = null;
          analysisPhase = 'idle';
      } else {
          uploadedFile = null;
          uploadedFileName = null;
      }
  }

  async function startAnalysis() {
    if (!uploadedFile) {
        analysisError = "Please select a contract file."; 
        goToStep(2); // Ensure user is on step 2 to see error
        return;
    }
    
    // Reset state for new analysis
    analysisError = null;
    generalRequirementsResult = null;
    contractCategory = null;
    categoryAnalysisResult = null;
    categoryAnalysisMessage = null;
    analysisPhase = 'general';
    goToStep(3); // Go to results page immediately to show progress

    console.log(`Starting analysis for ${uploadedFileName}...`);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    // --- Call 1: General Requirements ---
    try {
        console.log("[Analysis] Calling /check-requirements...");
        const responseGeneral = await fetch(`${API_BASE_URL}/api/analyze/check-requirements`, {
            method: 'POST',
            body: formData, // Send the form data
        });

        if (!responseGeneral.ok) {
            let errorDetail = "Failed during general requirements check.";
            try { errorDetail = (await responseGeneral.json()).detail || errorDetail; } catch (e) {/* ignore */} 
            throw new Error(errorDetail);
        }

        generalRequirementsResult = await responseGeneral.json();
        console.log("[Analysis] General Requirements Result:", generalRequirementsResult);
        analysisPhase = 'category'; // Move to next phase

    } catch (error) {
        console.error("[Analysis] General requirements call failed:", error);
        analysisError = error instanceof Error ? error.message : "An unknown error occurred during general analysis.";
        analysisPhase = 'error';
        return; // Stop analysis here if general check fails
    }

    // --- Call 2: Category-Specific Requirements ---
    // Re-create FormData as it might be consumed by the first fetch in some environments
    const formDataCat = new FormData(); 
    formDataCat.append('file', uploadedFile);
    try {
        console.log("[Analysis] Calling /check-category-requirements...");
        const responseCategory = await fetch(`${API_BASE_URL}/api/analyze/check-category-requirements`, {
            method: 'POST',
            body: formDataCat, // Send form data again
        });

        if (!responseCategory.ok) {
            let errorDetail = "Failed during category-specific requirements check.";
            try { errorDetail = (await responseCategory.json()).detail || errorDetail; } catch (e) {/* ignore */} 
            throw new Error(errorDetail);
        }

        const resultCategory: CategoryRequirementsResponse = await responseCategory.json();
        console.log("[Analysis] Category Requirements Result:", resultCategory);
        contractCategory = resultCategory.category;
        categoryAnalysisResult = resultCategory.analysis; // Might be null
        categoryAnalysisMessage = resultCategory.message ?? null; // Handle potential undefined message
        analysisPhase = 'done'; // All finished successfully

    } catch (error) {
        console.error("[Analysis] Category requirements call failed:", error);
        // Set error, but keep general results visible
        analysisError = error instanceof Error ? error.message : "An unknown error occurred during category-specific analysis.";
        analysisPhase = 'error'; 
    }
  }

  // Helper to format criterion ID (e.g., date_of_contract_formation -> Date Of Contract Formation)
  function formatCriterionKey(key: string): string {
      return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Helper to format category name (e.g., FormalAdequacy -> Formal Adequacy)
  function formatCategoryName(name: string): string {
      return name.replace(/([A-Z])/g, ' $1').trim(); // Add space before capital letters
  }

  // New helper function to calculate status counts safely
  function calculateStatusCounts(criteria: object): { falseCount: number; maybeCount: number } {
      let falseCount = 0;
      let maybeCount = 0;

      if (!criteria) return { falseCount: 0, maybeCount: 0 };

      for (const result of Object.values(criteria)) {
          // Type guard to ensure we're dealing with a potential result object
          if (result && typeof result === 'object' && 'met' in result) {
              const checkResult = result as RequirementCheckResult; // Safe assertion after checks
              if (checkResult.met === false) {
                  falseCount++;
              } else if (checkResult.met === 'maybe') {
                  maybeCount++;
              }
          }
      }
      return { falseCount, maybeCount };
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
                    <!-- Error message shown here if analysis fails on step 2 -->
                    {#if analysisPhase === 'error' && analysisError}
                         <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start space-x-2">
                             <svelte:component this={AlertTriangle} class="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <div>
                                 <span class="font-medium">Analysis Failed:</span> {analysisError}
                             </div>
                        </div>
                    {/if}
                </div>
            </section>

            <!-- Action Button -->
            <div class="mb-8 flex justify-end">
                <button
                    on:click={startAnalysis} 
                    disabled={!uploadedFile || analysisPhase === 'general' || analysisPhase === 'category'} 
                    class="px-5 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
                >
                    {#if analysisPhase === 'general' || analysisPhase === 'category'}
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
                    disabled={analysisPhase === 'general' || analysisPhase === 'category'} 
                 >
                    <svelte:component this={ArrowLeft} class="w-4 h-4" />
                    <span>Back to Upload</span>
                 </button>
            </div>

             {#if uploadedFileName}
                <p class="text-sm text-neutral-medium mb-4">File: <span class="font-medium text-neutral-dark">{uploadedFileName}</span></p>
             {/if}

            <!-- General Requirements Section -->
            {#if generalRequirementsResult}
                <details class="mb-6 group" open> 
                    <summary class="list-none cursor-pointer flex items-center justify-between pb-3 border-b border-neutral-light mb-4">
                         <h3 id="general-results-heading" class="text-lg font-semibold text-neutral-dark font-serif">General Contract Requirements</h3>
                         <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                    </summary>
                     <section aria-labelledby="general-results-heading" >
                        <div class="bg-neutral-white p-1 md:p-2 rounded-md border border-neutral-light shadow-sm">
                            <div class="space-y-3 p-2 md:p-4">
                                {#each Object.entries(generalRequirementsResult) as [category, criteria]}
                                     <!-- Inner collapsible categories remain -->
                                     {@const counts = calculateStatusCounts(criteria)}
                                     {@const isAllGood = counts.falseCount === 0 && counts.maybeCount === 0}
                                     <details class="border border-neutral-light rounded-md group" open>
                                         <summary class="list-none flex items-center justify-between bg-neutral-lightest px-4 py-3 cursor-pointer hover:bg-neutral-lighter transition duration-150 ease-in-out rounded-t-md">
                                              <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                                                  <span class="font-semibold font-serif text-base text-neutral-darkest">{formatCategoryName(category)}</span>
                                                  {#if isAllGood} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><svelte:component this={CheckCircle2} class="w-3 h-3 mr-1"/> All Good</span> {:else} {#if counts.falseCount > 0} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><svelte:component this={XCircle} class="w-3 h-3 mr-1"/> {counts.falseCount}</span> {/if} {#if counts.maybeCount > 0} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svelte:component this={HelpCircle} class="w-3 h-3 mr-1"/> {counts.maybeCount}</span> {/if} {/if}
                                             </div>
                                             <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                                         </summary>
                                         <ul class="divide-y divide-neutral-light bg-white rounded-b-md">
                                             {#each Object.entries(criteria) as [key, result]}
                                                 {#if result && typeof result === 'object' && 'met' in result && 'explanation' in result}
                                                     <li class="flex items-start p-4 space-x-3 text-sm">
                                                         {#if result.met === true} <svelte:component this={CheckCircle2} class="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" strokeWidth={2}/> {:else if result.met === false} <svelte:component this={XCircle} class="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" strokeWidth={2}/> {:else} <svelte:component this={HelpCircle} class="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" strokeWidth={2}/> {/if}
                                                         <div class="flex-grow">
                                                             {#if category !== 'FormalAdequacy'} <p class="font-medium text-neutral-darkest">{formatCriterionKey(key)}</p> {/if}
                                                             <p class="text-neutral-dark {category === 'FormalAdequacy' ? '' : 'mt-1'}">{result.explanation}</p>
                                                         </div>
                                                     </li>
                                                 {/if}
                                             {/each}
                                         </ul>
                                     </details>
                                 {/each}
                             </div>
                         </div>
                    </section>
                </details>
             {:else if analysisPhase === 'general'} 
                <!-- Show initial loading for general results -->
                 <div class="text-neutral-dark flex items-center justify-center h-full text-center p-10 border border-dashed border-neutral-light rounded-md min-h-[100px]">
                    <div><svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" /> Analyzing general requirements...</div>
                </div>
            {/if}

            <!-- Category Specific Requirements Section -->
            <details class="mt-8 group" open> <!-- Collapsible wrapper for category section -->
                 <summary class="list-none cursor-pointer flex items-center justify-between pb-3 border-b border-neutral-light mb-4">
                     <h3 id="category-results-heading" class="text-lg font-semibold text-neutral-dark font-serif">
                        {#if contractCategory}Specific Requirements for: {contractCategory}{:else}Category Specific Requirements{/if}
                     </h3>
                     <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                 </summary>
                 <section aria-labelledby="category-results-heading" >
                    {#if analysisPhase === 'category'} 
                         <!-- Loading state for category analysis -->
                         <div class="text-neutral-dark flex items-center justify-center text-center p-6 border border-dashed border-neutral-light rounded-md min-h-[100px]">
                             <div><svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" /> Analyzing category-specific requirements...</div>
                         </div>
                    {:else if analysisPhase === 'done' && contractCategory}
                        <!-- Display category results once done -->
                        <div class="bg-neutral-white p-1 md:p-2 rounded-md border border-neutral-light shadow-sm">
                            {#if categoryAnalysisResult}
                                <div class="space-y-3 p-2 md:p-4">
                                    {#each Object.entries(categoryAnalysisResult) as [key, result]} 
                                        <!-- Inner collapsible criteria remain -->
                                         <details class="border border-neutral-light rounded-md group" open>
                                             <summary class="list-none flex items-center justify-between bg-neutral-lightest px-4 py-3 cursor-pointer hover:bg-neutral-lighter transition duration-150 ease-in-out rounded-t-md">
                                                 <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                                                      <span class="font-semibold font-serif text-base text-neutral-darkest">{formatCriterionKey(key)}</span>
                                                      {#if result.met === true} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><svelte:component this={CheckCircle2} class="w-3 h-3 mr-1"/> Met</span> {:else if result.met === false} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><svelte:component this={XCircle} class="w-3 h-3 mr-1"/> Not Met</span> {:else} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svelte:component this={HelpCircle} class="w-3 h-3 mr-1"/> Maybe</span> {/if}
                                                 </div>
                                                 <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                                             </summary>
                                             <div class="bg-white rounded-b-md p-4 text-sm">
                                                 <p class="text-neutral-dark">{result.explanation}</p>
                                             </div>
                                         </details>
                                    {/each}
                                </div>
                            {:else if categoryAnalysisMessage} 
                                 <!-- Message if analysis not available for category -->
                                 <div class="text-neutral-medium px-4 py-6 text-center">
                                     <p>{categoryAnalysisMessage}</p>
                                 </div>
                            {/if}
                        </div>
                    {:else if analysisPhase === 'error' && analysisError && generalRequirementsResult} 
                         <!-- Show error from second call if first call succeeded -->
                         <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start space-x-2">
                             <svelte:component this={AlertTriangle} class="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <div>
                                 <span class="font-medium">Category Analysis Failed:</span> {analysisError}
                             </div>
                        </div>
                     {:else}
                         <!-- Initial placeholder or if general results failed -->
                         <div class="text-neutral-medium px-4 py-6 text-center border border-dashed border-neutral-light rounded-md min-h-[100px]">
                             <p>Category-specific analysis will appear here.</p>
                         </div>
                    {/if}
                </section>
            </details> 
        </div>
    {/if}
</div> 