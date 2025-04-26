<script lang="ts">
  import { fade } from 'svelte/transition';
  import { 
      UploadCloud, Play, Loader2, AlertTriangle, FileText as FileIcon, 
      CheckCircle2, XCircle, HelpCircle, ArrowRight, ArrowLeft, ChevronDown,
      Download
  } from 'lucide-svelte';
  import jsPDF from 'jspdf';

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

  // Category-Specific Requirements (Updated)
  interface CategoryExtractionResult { // Renamed for clarity
    status: 'extracted' | 'missing' | 'review_needed';
    value: string | null;
    location: string | null;
  }
  interface CategoryRequirementsResponse {
      category: string;
      analysis: Record<string, CategoryExtractionResult> | null; // Use new interface
      message?: string | null;
  }

  // --- Component State ---
  type AnalysisPhase = 'idle' | 'summary' | 'general' | 'category' | 'done' | 'error';

  let currentStep: 1 | 2 | 3 = 1;
  let selectedLawType: 'civil' | 'common' = 'common';
  let uploadedFile: File | null = null;
  let uploadedFileName: string | null = null;
  
  let analysisPhase: AnalysisPhase = 'idle';
  let contractSummary: string | null = null;
  let generalRequirementsResult: ContractRequirementsResponse | null = null; // Renamed
  let contractCategory: string | null = null;
  let categoryAnalysisResult: Record<string, CategoryExtractionResult> | null = null; // Use new interface
  let categoryAnalysisMessage: string | null = null; // For messages like "not supported"
  let analysisError: string | null = null; // Consolidated error message for general/category
  let summaryError: string | null = null; // <<< New state for summary-specific errors

  // Define backend URL (adjust if necessary)
  const API_BASE_URL = 'http://localhost:8000'; 

  function goToStep(step: 1 | 2 | 3) {
      currentStep = step;
      analysisError = null; // Clear errors when moving steps
      summaryError = null; // <<< Clear summary error
      if (step === 1 || step === 2) {
          contractSummary = null; // <<< Reset summary
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
          summaryError = null; // <<< Reset summary error
          contractSummary = null; // <<< Reset summary
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
    summaryError = null; // <<< Reset summary error
    contractSummary = null; // <<< Reset summary
    generalRequirementsResult = null;
    contractCategory = null;
    categoryAnalysisResult = null;
    categoryAnalysisMessage = null;
    analysisPhase = 'summary'; // <<< Start with summary phase
    goToStep(3); // Go to results page immediately to show progress

    console.log(`Starting analysis for ${uploadedFileName}...`);
    
    // Use separate FormData for each request
    const formDataSummary = new FormData();
    formDataSummary.append('file', uploadedFile);
    
    const formDataGeneral = new FormData();
    formDataGeneral.append('file', uploadedFile);

    const formDataCat = new FormData(); 
    formDataCat.append('file', uploadedFile);


    // --- Call 1: Summary ---
    try {
        console.log("[Analysis] Calling /analyze/summary...");
        const responseSummary = await fetch(`${API_BASE_URL}/api/analyze/summary`, {
            method: 'POST',
            body: formDataSummary,
        });

        if (!responseSummary.ok) {
            let errorDetail = "Failed during summary generation.";
            try { errorDetail = (await responseSummary.json()).detail || errorDetail; } catch (e) {/* ignore */}
            throw new Error(errorDetail);
        }

        const summaryResult = await responseSummary.json();
        contractSummary = summaryResult.summary;
        console.log("[Analysis] Summary Result:", contractSummary);
        analysisPhase = 'general'; // <<< Move to general phase on success

    } catch (error) {
        console.error("[Analysis] Summary call failed:", error);
        summaryError = error instanceof Error ? error.message : "An unknown error occurred during summary generation.";
        analysisPhase = 'error'; // <<< Set error phase
        return; // Stop analysis if summary fails
    }


    // --- Call 2: General Requirements ---
    try {
        console.log("[Analysis] Calling /check-requirements...");
        const responseGeneral = await fetch(`${API_BASE_URL}/api/analyze/check-requirements`, {
            method: 'POST',
            body: formDataGeneral, // Send the form data
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

    // --- Call 3: Category-Specific Requirements ---
    try {
        console.log("[Analysis] Calling /check-category-requirements...");
        const responseCategory = await fetch(`${API_BASE_URL}/api/analyze/check-category-requirements`, {
            method: 'POST',
            body: formDataCat, 
        });

        if (!responseCategory.ok) {
            let errorDetail = "Failed during category-specific requirements check.";
            try { errorDetail = (await responseCategory.json()).detail || errorDetail; } catch (e) {/* ignore */} 
            throw new Error(errorDetail);
        }

        const resultCategory: CategoryRequirementsResponse = await responseCategory.json(); // Uses updated interface
        console.log("[Analysis] Category Requirements Result:", resultCategory);
        contractCategory = resultCategory.category;
        categoryAnalysisResult = resultCategory.analysis; 
        categoryAnalysisMessage = resultCategory.message ?? null; 
        analysisPhase = 'done'; 

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

  // Helper function to calculate status counts for GENERAL requirements
  function calculateStatusCounts(criteria: object): { falseCount: number; maybeCount: number } {
      let falseCount = 0;
      let maybeCount = 0;

      if (!criteria) return { falseCount: 0, maybeCount: 0 };

      for (const result of Object.values(criteria)) {
          // Keep this specific to the GENERAL requirements structure
          if (result && typeof result === 'object' && 'met' in result) {
              const checkResult = result as RequirementCheckResult; 
              if (checkResult.met === false) {
                  falseCount++;
              } else if (checkResult.met === 'maybe') {
                  maybeCount++;
              }
          }
      }
      return { falseCount, maybeCount };
  }

  // New helper for category status colors/icons (optional, can inline)
  function getStatusProps(status: CategoryExtractionResult['status']): { color: string; icon: any; label: string } {
      switch (status) {
          case 'extracted': return { color: 'green', icon: CheckCircle2, label: 'Extracted' };
          case 'missing': return { color: 'red', icon: XCircle, label: 'Missing' };
          case 'review_needed': return { color: 'yellow', icon: HelpCircle, label: 'Review Needed' };
          default: return { color: 'gray', icon: HelpCircle, label: 'Unknown' }; 
      }
  }

  // <<< REVISED: Function to handle PDF export from state >>>
  async function exportToPdf() {
    console.log("Exporting analysis state to PDF...");

    if (analysisPhase !== 'done' && analysisPhase !== 'error') {
      alert("Analysis is not yet complete.");
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 15; // Page margin in mm
      const maxLineWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      let currentY = margin;
      const lineSpacing = 7; // Spacing between lines
      const sectionSpacing = 10; // Spacing between sections

      // --- Helper function to add text and handle page breaks ---
      const addText = (text: string | string[], options: { size?: number; style?: string } = {}) => {
          pdf.setFontSize(options.size || 11);
          pdf.setFont('helvetica', options.style || 'normal');
          const lines = pdf.splitTextToSize(text, maxLineWidth);
          
          lines.forEach((line: string) => {
              if (currentY + lineSpacing > pdf.internal.pageSize.getHeight() - margin) {
                  pdf.addPage();
                  currentY = margin;
              }
              pdf.text(line, margin, currentY);
              currentY += lineSpacing;
          });
      };

      // --- Title ---
      addText('Contract Analysis Report', { size: 18, style: 'bold' });
      currentY += lineSpacing;

      // --- Filename ---
      if (uploadedFileName) {
          addText(`File: ${uploadedFileName}`, { size: 10, style: 'italic' });
          currentY += sectionSpacing; 
      }

      // --- Summary --- 
      if (contractSummary) {
          addText('Contract Summary', { size: 14, style: 'bold' });
          currentY += lineSpacing * 0.5;
          addText(contractSummary);
          currentY += sectionSpacing;
      } else if (summaryError) {
          addText('Contract Summary', { size: 14, style: 'bold' });
          currentY += lineSpacing * 0.5;
          addText(`Error generating summary: ${summaryError}`, { style: 'italic' });
          currentY += sectionSpacing;
      }

      // --- General Requirements --- 
      if (generalRequirementsResult) {
          addText('General Contract Requirements', { size: 14, style: 'bold' });
          currentY += lineSpacing;

          for (const [category, criteria] of Object.entries(generalRequirementsResult)) {
              addText(formatCategoryName(category), { size: 12, style: 'bold' });
              currentY += lineSpacing * 0.5;
              for (const [key, result] of Object.entries(criteria)) {
                   if (result && typeof result === 'object' && 'met' in result) {
                      let statusText = '';
                      if (result.met === true) statusText = '[Met]';
                      else if (result.met === false) statusText = '[Not Met]';
                      else statusText = '[Review Needed]';
                      
                      const criterionText = `${formatCriterionKey(key)}: ${statusText} ${result.explanation}`;
                      addText(criterionText);
                  }
              }
              currentY += lineSpacing; // Space after each category
          }
          currentY += sectionSpacing;
      }

      // --- Category Specific Analysis ---
      addText('Specific Analysis of the Contract', { size: 14, style: 'bold' });
      currentY += lineSpacing;
      
      if (contractCategory) {
          addText(`Detected Contract Type: ${contractCategory}`, { size: 12, style: 'bold' });
          currentY += lineSpacing;

          if (categoryAnalysisResult) {
               for (const [key, result] of Object.entries(categoryAnalysisResult)) {
                   const statusProps = getStatusProps(result.status);
                   let detailText = `[${statusProps.label}]`;
                   if (result.value) {
                       detailText += ` - Value: ${result.value}`;
                   }
                   if (result.location) {
                       detailText += ` (Location: ${result.location})`;
                   }

                   addText(`${formatCriterionKey(key)}: ${detailText}`);
               }
          } else if (categoryAnalysisMessage) {
              addText(categoryAnalysisMessage, { style: 'italic' });
          }
      } else {
          addText('Contract type could not be determined or analysis was skipped.', { style: 'italic' });
      }
      currentY += sectionSpacing;
      
      // --- Errors (if any during detailed analysis) ---
      if (analysisError && analysisPhase === 'error') {
          addText('Analysis Errors', { size: 14, style: 'bold' });
          currentY += lineSpacing * 0.5;
          addText(`An error occurred during detailed analysis: ${analysisError}`, { style: 'italic' });
      }

      // --- Save PDF ---
      const filename = uploadedFileName ? `Contract_Analysis_${uploadedFileName.split('.')[0]}.pdf` : 'Contract_Analysis.pdf';
      pdf.save(filename);
      console.log("State-based PDF exported successfully!");

    } catch (error) {
      console.error("Error during PDF export:", error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
                    disabled={!uploadedFile || ['summary', 'general', 'category'].includes(analysisPhase)} 
                    class="px-5 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
                >
                    {#if ['summary', 'general', 'category'].includes(analysisPhase)}
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
                    disabled={['summary', 'general', 'category'].includes(analysisPhase)} 
                 >
                    <svelte:component this={ArrowLeft} class="w-4 h-4" />
                    <span>Back to Upload</span>
                 </button>
            </div>

             {#if uploadedFileName}
                <p class="text-sm text-neutral-medium mb-4">File: <span class="font-medium text-neutral-dark">{uploadedFileName}</span></p>
             {/if}

             <!-- <<< NEW: Analysis Overview Section >>> -->
             <section aria-labelledby="overview-heading" class="mb-6 bg-neutral-white p-4 rounded-md border border-neutral-light shadow-sm">
                <h3 id="overview-heading" class="text-base font-semibold text-neutral-darkest mb-3 font-serif border-b border-neutral-light pb-2">Analysis Overview</h3>

                {#if analysisPhase === 'summary' || analysisPhase === 'general' || analysisPhase === 'category'}
                    <!-- Loading State -->
                    <div class="text-neutral-dark flex items-center space-x-2 text-sm">
                        <svelte:component this={Loader2} class="animate-spin h-4 w-4 text-brand-muted" />
                        <span>Analysis in progress...</span>
                    </div>
                {:else if analysisPhase === 'error'}
                    <!-- Error State -->
                     <div class="text-sm text-red-700 flex items-start space-x-2">
                         <svelte:component this={AlertTriangle} class="w-5 h-5 flex-shrink-0 mt-0.5" />
                         <div>
                             <span class="font-medium">Analysis encountered issues.</span> 
                             {#if summaryError}<p class="text-xs mt-1">Summary Error: {summaryError}</p>{/if}
                             {#if analysisError}<p class="text-xs mt-1">Detailed Analysis Error: {analysisError}</p>{/if}
                         </div>
                    </div>
                {:else if analysisPhase === 'done'}
                     <!-- Completed State -->
                     <div class="space-y-2 text-sm">
                         <div class="flex items-center space-x-2">
                             <svelte:component this={CheckCircle2} class="w-5 h-5 text-green-600 flex-shrink-0" />
                             <span class="text-neutral-darkest">Analysis complete for <span class="font-medium">{uploadedFileName}</span>.</span>
                         </div>

                         <!-- <<< NEW: Display Contract Category >>> -->
                         {#if contractCategory}
                             <div class="flex items-center space-x-2 pl-7">
                                <svelte:component this={FileIcon} class="w-4 h-4 text-brand-muted flex-shrink-0" />
                                <span class="text-xs text-neutral-medium">Detected Category: <span class="font-medium text-neutral-darkest">{contractCategory}</span></span>
                             </div>
                         {:else}
                            <div class="flex items-center space-x-2 pl-7">
                                 <svelte:component this={HelpCircle} class="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                 <span class="text-xs text-neutral-medium italic">Category could not be determined.</span>
                            </div>
                         {/if}

                         <!-- General Req Summary -->
                         {#if generalRequirementsResult}
                             {@const generalCounts = Object.values(generalRequirementsResult).reduce((acc, criteria) => {
                                 const { falseCount, maybeCount } = calculateStatusCounts(criteria);
                                 acc.falseCount += falseCount;
                                 acc.maybeCount += maybeCount;
                                 return acc;
                             }, { falseCount: 0, maybeCount: 0 })}
                             <div class="flex items-center space-x-2 pl-7">
                                 <span class="text-xs text-neutral-medium">General:</span>
                                 {#if generalCounts.falseCount === 0 && generalCounts.maybeCount === 0}
                                     <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><svelte:component this={CheckCircle2} class="w-3 h-3 mr-0.5"/> Looks good</span>
                                 {:else}
                                     {#if generalCounts.falseCount > 0} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><svelte:component this={XCircle} class="w-3 h-3 mr-0.5"/> {generalCounts.falseCount} Failed</span> {/if}
                                     {#if generalCounts.maybeCount > 0} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svelte:component this={HelpCircle} class="w-3 h-3 mr-0.5"/> {generalCounts.maybeCount} Review</span> {/if}
                                 {/if}
                             </div>
                         {/if}

                         <!-- Category Req Summary -->
                         {#if contractCategory}
                            <div class="flex items-center space-x-2 pl-7">
                                <span class="text-xs text-neutral-medium">Category ({contractCategory}):</span>
                                {#if categoryAnalysisResult}
                                     {@const categoryCounts = Object.values(categoryAnalysisResult).reduce((acc, result) => {
                                        if (result.status === 'missing') acc.missing++;
                                        if (result.status === 'review_needed') acc.review++;
                                        return acc;
                                    }, { missing: 0, review: 0 })}
                                    {#if categoryCounts.missing === 0 && categoryCounts.review === 0}
                                         <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><svelte:component this={CheckCircle2} class="w-3 h-3 mr-0.5"/> All Extracted</span>
                                    {:else}
                                        {#if categoryCounts.missing > 0} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><svelte:component this={XCircle} class="w-3 h-3 mr-0.5"/> {categoryCounts.missing} Missing</span> {/if}
                                        {#if categoryCounts.review > 0} <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svelte:component this={HelpCircle} class="w-3 h-3 mr-0.5"/> {categoryCounts.review} Review</span> {/if}
                                    {/if}
                                {:else if categoryAnalysisMessage}
                                    <span class="text-xs text-neutral-medium italic">{categoryAnalysisMessage}</span>
                                {:else}
                                     <span class="text-xs text-neutral-medium italic">No specific analysis performed.</span>
                                {/if}
                            </div>
                         {:else}
                             <div class="pl-7 text-xs text-neutral-medium italic">Category not determined or analysis skipped.</div>
                         {/if}
                     </div>
                {:else}
                     <!-- Idle/Initial State -->
                     <p class="text-sm text-neutral-medium">Analysis overview will appear here once completed.</p>
                {/if}
             </section>
             <!-- <<< END: Analysis Overview Section >>> -->

             <!-- <<< START: Summary Section >>> -->
             <details class="mb-6 group" open>
                 <summary class="list-none cursor-pointer flex items-center justify-between pb-3 border-b border-neutral-light mb-4">
                     <h3 id="summary-heading" class="text-lg font-semibold text-neutral-dark font-serif">Contract Summary</h3>
                     <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                 </summary>
                 <section aria-labelledby="summary-heading">
                     {#if analysisPhase === 'summary'}
                         <!-- Loading state for summary -->
                         <div class="text-neutral-dark flex items-center justify-center text-center p-6 border border-dashed border-neutral-light rounded-md min-h-[100px] bg-neutral-lightest">
                             <div><svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" /> Generating summary...</div>
                         </div>
                     {:else if summaryError}
                         <!-- Error state for summary -->
                         <div class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start space-x-2">
                             <svelte:component this={AlertTriangle} class="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <div>
                                 <span class="font-medium">Summary Failed:</span> {summaryError}
                             </div>
                         </div>
                     {:else if contractSummary}
                         <!-- Display summary -->
                         <div class="bg-neutral-white p-4 rounded-md border border-neutral-light shadow-sm text-sm text-neutral-darkest prose prose-sm max-w-none">
                             <p>{contractSummary}</p>
                         </div>
                     {:else if analysisPhase !== 'idle'} 
                      <!-- Fallback if no summary and not loading/error (shouldn't happen if summary is first) -->
                         <div class="text-neutral-medium px-4 py-6 text-center border border-dashed border-neutral-light rounded-md min-h-[100px]">
                             <p>Summary will appear here.</p>
                         </div>
                     {/if}
                 </section>
             </details>
             <!-- <<< END: Summary Section >>> -->

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
             {:else if analysisPhase === 'category' || analysisPhase === 'done'}
                 <!-- Show placeholder if general analysis didn't load but subsequent steps did -->
                 <div class="text-neutral-medium px-4 py-6 text-center border border-dashed border-neutral-light rounded-md min-h-[100px]">
                     <p>General requirements analysis will appear here.</p>
                 </div>
             {/if}

            <!-- Category Specific Requirements Section (UPDATED) -->
            <details class="mt-8 group" open> 
                 <summary class="list-none cursor-pointer flex items-center justify-between pb-3 border-b border-neutral-light mb-4">
                     <h3 id="category-results-heading" class="text-lg font-semibold text-neutral-dark font-serif">
                        <!-- {#if contractCategory}Specific Requirements for: {contractCategory}{:else}Category Specific Requirements{/if} -->
                        Specific Analysis of the Contract
                     </h3>
                     <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                 </summary>
                 <section aria-labelledby="category-results-heading" >
                    {#if analysisPhase === 'category'} 
                         <!-- Loading state -->
                         <div class="text-neutral-dark flex items-center justify-center text-center p-6 border border-dashed border-neutral-light rounded-md min-h-[100px]">
                             <div><svelte:component this={Loader2} class="animate-spin h-6 w-6 text-brand-muted mx-auto mb-2" /> Analyzing category-specific requirements...</div>
                         </div>
                    {:else if analysisPhase === 'done' && contractCategory}
                        <!-- Display category extraction results -->
                        <div class="bg-neutral-white p-1 md:p-2 rounded-md border border-neutral-light shadow-sm">
                            {#if categoryAnalysisResult}
                                <div class="space-y-3 p-2 md:p-4">
                                    <!-- <<< NEW: Static display for Contract Category >>> -->
                                    <details class="border border-neutral-light rounded-md group" open>
                                        <summary class="list-none flex items-center justify-between bg-neutral-lightest px-4 py-3 cursor-pointer hover:bg-neutral-lighter transition duration-150 ease-in-out rounded-t-md">
                                            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                                                <span class="font-semibold font-serif text-base text-neutral-darkest">Detected Contract Type</span>
                                                <!-- Status Badge -->
                                                <span class={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                                    <svelte:component this={FileIcon} class="w-3 h-3 mr-1"/> Identified
                                                </span>
                                            </div>
                                            <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                                        </summary>
                                        <div class="bg-white rounded-b-md p-4 text-sm space-y-2">
                                             <div class="prose prose-sm max-w-none text-neutral-darkest">
                                                <p><strong>Identified Type:</strong> {contractCategory}</p> 
                                             </div>
                                        </div>
                                    </details>
                                    <!-- <<< END: Static display >>> -->

                                    {#each Object.entries(categoryAnalysisResult) as [key, result]} 
                                         {@const statusProps = getStatusProps(result.status)}
                                         <details class="border border-neutral-light rounded-md group" open>
                                             <summary class="list-none flex items-center justify-between bg-neutral-lightest px-4 py-3 cursor-pointer hover:bg-neutral-lighter transition duration-150 ease-in-out rounded-t-md">
                                                 <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                                                      <span class="font-semibold font-serif text-base text-neutral-darkest">{formatCriterionKey(key)}</span>
                                                      <!-- Status Badge -->
                                                      <span class={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-${statusProps.color}-100 text-${statusProps.color}-800`}>
                                                          <svelte:component this={statusProps.icon} class="w-3 h-3 mr-1"/> {statusProps.label}
                                                      </span>
                                                 </div>
                                                 <svelte:component this={ChevronDown} class="w-5 h-5 text-neutral-dark group-open:rotate-180 transition-transform flex-shrink-0 ml-2"/>
                                             </summary>
                                             <div class="bg-white rounded-b-md p-4 text-sm space-y-2">
                                                 {#if result.status === 'extracted' && result.value}
                                                      <div class="prose prose-sm max-w-none text-neutral-darkest">
                                                         <p><strong>Extracted Value:</strong></p> 
                                                         <blockquote class="border-l-4 border-neutral-light pl-4 italic">{result.value}</blockquote>
                                                      </div>
                                                 {:else if result.status === 'review_needed' && result.value}
                                                      <p class="text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200"><strong>Note:</strong> {result.value}</p> 
                                                 {/if}
                                                 {#if result.location}
                                                      <p class="text-xs text-neutral-medium">Location: <span class="font-mono bg-neutral-lightest px-1 py-0.5 rounded">{result.location}</span></p>
                                                 {:else if result.status === 'missing'}
                                                      <p class="text-xs text-red-700">Information not found in the document.</p>
                                                 {:else if result.status === 'review_needed' && !result.location}
                                                      <p class="text-xs text-yellow-700">Location unclear, requires review.</p>
                                                 {/if}
                                             </div>
                                         </details>
                                    {/each}
                                </div>
                            {:else if categoryAnalysisMessage} 
                                 <!-- Message if analysis not available -->
                                 <div class="text-neutral-medium px-4 py-6 text-center">
                                     <p>{categoryAnalysisMessage}</p>
                                 </div>
                            {/if}
                        </div>
                    {:else if analysisPhase === 'error' && analysisError && generalRequirementsResult} 
                         <!-- Error from category call shown if general succeeded -->
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

            <!-- <<< Add Export Button Back >>> -->
            <div class="mt-8 flex justify-end">
                <button
                    on:click={exportToPdf}
                    disabled={analysisPhase !== 'done' && analysisPhase !== 'error'}
                    class="px-4 py-2 bg-neutral-light text-neutral-darkest rounded-md font-semibold text-sm hover:bg-neutral-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-light transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
                >
                    <svelte:component this={Download} class="w-4 h-4" />
                    <span>Export Results (PDF)</span>
                </button>
            </div>
            <!-- <<< END: Export Button >>> -->

        </div>
    {/if}
</div> 