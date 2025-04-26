<script lang="ts">
  export let currentView: 'welcome' | 'analysis' | 'comparison';
  export let navigate: (view: 'welcome' | 'analysis' | 'comparison') => void;

  // Simple Heroicons (replace with actual SVG paths or library)
  const icons = {
    analysis: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`,
    comparison: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>`,
    welcome: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>` // Home icon
  }

</script>

<!-- Sidebar hidden on < md, fixed on >= md -->
<aside class="hidden md:flex md:flex-shrink-0">
  <div class="flex flex-col w-64">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex flex-col flex-grow bg-brand-dark pt-5 pb-4 overflow-y-auto">
      <div class="flex items-center flex-shrink-0 px-4">
         <!-- Logo Placeholder -->
         <span 
           class="font-semibold text-xl text-neutral-white cursor-pointer tracking-tight"
           on:click={() => navigate('welcome')}
           role="button" tabindex="0" 
           on:keypress={(e) => e.key === 'Enter' && navigate('welcome')}
           aria-label="Go to Accorda home"
         >
             Accorda
         </span>
      </div>
      <nav class="mt-5 flex-1 flex flex-col divide-y divide-neutral-light divide-opacity-10" aria-label="Sidebar">
        <div class="px-2 space-y-1">
          <!-- Welcome/Home Link -->
           <button 
             on:click={() => navigate('welcome')} 
             class="w-full flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md group transition ease-in-out duration-150"
             class:text-neutral-white={currentView === 'welcome'}
             class:bg-neutral-lightest={currentView === 'welcome'}
             class:bg-opacity-10={currentView === 'welcome'} 
             class:text-neutral-light={currentView !== 'welcome'}
             class:hover:text-neutral-white={currentView !== 'welcome'}
             class:hover:bg-neutral-lightest={currentView !== 'welcome'}
             class:hover:bg-opacity-5={currentView !== 'welcome'}
             aria-current={currentView === 'welcome' ? 'page' : undefined}
           >
             <svg class="mr-4 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               {@html icons.welcome}
             </svg>
             Welcome
           </button>

           <!-- Analysis Link -->
            <button 
             on:click={() => navigate('analysis')} 
             class="w-full flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md group transition ease-in-out duration-150"
             class:text-neutral-white={currentView === 'analysis'}
             class:bg-neutral-lightest={currentView === 'analysis'}
             class:bg-opacity-10={currentView === 'analysis'} 
             class:text-neutral-light={currentView !== 'analysis'}
             class:hover:text-neutral-white={currentView !== 'analysis'}
             class:hover:bg-neutral-lightest={currentView !== 'analysis'}
             class:hover:bg-opacity-5={currentView !== 'analysis'}
             aria-current={currentView === 'analysis' ? 'page' : undefined}
           >
             <svg class="mr-4 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {@html icons.analysis}
             </svg>
             Contract Analysis
           </button>

           <!-- Comparison Link -->
            <button 
             on:click={() => navigate('comparison')} 
             class="w-full flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md group transition ease-in-out duration-150"
             class:text-neutral-white={currentView === 'comparison'}
             class:bg-neutral-lightest={currentView === 'comparison'}
             class:bg-opacity-10={currentView === 'comparison'} 
             class:text-neutral-light={currentView !== 'comparison'}
             class:hover:text-neutral-white={currentView !== 'comparison'}
             class:hover:bg-neutral-lightest={currentView !== 'comparison'}
             class:hover:bg-opacity-5={currentView !== 'comparison'}
             aria-current={currentView === 'comparison' ? 'page' : undefined}
           >
             <svg class="mr-4 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {@html icons.comparison}
             </svg>
             Contract Comparison
           </button>
        </div>
        <!-- Could add other sections like Settings, Account etc. here -->
      </nav>
    </div>
  </div>
</aside> 