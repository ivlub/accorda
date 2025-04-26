<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { UploadCloud, Scale, Loader2, AlertTriangle, FileUp, FileDiff } from 'lucide-svelte';
  import * as Diff from 'diff';
  import * as Diff2Html from 'diff2html';
  import 'diff2html/bundles/css/diff2html.min.css';

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

      const formData = new FormData();
      formData.append('file1', uploadedFile1);
      formData.append('file2', uploadedFile2);

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
              // 1. Generate line diffs using 'diff' library
              const lineDiffs: Diff.Change[] = Diff.diffLines(data.text1 || '', data.text2 || '');
              console.log('Generated Line Diffs:', lineDiffs); // Log the raw line diffs

              // 2. Construct the input structure for Diff2Html
              // diff2html expects an array of file diff objects.
              // We'll create one file diff object representing the comparison.
              const diffJson = [
                  {
                      blocks: [] as any[], // Use 'any[]' for blocks for now, structure is complex
                      // Correctly return sum from reduce and type it
                      deletedLines: lineDiffs.filter((part: Diff.Change) => part.removed).reduce((sum: number, part: Diff.Change): number => sum + (part.count || 0), 0),
                      addedLines: lineDiffs.filter((part: Diff.Change) => part.added).reduce((sum: number, part: Diff.Change): number => sum + (part.count || 0), 0),
                      isGitDiff: false, // Indicate it's not a git-specific diff
                      isCombined: false, // Add missing required property
                      oldName: data.filename1 || 'file1',
                      newName: data.filename2 || 'file2',
                      language: 'plaintext', // Or try to detect? Start simple.
                      hunks: [] // Keeping hunks empty for now
                  }
              ];

              // Attempt to structure line diffs into blocks for diff2html
              let currentBlock: { header: string; lines: any[]; oldStartLine: number; newStartLine: number; } | null = null;
              let oldLineNum = 1;
              let newLineNum = 1;

              // Explicitly type part in forEach
              lineDiffs.forEach((part: Diff.Change) => {
                  const lines = part.value.split('\n');
                  if (lines[lines.length - 1] === '') lines.pop(); 

                  // Explicitly type lineContent in forEach
                  lines.forEach((lineContent: string, index: number) => {
                      let type;
                      if (part.added) {
                          type = 'insert';
                      } else if (part.removed) {
                          type = 'delete';
                      } else {
                          type = 'context';
                      }

                      // diff2html expects line objects within blocks
                      const lineObj = {
                          content: lineContent,
                          type: type,
                          oldNumber: part.removed || !part.added ? oldLineNum : undefined,
                          newNumber: part.added || !part.added ? newLineNum : undefined,
                      };
                      
                      // Simple block creation - might need improvement
                      if (!currentBlock) {
                           // Heuristic for header - might need adjustment
                          currentBlock = { header: `Block starting near line ${oldLineNum}/${newLineNum}`, lines: [], oldStartLine: oldLineNum, newStartLine: newLineNum }; 
                          diffJson[0].blocks.push(currentBlock as any);
                      }
                      currentBlock.lines.push(lineObj);
                      
                      // Increment line numbers
                      if (!part.added) oldLineNum++;
                      if (!part.removed) newLineNum++;

                      // Crude way to split blocks - could be improved
                      // if (type === 'context' && index === lines.length - 1) { 
                      //     currentBlock = null;
                      // }
                  });
                    // Reset block after each part? Might group too much or too little.
                    // currentBlock = null;
              });

              console.log('Constructed Diff JSON for Diff2Html:', diffJson); // Log the constructed JSON

              // 3. Generate HTML using diff2html from the constructed JSON structure
              comparisonResult = Diff2Html.html(diffJson, { // Pass constructed JSON here
                  drawFileList: false, 
                  outputFormat: 'side-by-side', 
                  renderNothingWhenEmpty: false 
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
          }

      } catch (error: any) {
          console.error("Comparison failed:", error);
          errorMessage = `Comparison failed: ${error.message || 'Network error'}`;
          comparisonResult = null;
      } finally {
          isComparing = false;
      }
  }

  // Reusable File Input Component (Conceptual)
  // In a real Svelte app, create a separate FileInputArea.svelte component
  // function FileInputArea({ fileNumber, fileName, onFileSelect }) { ... }

</script>

<style>
  /* Target the diff container specifically within this component */
  .diff-container :global(.d2h-code-side-linenumber),
  .diff-container :global(.d2h-code-linenumber) {
    /* Override sticky positioning that might be causing the scrolling issue */
    position: relative !important; /* Try relative positioning */
    /* Alternatively, try position: static !important; */
     left: auto !important; /* Reset any horizontal positioning */
     z-index: auto !important; /* Reset z-index */
  }

  /* Ensure the overall wrapper maintains layout */
  .diff-container :global(.d2h-wrapper) {
      position: relative; /* Establish a positioning context if needed */
  }
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
    </section>

  </div>
</div> 