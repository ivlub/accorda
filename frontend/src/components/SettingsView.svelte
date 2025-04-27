<!-- I was initially planning on adding more settings. Didn't. It's 6:30am. -->
<script lang="ts">
  import { selectedAiModel, type AiModel } from '../stores/settingsStore';

  // Define the available models based on backend/ai_service.py
  const availableModels: { id: AiModel; name: string; description: string }[] = [
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: 'Faster, good for general tasks.',
    },
    {
      id: 'gemini-2.5-pro-exp-03-25',
      name: 'Gemini 2.5 Pro (Experimental)',
      description: 'More accurate, potentially slower, better for complex analysis.',
    },
  ];

  let currentModel: AiModel;
  selectedAiModel.subscribe((value) => {
    currentModel = value;
  });

  function handleModelChange(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedAiModel.set(target.value as AiModel);
  }
</script>

<div class="p-6 md:p-8 space-y-6 bg-neutral-bg min-h-screen">
  <h2 class="text-2xl font-semibold text-neutral-darkest">Settings</h2>

  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-medium text-neutral-darkest mb-4">AI Model Selection</h3>
    <p class="text-sm text-neutral-default mb-4">
      Choose the AI model to use for analysis and generation tasks. Different models offer trade-offs between speed and accuracy.
    </p>

    <fieldset class="space-y-4">
      <legend class="sr-only">AI Model Selection</legend>
      {#each availableModels as model (model.id)}
        <div class="flex items-center">
          <input
            id={model.id}
            name="ai-model-selection"
            type="radio"
            value={model.id}
            checked={currentModel === model.id}
            on:change={handleModelChange}
            class="focus:ring-brand-accent h-4 w-4 text-brand-accent border-neutral-default"
          />
          <label for={model.id} class="ml-3 block text-sm font-medium text-neutral-darkest">
            {model.name}
            <span class="block text-xs text-neutral-default">{model.description}</span>
          </label>
        </div>
      {/each}
    </fieldset>
  </div>

  <!-- Add more settings sections here as needed -->

</div> 