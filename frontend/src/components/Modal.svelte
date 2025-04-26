<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { X } from 'lucide-svelte';

  export let showModal: boolean = false;
  export let title: string | null = null; // Optional title

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  // Close modal on Escape key press
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if showModal}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm" 
    on:click={closeModal}
    transition:fade={{ duration: 150 }}
    aria-hidden="true"
  ></div>

  <!-- Modal Panel -->
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title"
    on:click|self={closeModal} 
  >
    <div 
      class="relative bg-neutral-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden"
      transition:fade={{ duration: 200, delay: 50 }}
    >
      <!-- Header (Optional Title + Close Button) -->
      <div class="flex items-center justify-between p-4 border-b border-neutral-light">
        {#if title}
          <h2 id="modal-title" class="text-lg font-semibold text-neutral-darkest">{title}</h2>
        {:else}
          <div aria-hidden="true"></div> <!-- Spacer -->
        {/if}
        <button 
          on:click={closeModal} 
          class="text-neutral-medium hover:text-neutral-darkest p-1 -mr-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted"
          aria-label="Close modal"
        >
          <svelte:component this={X} class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-5 text-sm text-neutral-dark">
        <slot></slot> <!-- Content goes here -->
      </div>
    </div>
  </div>
{/if} 