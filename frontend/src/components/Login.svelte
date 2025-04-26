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

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-light to-neutral-medium py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
            <img class="mx-auto h-16 w-auto" src="/logo.svg" alt="Accorda Logo"> 
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to Accorda
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Enter your credentials to continue
            </p>
        </div>
        <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
            <input type="hidden" name="remember" value="true">
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="username" class="sr-only">Username</label>
                    <input id="username" name="username" type="text" bind:value={username} required
                           class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-dark focus:border-brand-dark focus:z-10 sm:text-sm"
                           placeholder="Username">
                </div>
                <div>
                    <label for="password" class="sr-only">Password</label>
                    <input id="password" name="password" type="password" bind:value={password} required
                           class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-dark focus:border-brand-dark focus:z-10 sm:text-sm"
                           placeholder="Password">
                </div>
            </div>

            {#if error}
                <p class="text-sm text-red-600 text-center">{error}</p>
            {/if}

            <div>
                <button type="submit"
                        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-dark hover:bg-neutral-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition duration-150 ease-in-out">
                    Sign in
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    /* Add any additional specific styles here if needed */
    /* Ensure Tailwind is properly configured */
</style> 