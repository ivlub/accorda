<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FileText, GitCompareArrows, Zap } from 'lucide-svelte';
    export let navigate: (view: 'analysis' | 'comparison') => void;

    const features = [
        { 
            name: 'AI-Powered Analysis', 
            description: 'Leverage advanced AI to quickly extract key clauses, identify risks, and summarize single documents.',
            icon: FileText
        },
        {
            name: 'Rapid Comparison',
            description: 'Instantly compare two contract versions, highlighting differences and ensuring consistency.',
            icon: GitCompareArrows
        },
        {
            name: 'Efficiency Boost',
            description: 'Dramatically reduce manual review time, allowing legal teams to focus on higher-value tasks.',
            icon: Zap
        }
    ];
</script>

<div class="w-full min-h-full flex flex-col items-center justify-center px-6 py-12 md:py-16 bg-gradient-to-br from-neutral-white to-neutral-lightest relative">
    <!-- Optional Placeholder for a subtle background graphic -->
    <!-- <div class="absolute inset-0 opacity-5 [background-image:url(...)] bg-no-repeat bg-center"></div> -->

    <div class="relative z-10 max-w-4xl text-center" in:fade={{ duration: 600, delay: 150 }}>
        <!-- Optional: Placeholder for a subtle, professional graphic/icon above title -->
         <!-- <svg class="h-16 w-16 mx-auto mb-6 text-brand-muted opacity-50" ... ></svg> -->

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-brand-dark mb-5 tracking-tight">
            Unlock Contract Intelligence
        </h1>
        <p class="text-base sm:text-lg text-neutral-darkest mb-10 max-w-3xl mx-auto leading-relaxed tracking-wide">
            Accorda leverages cutting-edge AI to accelerate contract analysis and comparison, providing critical insights with unprecedented speed and accuracy.
        </p>
        <div class="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0 mb-16 md:mb-20">
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

        <!-- Key Features Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {#each features as feature (feature.name)}
                <div class="flex space-x-4">
                    <div class="flex-shrink-0">
                        <svelte:component this={feature.icon} class="h-6 w-6 text-brand-muted" strokeWidth={1.75} />
                    </div>
                    <div>
                        <h3 class="text-md font-semibold text-neutral-darkest mb-1">{feature.name}</h3>
                        <p class="text-sm text-neutral-dark">{feature.description}</p>
                    </div>
                </div>
            {/each}
        </div>

    </div>
</div>

<style>
    /* Ensure this component attempts to fill height */
    div:first-child {
        min-height: inherit; /* Inherit min-height from parent */
    }
</style> 