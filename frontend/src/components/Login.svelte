<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let username = '';
    let password = '';
    let error = ''; // Local error for empty fields

    // Prop to receive authentication error from parent
    export let loginError = ''; 

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        // Basic validation
        if (!username || !password) {
            error = 'Please enter both username and password.';
            loginError = ''; // Clear any previous auth error
            return;
        }
        error = ''; // Clear local error before dispatching
        // Dispatch the login attempt event with credentials
        dispatch('loginAttempt', { username, password });
    }
</script>

<div 
    class="relative min-h-screen bg-brand-dark flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-serif bg-no-repeat bg-right-bottom bg-[length:75%]"
    style="background-image: url('/world_global.svg');"
>
    
    <!-- Logo placed outside the card, top-left -->
    <img class="absolute top-0 left-0 m-8 h-36 w-auto" src="/logo.svg" alt="Accorda Logo">

    <div class="w-full max-w-md"> 
        
        <div class="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            
            <!-- Removed logo from here -->

            <div class="text-center"> <!-- Restored original centering and padding removed -->
                <h2 class="text-3xl font-bold text-neutral-darkest"> <!-- Restored original size -->
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

                {#if loginError} <!-- Display authentication error from parent -->
                    <p class="text-sm text-red-600 text-center font-sans">{loginError}</p>
                {:else if error} <!-- Display local validation error -->
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