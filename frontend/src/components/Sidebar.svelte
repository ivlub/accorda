<script lang="ts">
  import { Home, FileText, GitCompareArrows, Settings, Brain, ClipboardList } from 'lucide-svelte'; // Import Lucide icons and Brain icon + ClipboardList

  export let currentView: 'welcome' | 'analysis' | 'comparison' | 'summary';
  export let navigate: (view: 'welcome' | 'analysis' | 'comparison' | 'summary') => void;

  // Placeholder icons (consider a dedicated icon library like heroicons or lucide-svelte later)
  const icons = {
    analysis: `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />`, // Document Text
    comparison: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.25l-2.25-2.25m0 0l-2.25 2.25M13.5 11.25V17.25" />`, // Document Duplicate
    welcome: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />` // Home
  }

  const userName = "Sara Mendes"; // Placeholder
  const userEmail = "sara.mendes@accorda.ai"; // Placeholder

</script>

<!-- Sidebar hidden on < md, fixed on >= md -->
<aside class="hidden md:flex md:flex-shrink-0">
  <div class="flex flex-col w-64">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex flex-col flex-grow bg-brand-dark pt-5 pb-4 overflow-y-auto">
      <!-- Logo Area -->
      <div class="flex items-center flex-shrink-0 px-4 mb-5">
         <button 
           class="flex items-center space-x-2 text-neutral-white focus:outline-none" 
           on:click={() => navigate('welcome')}
           aria-label="Go to Accorda home"
         >
            <!-- Use Lucide Brain component for Logo -->
            <div class="h-8 w-8 bg-brand-accent rounded flex items-center justify-center">
              <svelte:component this={Brain} class="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span class="font-bold text-xl tracking-tight">Accorda</span>
         </button>
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
             <svelte:component this={Home} class="mr-4 flex-shrink-0 h-6 w-6" strokeWidth={1.75} />
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
             <svelte:component this={FileText} class="mr-4 flex-shrink-0 h-6 w-6" strokeWidth={1.75} />
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
             <svelte:component this={GitCompareArrows} class="mr-4 flex-shrink-0 h-6 w-6" strokeWidth={1.75} />
             Contract Comparison
           </button>

           <!-- Summary Link -->
           <button 
             on:click={() => navigate('summary')} 
             class="w-full flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md group transition ease-in-out duration-150"
             class:text-neutral-white={currentView === 'summary'}
             class:bg-neutral-lightest={currentView === 'summary'}
             class:bg-opacity-10={currentView === 'summary'} 
             class:text-neutral-light={currentView !== 'summary'}
             class:hover:text-neutral-white={currentView !== 'summary'}
             class:hover:bg-neutral-lightest={currentView !== 'summary'}
             class:hover:bg-opacity-5={currentView !== 'summary'}
             aria-current={currentView === 'summary' ? 'page' : undefined}
           >
             <svelte:component this={ClipboardList} class="mr-4 flex-shrink-0 h-6 w-6" strokeWidth={1.75} />
             Contract Summary
           </button>
        </div>
        <!-- Could add other sections like Settings, Account etc. here -->
      </nav>

      <!-- User Section -->
       <div class="mt-auto pt-4 border-t border-neutral-light border-opacity-10">
          <div class="px-4 py-2 flex items-center space-x-3">
             <!-- Placeholder Avatar -->
            <div class="flex-shrink-0 h-8 w-8 rounded-full bg-brand-muted flex items-center justify-center text-sm font-medium text-neutral-white">
              {userName.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-white truncate">{userName}</p>
              <p class="text-xs text-neutral-light truncate">{userEmail}</p>
            </div>
             <!-- Optional: Settings/Logout Button -->
             <button type="button" class="ml-auto flex-shrink-0 bg-brand-dark p-1 rounded-full text-neutral-light hover:text-neutral-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-white">
                <span class="sr-only">User settings</span>
                 <!-- Icon: Cog -->
                <svelte:component this={Settings} class="h-5 w-5" strokeWidth={1.75} />
             </button>
          </div>
        </div>
    </div>
  </div>
</aside> 