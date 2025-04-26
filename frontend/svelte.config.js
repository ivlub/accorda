import preprocess from 'svelte-preprocess';

const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    postcss: true, // Tells svelte-preprocess to process <style> blocks with PostCSS
  }),
};

export default config; 