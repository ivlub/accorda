<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { UploadCloud, Scale, Loader2, AlertTriangle, FileUp, FileDiff, Download } from 'lucide-svelte';
  import * as Diff from 'diff';
  import * as Diff2Html from 'diff2html';
  import 'diff2html/bundles/css/diff2html.min.css';
  import jsPDF from 'jspdf';

  let uploadedFile1: File | null = null;
  let uploadedFile1Name: string | null = null;
  let uploadedFile2: File | null = null;
  let uploadedFile2Name: string | null = null;
  let isComparing = false;
  let comparisonResult: string | null = null;
  let errorMessage: string | null = null;
  let isExplaining = false;
  let diffExplanation: string | null = null;
  let explanationErrorMessage: string | null = null;

  function handleFileSelect(event: Event, fileNumber: 1 | 2) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
          const file = target.files[0];
          errorMessage = null; comparisonResult = null; diffExplanation = null; explanationErrorMessage = null;
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

  async function getDiffExplanation(file1: File, file2: File) {
      if (!file1 || !file2) return;

      isExplaining = true;
      diffExplanation = null;
      explanationErrorMessage = null;
      console.log("Fetching diff explanation...");

      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);

      try {
          const response = await fetch('/api/explain-diff', {
              method: 'POST',
              body: formData,
          });
          console.log('Explain API Response Status:', response.status);

          if (!response.ok) {
              const errorText = await response.text();
              console.error('Explain API Error Response Text:', errorText);
              throw new Error(response.statusText + (errorText ? `: ${errorText}` : ''));
          }

          const data = await response.json();
          console.log('Received explanation data from API:', data);
          
          if (data.explanation) {
              diffExplanation = data.explanation;
              console.log("Diff explanation fetched successfully.");
          } else {
              throw new Error("Explanation missing in API response.");
          }

      } catch (error: any) {
          console.error("Fetching explanation failed:", error);
          explanationErrorMessage = `Failed to get explanation: ${error.message || 'Network error'}`;
          diffExplanation = null;
      } finally {
          isExplaining = false;
      }
  }

  async function startComparison() {
      if (!uploadedFile1 || !uploadedFile2) { errorMessage = "Please select two contract files."; return; }
      errorMessage = null; isComparing = true; comparisonResult = null; diffExplanation = null; explanationErrorMessage = null; isExplaining = false;
      console.log(`Starting comparison between ${uploadedFile1Name} and ${uploadedFile2Name}...`);

      const formData = new FormData();
      formData.append('file1', uploadedFile1);
      formData.append('file2', uploadedFile2);

      let comparisonSuccess = false;

      try {
          const response = await fetch('/api/compare', {
              method: 'POST',
              body: formData,
          });
          console.log('API Response Status:', response.status);

          if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error Response Text:', errorText);
              throw new Error(response.statusText + (errorText ? `: ${errorText}` : ''));
          }

          const data = await response.json();
          console.log('Received data from API:', data); // Log received data
          
          try {
              // 1. Generate a unified diff patch string using 'diff' library
              const oldFileName = data.filename1 || 'file1';
              const newFileName = data.filename2 || 'file2';
              const oldStr = data.text1 || '';
              const newStr = data.text2 || '';

              console.log('Received text lengths:', { text1: oldStr.length, text2: newStr.length });

              // Use createTwoFilesPatch to generate a standard diff format string
              const diffPatch = Diff.createTwoFilesPatch(
                  oldFileName,
                  newFileName,
                  oldStr,
                  newStr,
                  '', // oldHeader - Optional
                  '', // newHeader - Optional
                  { context: 100 } // Increase context lines significantly
              );
              console.log('Generated Unified Diff Patch:', diffPatch); // Log the patch string
              console.log('Generated Diff Patch length:', diffPatch.length); // Log patch length

              // 2. Generate HTML using diff2html directly from the patch string
              comparisonResult = Diff2Html.html(diffPatch, { // Pass the patch string here
                  drawFileList: false, 
                  outputFormat: 'side-by-side', 
                  renderNothingWhenEmpty: false,
                  matching: 'lines', // Improve matching accuracy
                  // wordByWordThreshold: 0.25 // Experiment with word-level diff if needed
              });
              console.log('Generated HTML:', comparisonResult); // Log the final HTML
          } catch (genError: any) {
              console.error("Error generating diff structure or HTML:", genError);
              errorMessage = `Failed to render comparison: ${genError.message}`;
              comparisonResult = null; // Clear result on error
          }
          
          // Only log success if HTML generation didn't throw
          if (comparisonResult) {
              console.log("Comparison successful, diff generated.");
              comparisonSuccess = true;
          }

      } catch (error: any) {
          console.error("Comparison failed:", error);
          errorMessage = `Comparison failed: ${error.message || 'Network error'}`;
          comparisonResult = null;
          comparisonSuccess = false;
      } finally {
          isComparing = false;
      }

      if (comparisonSuccess && uploadedFile1 && uploadedFile2) {
          await getDiffExplanation(uploadedFile1, uploadedFile2);
      }
  }

  async function exportToPdf() {
    console.log("Exporting comparison PDF...");

    if (!comparisonResult || !diffExplanation) {
      alert("Comparison results and explanation must be generated first.");
      return;
    }
    if (!uploadedFile1Name || !uploadedFile2Name) {
        alert("File names are missing."); // Should not happen if results exist
        return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // --- Style Constants ---
      const MARGIN = 20;
      const FOOTER_HEIGHT = 15;
      const MAX_CONTENT_WIDTH = pageWidth - MARGIN * 2;
      const FONT = 'times'; // Or 'helvetica', 'courier'
      const COLORS = {
          text: [0, 0, 0],
          heading: [0, 0, 0],
          subtle: [100, 100, 100],
          error: [200, 0, 0]
      };
      const SIZES = {
          title: 20,
          h1: 16,
          h2: 13,
          body: 11,
          small: 9,
          footer: 8
      };
      const LINE_SPACING_FACTOR = 1.2;
      const PARAGRAPH_SPACING = 4;
      const SECTION_SPACING = 8;

      let currentY = MARGIN;
      let currentPage = 1;

      // --- Robust Page Break & Footer Logic ---
      const checkAndAddPage = (neededHeight: number) => {
          if (currentY + neededHeight > pageHeight - MARGIN - FOOTER_HEIGHT) {
              addFooter(pdf, currentPage);
              pdf.addPage();
              currentPage++;
              currentY = MARGIN;
              return true; 
          }
          return false; 
      };

      const addFooter = (doc: jsPDF, pageNum: number) => {
          doc.setFont(FONT, 'italic');
          doc.setFontSize(SIZES.footer);
          doc.setTextColor(COLORS.subtle[0], COLORS.subtle[1], COLORS.subtle[2]);
          const footerY = pageHeight - 10;
          doc.text(
              `Generated by Accorda`, 
              MARGIN, 
              footerY
          );
           doc.text(
              `Page ${pageNum}`,
              pageWidth - MARGIN,
              footerY,
              { align: 'right' }
          );
           doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
           doc.setFont(FONT, 'normal');
      };
      
      // --- Refined Text Adding Helper ---
      const addFormattedText = (text: string | string[], options: { 
          x?: number, 
          size?: number; 
          style?: string; 
          color?: number[]; 
          align?: 'left' | 'center' | 'right';
          indent?: number;
      } = {}) => {
          const xPos = (options.x || MARGIN) + (options.indent || 0);
          const size = options.size || SIZES.body;
          const style = options.style || 'normal';
          const color = options.color || COLORS.text;
          const align = options.align || 'left';
          const effectiveMaxWidth = MAX_CONTENT_WIDTH - (options.indent || 0);

          let actualXPos = xPos;
          if (align === 'center') {
              actualXPos = MARGIN + MAX_CONTENT_WIDTH / 2;
          } else if (align === 'right') {
              actualXPos = MARGIN + MAX_CONTENT_WIDTH;
          }

          const inputText = Array.isArray(text) ? text.join('\n') : text;
          // Use effectiveMaxWidth for splitting text
          const lines = pdf.splitTextToSize(inputText, effectiveMaxWidth);
          const lineHeight = size * LINE_SPACING_FACTOR * 0.35; 
          const textBlockHeight = lines.length * lineHeight;

          checkAndAddPage(textBlockHeight);

          pdf.setFont(FONT, style);
          pdf.setFontSize(size);
          pdf.setTextColor(color[0], color[1], color[2]);

          // Use actualXPos for positioning
          pdf.text(lines, actualXPos, currentY, { align: align });
          currentY += textBlockHeight;

          pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          pdf.setFont(FONT, 'normal');
          pdf.setFontSize(SIZES.body);
      };

      // --- PDF Content Generation ---
      
      // 1. Title
      addFormattedText('Contract Comparison Report', { size: SIZES.title, style: 'bold', align: 'center' });
      currentY += SECTION_SPACING;

      // 2. Filenames
      addFormattedText('Compared Files:', { size: SIZES.h1, style: 'bold' });
      currentY += PARAGRAPH_SPACING;
      addFormattedText(` • File 1: ${uploadedFile1Name}`, { size: SIZES.body, indent: 5 });
      currentY += PARAGRAPH_SPACING * 0.5;
      addFormattedText(` • File 2: ${uploadedFile2Name}`, { size: SIZES.body, indent: 5 });
      currentY += SECTION_SPACING * 1.5;

      // 3. AI Explanation
      addFormattedText('AI Explanation of Changes', { size: SIZES.h1, style: 'bold' });
      currentY += PARAGRAPH_SPACING;
      // Provide the explanation text directly
      addFormattedText(diffExplanation || "Explanation not available.", { size: SIZES.body });
      currentY += SECTION_SPACING;

      // --- Final Footer & Save ---
      addFooter(pdf, currentPage);
      
      const filename = `Accorda_Comparison_${uploadedFile1Name.split('.')[0]}_vs_${uploadedFile2Name.split('.')[0]}.pdf`;
      pdf.save(filename);
      console.log("Comparison PDF exported successfully!");

    } catch (error) {
      console.error("Error during PDF export:", error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

</script>

<style>
  /* Target the diff container specifically within this component */
  .diff-container :global(.d2h-code-side-linenumber),
  .diff-container :global(.d2h-code-linenumber) {
    /* Hide the line number columns */
    display: none !important;
  }

  /* Hide the @@ hunk header lines - trying more specific selector */
  .diff-container :global(table.d2h-diff-table > tbody.d2h-diff-tbody > tr > td.d2h-hunk-header) {
      display: none !important;
  }

  /* Set background of added/deleted TABLE CELLS */
  .diff-container :global(td.d2h-ins) {
      background-color: #e6ffed !important; /* Light green background for the cell */
  }
  .diff-container :global(td.d2h-del) {
      background-color: #ffebe9 !important; /* Light red background for the cell */
  }

  /* Style the specific deleted text segments within the line */
  .diff-container :global(td.d2h-del del) { /* Target del inside td.d2h-del */
      background-color: #ffc9c4 !important; /* Slightly darker red */
      border-radius: 3px;
      padding: 0 2px;
      text-decoration: none !important; /* Remove default strikethrough if present */
  }

  /* Style the specific added text segments within the line */
  .diff-container :global(td.d2h-ins ins) { /* Target ins inside td.d2h-ins */
      background-color: #c3e9c3 !important; /* Slightly darker green */
      border-radius: 3px;
      padding: 0 2px;
      text-decoration: none !important; /* Remove default underline if present */
  }

  /* Ensure the overall wrapper maintains layout */
  .diff-container :global(.d2h-wrapper) {
      position: relative; /* Establish a positioning context if needed */
  }

  /* Hide the technical file header */
  .diff-container :global(.d2h-file-header) {
    display: none !important;
  }

  /* This rule is likely redundant as the parent column is hidden */
  /* .d2h-code-side-line {
    display: none !important;
  } */
</style>

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
                      <!-- Target div for diff2html output -->
                      <div 
                          class="diff-container text-left w-full h-full overflow-auto text-sm border border-neutral-light rounded max-h-[70vh] bg-white"
                      >
                           <!-- Render the diff2html generated HTML -->
                          {@html comparisonResult}
                      </div>
                  {:else if errorMessage}
                      <div class="text-red-600 px-4">
                          <svelte:component this={AlertTriangle} class="h-8 w-8 mx-auto mb-1" strokeWidth={1.5} />
                          {errorMessage}
                      </div>
                  {:else}
                      <div class="text-neutral-medium px-4">
                           <svelte:component this={FileDiff} class="w-12 h-12 mx-auto mb-2 text-neutral-light" strokeWidth={1.5} />
                          Comparison results will be displayed here. Select two files and click Compare.
                      </div>
                  {/if}
              </div>
          {/key}
        </div>
      </div>

      <!-- Explanation Section -->
      {#if comparisonResult || isExplaining || explanationErrorMessage}
        <div class="mt-8 bg-neutral-white p-6 rounded-md border border-neutral-light">
          <h3 class="text-base font-semibold text-brand-dark mb-3">AI Explanation of Changes</h3>
           {#key diffExplanation || isExplaining || explanationErrorMessage}
              <div class="text-sm text-neutral-darkest space-y-2" in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
                  {#if isExplaining}
                      <div class="flex items-center text-neutral-dark">
                          <svelte:component this={Loader2} class="animate-spin h-4 w-4 mr-2 text-brand-muted" />
                          Generating explanation...
                      </div>
                  {:else if diffExplanation}
                       <!-- Render the explanation, potentially preserving whitespace/newlines -->
                      <div class="whitespace-pre-wrap">{@html diffExplanation}</div>
                  {:else if explanationErrorMessage}
                      <div class="text-red-600 flex items-start">
                          <svelte:component this={AlertTriangle} class="h-5 w-5 mr-1.5 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                          {explanationErrorMessage}
                      </div>
                  {:else if comparisonResult && !isExplaining && !diffExplanation && !explanationErrorMessage}
                       <!-- Initial state after comparison, before explanation starts/finishes -->
                       <p class="text-neutral-medium italic">Explanation will appear here.</p>
                  {/if}
              </div>
           {/key}
        </div>
      {/if}

      <!-- <<< NEW: Export Button >>> -->
      <div class="mt-8 flex justify-end">
        <button
            on:click={exportToPdf}
            disabled={!comparisonResult || !diffExplanation}
            class="px-4 py-2 bg-neutral-light text-neutral-darkest rounded-md font-semibold text-sm hover:bg-neutral-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-light transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm"
        >
            <svelte:component this={Download} class="w-4 h-4" />
            <span>Export Results (PDF)</span>
        </button>
      </div>
      <!-- <<< END: Export Button >>> -->

    </section>

  </div>
</div> 