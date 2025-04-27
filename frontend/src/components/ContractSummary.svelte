<script lang="ts">
  import { UploadCloud, FileText, Loader2, AlertTriangle } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  let selectedFile: File | null = null;
  let fileName: string | null = null;
  let isLoading = false;
  let summaryResult: string | null = null;
  let errorMessage: string | null = null;
  let fileInput: HTMLInputElement;

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        selectedFile = file;
        fileName = file.name;
        summaryResult = null; 
        errorMessage = null; 
      } else {
        errorMessage = 'Invalid file type. Please upload a PDF or DOCX file.';
        selectedFile = null;
        fileName = null;
        if (fileInput) fileInput.value = ''; 
      }
    } else {
      selectedFile = null;
      fileName = null;
    }
  };

  const triggerFileInput = () => {
    // Clear error when triggering input again if a file wasn't previously selected
    if (!selectedFile) {
        errorMessage = null;
    }
    fileInput?.click();
  };

  const getSummary = async () => {
    if (!selectedFile) {
      errorMessage = 'Please select a file first.';
      return;
    }

    isLoading = true;
    summaryResult = null;
    errorMessage = null;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const apiUrl = 'http://accorda.kolvian.com:8000'; 
      const response = await fetch(`${apiUrl}/api/analyze/summary`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error fetching summary.' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      summaryResult = data.summary;

    } catch (error: any) {
      console.error('Error fetching summary:', error);
      errorMessage = error.message || 'Failed to get summary. Check the console for details.';
    } finally {
      isLoading = false;
    }
  };

  const clearSelection = () => {
     selectedFile = null;
     fileName = null;
     summaryResult = null;
     errorMessage = null;
     if (fileInput) fileInput.value = ''; 
  };

</script>

<!-- Use max-w-3xl for better readability on wider screens -->
<div class="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-3xl mx-auto">
  <h2 class="text-2xl font-semibold text-primary-dark mb-6 font-serif">Contract Summary</h2>

  <!-- File Input Area - styled like ContractAnalysis -->
  <div class="mb-6">
     <label 
        for="summary-contract-upload"
        class="relative flex flex-col items-center justify-center w-full p-5 bg-neutral-white border-2 border-neutral-light border-dashed rounded-md cursor-pointer hover:border-primary-light focus-within:border-primary transition duration-150 ease-in-out group text-center min-h-[120px]"
        class:border-danger-light={!!errorMessage && !fileName}  
        class:hover:border-danger={!!errorMessage && !fileName}
      >
        <svelte:component 
            this={UploadCloud} 
            class="w-10 h-10 mb-2 transition-colors duration-150 ease-in-out {
              !fileName ? 'text-neutral-medium group-hover:text-primary-light' : 'text-primary'
            } {
              !!errorMessage && !fileName ? 'text-danger' : ''
            }" 
            strokeWidth={1.5}/>
        <p class="text-sm text-neutral-dark group-hover:text-primary-dark transition-colors duration-150 ease-in-out">
            {#if fileName}
                <span class="font-medium break-all">{fileName}</span>
            {:else}
                 <span class="font-medium text-primary">Browse file</span> or drag here
            {/if}
        </p>
        <p class="text-xs text-neutral-medium mt-0.5">PDF or DOCX files only</p>
        <input 
            id="summary-contract-upload" 
            type="file" 
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            bind:this={fileInput} 
            on:change={handleFileChange} 
            accept=".pdf,.docx"
        />
    </label>
    {#if fileName && !isLoading}
       <button 
         on:click={clearSelection} 
         class="text-xs text-accent-dark hover:text-accent-darker font-medium focus:outline-none focus:underline mt-2 inline-block"
         aria-label="Remove selected file"
       >
         Clear selection
       </button>
     {/if}
  </div>

  <!-- Action Button Area -->
  <div class="mb-6">
    <button 
      on:click={getSummary} 
      disabled={!selectedFile || isLoading}
      class="w-full px-4 py-2.5 bg-brand-dark text-white rounded-md font-semibold text-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-medium transition duration-150 ease-in-out flex items-center justify-center space-x-2 shadow-sm" 
    >
      {#if isLoading}
        <svelte:component this={Loader2} class="animate-spin h-4 w-4 text-white" />
        <span>Generating Summary...</span>
      {:else}
        <svelte:component this={FileText} class="h-5 w-5 text-white" strokeWidth={2}/>
        <span>Generate Summary</span>
      {/if}
    </button>
  </div>

  <!-- Error Message Display -->
  {#if errorMessage && !isLoading}
    <div transition:fade={{duration: 200}} class="mb-6 p-4 bg-danger-lightest border-l-4 border-danger rounded-md flex items-start space-x-3">
      <svelte:component this={AlertTriangle} class="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
      <p class="text-sm text-danger-dark font-medium">Error: {errorMessage}</p>
    </div>
  {/if}

  <!-- Summary Result Display -->
  {#if summaryResult}
    <div transition:fade={{duration: 300}} class="mt-8 pt-6 border-t border-neutral-light">
      <h3 class="text-xl font-semibold text-primary-dark mb-4 font-serif">Generated Summary:</h3>
      <!-- Using prose for better text styling -->
      <div class="prose prose-sm max-w-none text-neutral-darkest leading-relaxed">
         <p class="whitespace-pre-wrap">{summaryResult}</p>
      </div>
    </div>
  {/if}

</div> 