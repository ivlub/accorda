<script lang="ts">
    import { fade } from 'svelte/transition';
    export let navigate: (view: 'analysis' | 'comparison') => void;
</script>

<div class="flex items-center justify-center min-h-full px-6 py-12 md:py-24 bg-gradient-to-br from-neutral-white to-neutral-lightest">
    <div class="max-w-4xl text-center" in:fade={{ duration: 600, delay: 150 }}>
        <!-- Optional: Placeholder for a subtle, professional graphic/icon above title -->
         <!-- <svg class="h-16 w-16 mx-auto mb-6 text-brand-muted opacity-50" ... ></svg> -->

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-brand-dark mb-5 tracking-tight">
            Unlock Contract Intelligence
        </h1>
        <p class="text-base sm:text-lg text-neutral-darkest mb-12 max-w-3xl mx-auto leading-relaxed tracking-wide">
            Accorda leverages cutting-edge AI to accelerate contract analysis and comparison, providing critical insights with unprecedented speed and accuracy.
        </p>
        <div class="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
            <button 
                on:click={() => navigate('analysis')} 
                class="w-full sm:w-auto px-8 py-3 bg-brand-dark text-neutral-white rounded-md font-semibold text-base shadow-sm hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition duration-150 ease-in-out transform hover:-translate-y-0.5"
            >
                Analyze Single Contract
            </button>
            <button 
                on:click={() => navigate('comparison')} 
                class="w-full sm:w-auto px-8 py-3 bg-neutral-white text-brand-dark border border-neutral-medium rounded-md font-semibold text-base shadow-sm hover:border-brand-dark hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-muted transition duration-150 ease-in-out transform hover:-translate-y-0.5"
            >
                Compare Contracts
            </button>
        </div>
    </div>
</div>

<style>
    /* Ensure this component attempts to fill height */
    div:first-child {
        min-height: inherit; /* Inherit min-height from parent */
    }
</style> 