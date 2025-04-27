<script lang="ts">
  import { Home, FileText, GitCompareArrows, Settings, Brain, ClipboardList, HelpCircle } from 'lucide-svelte'; // Import Lucide icons and Brain icon + ClipboardList + HelpCircle

  // Define the view type directly or import from App.svelte if preferred
  type View = 'welcome' | 'analysis' | 'comparison' | 'summary' | 'help' | 'settings';

  export let currentView: View;
  export let navigate: (view: View) => void;
  export let userName: string; // Add userName prop
  export let userEmail: string; // Add userEmail prop

  // Placeholder icons (consider a dedicated icon library like heroicons or lucide-svelte later)
  const icons = {
    analysis: `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />`, // Document Text
    comparison: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.25l-2.25-2.25m0 0l-2.25 2.25M13.5 11.25V17.25" />`, // Document Duplicate
    welcome: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />` // Home
  }


</script>

<!-- Sidebar hidden on < md, fixed on >= md -->
<aside class="hidden md:flex md:flex-shrink-0">
  <div class="flex flex-col w-64">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex flex-col flex-grow bg-brand-dark pt-5 pb-4 overflow-y-auto">
      <!-- Logo Area -->
      <div class="flex items-center flex-shrink-0 px-4 mb-5">
         <button 
           class="flex items-center space-x-1 focus:outline-none"
           on:click={() => navigate('welcome')}
           aria-label="Go to Accorda home"
         >
            <!-- Inline Logo SVG (logo_nosign.svg) -->
            <div class="h-8 w-auto text-brand-accent">
              <svg width="100%" height="100%" viewBox="0 0 739 640" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                  <g transform="matrix(1,0,0,1,-4717.49,-3026)">
                      <g id="Artboard2" transform="matrix(1,0,0,0.238806,1746.49,3025.76)">
                          <!-- <rect x="2971" y="1" width="739" height="2680" style="fill:none;"/> --> <!-- Removed unused rect -->
                          <g transform="matrix(1.51798,0,0,3.1783,1022.93,40.3269)">
                              <g>
                                  <g transform="matrix(0.411058,0,0,1.0033,635.841,-3935.36)">
                                      <path d="M2189.75,4173.88C2197.71,4183.2 2203,4190.28 2203,4190.28L2203,4072.92L2317.31,4072.92L2317.31,4602.17L2203,4602.17L2203,4494.61C2198.6,4499.45 2186.6,4520.53 2160.2,4539.8C2044.55,4624.2 1829.54,4593.13 1756.91,4443.68C1698.79,4324.09 1756.26,4200.56 1858.47,4141.03C1957.14,4083.57 2113.98,4085.1 2189.75,4173.88ZM2020,4180C1844.62,4180 1778.41,4389.18 1909.91,4475.18C2025.16,4550.55 2190.71,4483.19 2202.63,4355.82C2210.05,4276.59 2134.94,4180 2020,4180Z" style="fill:currentColor;"/>
                                  </g>
                                  <g transform="matrix(0.607418,0,0,0.869962,915.186,-1064.82)">
                                      <g transform="matrix(0.339292,0,0,0.493828,1029.41,-792.594)">
                                          <path d="M790.302,4852C750.92,4958.18 656.768,5033 547,5033C401.846,5033 284,4902.16 284,4741C284,4579.84 401.846,4449 547,4449C656.768,4449 750.92,4523.82 790.302,4630L673.089,4630C643.583,4588.11 597.645,4561.17 546.083,4561.17C457.144,4561.17 394,4642.25 394,4741C394,4839.75 457.144,4919 546.083,4919C596.889,4919 642.235,4892.84 671.78,4852L790.302,4852Z" style="fill:currentColor;"/>
                                      </g>
                                      <g transform="matrix(0.339292,0,0,0.493828,1032.13,-486.421)">
                                          <path d="M790.302,4852C750.92,4958.18 656.768,5033 547,5033C401.846,5033 284,4902.16 284,4741C284,4579.84 401.846,4449 547,4449C656.768,4449 750.92,4523.82 790.302,4630L673.089,4630C643.583,4588.11 597.645,4561.17 546.083,4561.17C457.144,4561.17 394,4642.25 394,4741C394,4839.75 457.144,4919 546.083,4919C596.889,4919 642.235,4892.84 671.78,4852L790.302,4852Z" style="fill:currentColor;"/>
                                      </g>
                                  </g>
                              </g>
                          </g>
                      </g>
                  </g>
              </svg>
            </div>
            <span class="font-serif font-bold text-2xl tracking-tight text-brand-accent">Accorda</span>
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

           <!-- Help/Tutorial Link -->
            <button 
             on:click={() => navigate('help')} 
             class="w-full flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md group transition ease-in-out duration-150"
             class:text-neutral-white={currentView === 'help'}
             class:bg-neutral-lightest={currentView === 'help'}
             class:bg-opacity-10={currentView === 'help'} 
             class:text-neutral-light={currentView !== 'help'}
             class:hover:text-neutral-white={currentView !== 'help'}
             class:hover:bg-neutral-lightest={currentView !== 'help'}
             class:hover:bg-opacity-5={currentView !== 'help'}
             aria-current={currentView === 'help' ? 'page' : undefined}
           >
             <svelte:component this={HelpCircle} class="mr-4 flex-shrink-0 h-6 w-6" strokeWidth={1.75} />
             Help / Tutorial
           </button>

           <!-- Settings Link -->
           <button 
             on:click={() => navigate('settings')} 
             class="w-full flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md group transition ease-in-out duration-150"
             class:text-neutral-white={currentView === 'settings'}
             class:bg-neutral-lightest={currentView === 'settings'}
             class:bg-opacity-10={currentView === 'settings'} 
             class:text-neutral-light={currentView !== 'settings'}
             class:hover:text-neutral-white={currentView !== 'settings'}
             class:hover:bg-neutral-lightest={currentView !== 'settings'}
             class:hover:bg-opacity-5={currentView !== 'settings'}
             aria-current={currentView === 'settings' ? 'page' : undefined}
           >
             <svelte:component this={Settings} class="mr-4 flex-shrink-0 h-6 w-6" strokeWidth={1.75} />
             Settings
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
             <button 
               type="button" 
               class="ml-auto flex-shrink-0 bg-brand-dark p-1 rounded-full text-neutral-light hover:text-neutral-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-white"
               on:click={() => navigate('settings')} 
               aria-label="Go to settings"
             >
                <span class="sr-only">User settings</span>
                 <!-- Icon: Cog -->
                <svelte:component this={Settings} class="h-5 w-5" strokeWidth={1.75} />
             </button>
          </div>
        </div>
    </div>
  </div>
</aside> 