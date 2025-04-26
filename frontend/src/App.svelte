<script lang="ts">
  import { fade } from 'svelte/transition';
  import Welcome from './components/Welcome.svelte';
  import ContractAnalysis from './components/ContractAnalysis.svelte';
  import ContractComparison from './components/ContractComparison.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import TopBar from './components/TopBar.svelte'; // Minimal top bar

  type View = 'welcome' | 'analysis' | 'comparison';
  let currentView: View = 'welcome';

  function navigate(view: View) {
    currentView = view;
  }

  // Could add logic here later to hide sidebar on welcome screen if desired

</script>

<div class="flex h-screen bg-neutral-lightest">
  <!-- Sidebar (Hidden on small screens, fixed on medium+) -->
  <Sidebar {currentView} {navigate} />

  <!-- Content Area -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Minimal Top Bar (Optional) -->
    <TopBar /> 

    <!-- Main Content Scroll Area -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-lightest" id="main-content">
      {#key currentView}
        <div in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }} class="w-full h-full">
          {#if currentView === 'welcome'}
            <!-- Welcome might need full bleed or different container -->
            <Welcome {navigate} /> 
          {:else if currentView === 'analysis'}
            <div class="p-6 md:p-10"> <ContractAnalysis /> </div>
          {:else if currentView === 'comparison'}
             <div class="p-6 md:p-10"> <ContractComparison /> </div>
          {/if}
        </div>
      {/key}
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    /* Base styles set in index.html body tag */
  }
  /* Ensure content scrolls, not the whole page with the sidebar */
</style> 