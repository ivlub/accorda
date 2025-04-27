import { writable } from 'svelte/store';

export type AiModel = 'gemini-1.5-flash' | 'gemini-2.5-pro-exp-03-25';

// Default model
const defaultModel: AiModel = 'gemini-1.5-flash';

// Writable store for the selected AI model
export const selectedAiModel = writable<AiModel>(defaultModel); 