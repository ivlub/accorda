<script lang="ts">
  import { Bell, HelpCircle, Settings, LogOut } from 'lucide-svelte'; // Import Lucide icons and LogOut icon
  import { createEventDispatcher } from 'svelte'; // Import event dispatcher
  import Modal from './Modal.svelte'; // Import Modal component

  // Define the view type directly or import from App.svelte if preferred
  type View = 'welcome' | 'analysis' | 'comparison' | 'summary' | 'help';

  export let currentView: View;

  let showNotificationModal = false; // State for modal visibility

  const dispatch = createEventDispatcher(); // Create dispatcher instance

  function handleSignOut() {
    dispatch('signOut');
  }

  function navigateToHelp() {
    dispatch('navigate', 'help'); // Dispatch navigate event with 'help'
  }

  function openNotificationModal() {
    showNotificationModal = true;
  }

  function closeNotificationModal() {
    showNotificationModal = false;
  }

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
      <button 
        on:click={openNotificationModal} 
        type="button" 
        title="Notifications" 
        class="relative bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted"
      >
        <span class="sr-only">View notifications</span>
        <svelte:component this={Bell} class="h-5 w-5" strokeWidth={1.75} />
        <!-- Notification Dot -->
        <span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 nice-pulse-animation"></span>
      </button>

       <!-- Placeholder: Help/Support -->
       <button on:click={navigateToHelp} type="button" title="Help" class="bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted">
          <span class="sr-only">Help</span>
          <svelte:component this={HelpCircle} class="h-5 w-5" strokeWidth={1.75} />
       </button>

      <!-- User profile / settings button placeholder -->
       <button 
          type="button" 
          title="Settings" 
          class="bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted"
          on:click={() => dispatch('navigate', 'settings')}
       >
        <span class="sr-only">User Settings</span>
        <svelte:component this={Settings} class="h-5 w-5" strokeWidth={1.75} />
      </button>

      <!-- Sign Out Button -->
      <button on:click={handleSignOut} type="button" title="Sign Out" class="bg-neutral-white p-1.5 rounded-full text-neutral-dark hover:text-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted">
        <span class="sr-only">Sign Out</span>
        <svelte:component this={LogOut} class="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  </div>
</div> 

<!-- Notification Modal -->
<Modal bind:showModal={showNotificationModal} title="Notification" on:close={closeNotificationModal}>
    <p>Yes, even this button does something. Attention to detail is important for us.</p>
</Modal> 

<style>
  @keyframes nice-pulse {
    0%, 100% {
      /* No shadow at start/end */
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); /* Use the red-500 color */
    }
    70% {
      /* Expand shadow outwards */
      box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
    }
  }

  .nice-pulse-animation {
    /* Apply ONLY the animation */
    animation: nice-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style> 