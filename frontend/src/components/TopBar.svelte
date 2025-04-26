<script lang="ts">
  import { Bell, HelpCircle, Settings } from 'lucide-svelte'; // Import Lucide icons

  // Define the view type directly or import from App.svelte if preferred
  type View = 'welcome' | 'analysis' | 'comparison' | 'summary' | 'help';

  export let currentView: View;

  const viewTitles = {
    welcome: 'Dashboard', // Or maybe hide title on welcome?
    analysis: 'Contract Analysis',
    comparison: 'Contract Comparison',
    summary: 'Contract Summary',
    help: 'Help & Tutorial' // Add title for help view
  };

  $: title = viewTitles[currentView];
</script>

<div class="relative z-10 flex-shrink-0 flex h-16 bg-neutral-white border-b border-neutral-light shadow-sm">
  <div class="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
    <div class="flex-1 flex items-center">
      <!-- Current View Title -->
      {#if currentView !== 'welcome'} 
        <h1 class="text-lg font-semibold text-neutral-darkest font-serif">{title}</h1>
      {/if}
      <!-- Maybe add global search here later -->
    </div>
    <div class="ml-4 flex items-center md:ml-6 space-x-1 sm:space-x-2">
      <!-- Placeholder: Notifications -->
      <button type="button" title="Notifications" class="bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted">
        <span class="sr-only">View notifications</span>
        <svelte:component this={Bell} class="h-5 w-5" strokeWidth={1.75} />
      </button>

       <!-- Placeholder: Help/Support -->
       <button type="button" title="Help" class="bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted">
          <span class="sr-only">Help</span>
          <svelte:component this={HelpCircle} class="h-5 w-5" strokeWidth={1.75} />
       </button>

      <!-- User profile / settings button placeholder -->
       <button type="button" title="Settings" class="bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted">
        <span class="sr-only">User Settings</span>
        <svelte:component this={Settings} class="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  </div>
</div> 