<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let username = '';
    let password = '';
    let error = '';

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        // Basic validation
        if (!username || !password) {
            error = 'Please enter both username and password.';
            return;
        }
        error = '';
        // Dispatch the login attempt event with credentials
        dispatch('loginAttempt', { username, password });
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-brand-dark to-neutral-darkest flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-serif">
    
    <div class="w-full max-w-md"> 
        <!-- Logo placed above the card -->
        <img class="mx-auto h-20 w-auto mb-8" src="/logo.svg" alt="Accorda Logo">

        <div class="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            
            <div class="text-center">
                <h2 class="text-3xl font-bold text-neutral-darkest">
                    Welcome Back
                </h2>
                <p class="mt-2 text-sm text-neutral-dark">
                    Sign in to continue to Accorda
                </p>
            </div>

            <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
                <input type="hidden" name="remember" value="true">
                
                <div class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-medium text-neutral-dark font-sans">Username</label>
                        <input 
                            id="username" 
                            name="username" 
                            type="text" 
                            bind:value={username} 
                            required
                            class="mt-1 block w-full px-4 py-3 border border-neutral-light rounded-md shadow-sm placeholder-neutral-medium focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-sm font-sans"
                            placeholder="your.username"
                        >
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-neutral-dark font-sans">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            bind:value={password} 
                            required
                            class="mt-1 block w-full px-4 py-3 border border-neutral-light rounded-md shadow-sm placeholder-neutral-medium focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-sm font-sans"
                            placeholder="••••••••"
                        >
                    </div>
                </div>

                {#if error}
                    <p class="text-sm text-red-600 text-center font-sans">{error}</p>
                {/if}

                <div>
                    <button 
                        type="submit"
                        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent_light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition duration-150 ease-in-out font-sans"
                    >
                        Sign In
                    </button>
                </div>
            </form>
            
            <!-- Optional: Add forgot password or sign up links here if needed -->
            <!-- 
            <div class="text-sm text-center">
                <a href="#" class="font-medium text-brand-dark hover:text-brand-accent">
                    Forgot your password?
                </a>
            </div> 
            -->
        </div>
    </div>
</div>

<style>
    /* Styles remain minimal as Tailwind handles most of it */
</style> 