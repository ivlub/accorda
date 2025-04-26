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
    
    <!-- Logo replaced with inline SVG for animation -->
    <div class="absolute top-0 left-0 m-8 h-36 w-auto text-brand-accent z-20">
      <svg width="100%" height="100%" viewBox="0 0 739 661" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
          <g transform="matrix(1,0,0,1,-2971,-2811)">
              <!-- <rect id="Artboard3" x="2971" y="2811" width="739" height="661" style="fill:none;"/> --> <!-- Removed unused rect -->
              <g id="Artboard31" serif:id="Artboard3">
                  <g transform="matrix(1,0,0,1,-0.284624,2810)">
                      <g transform="matrix(1.51798,0,0,0.758997,1023.29,-43.6085)">
                          <g transform="matrix(0.411058,0,0,1.0033,635.841,-3935.36)">
                              <!-- Added class logo-path-animate -->
                              <path class="logo-path-animate" d="M2189.75,4173.88C2197.71,4183.2 2203,4190.28 2203,4190.28L2203,4072.92L2317.31,4072.92L2317.31,4602.17L2203,4602.17L2203,4494.61C2198.6,4499.45 2186.6,4520.53 2160.2,4539.8C2044.55,4624.2 1829.54,4593.13 1756.91,4443.68C1698.79,4324.09 1756.26,4200.56 1858.47,4141.03C1957.14,4083.57 2113.98,4085.1 2189.75,4173.88ZM2020,4180C1844.62,4180 1778.41,4389.18 1909.91,4475.18C2025.16,4550.55 2190.71,4483.19 2202.63,4355.82C2210.05,4276.59 2134.94,4180 2020,4180Z"/>
                          </g>
                          <g transform="matrix(0.607418,0,0,0.869962,915.186,-1064.82)">
                              <g transform="matrix(0.339292,0,0,0.493828,1029.41,-792.594)">
                                   <!-- Added class logo-path-animate -->
                                  <path class="logo-path-animate" d="M790.302,4852C750.92,4958.18 656.768,5033 547,5033C401.846,5033 284,4902.16 284,4741C284,4579.84 401.846,4449 547,4449C656.768,4449 750.92,4523.82 790.302,4630L673.089,4630C643.583,4588.11 597.645,4561.17 546.083,4561.17C457.144,4561.17 394,4642.25 394,4741C394,4839.75 457.144,4919 546.083,4919C596.889,4919 642.235,4892.84 671.78,4852L790.302,4852Z"/>
                              </g>
                              <g transform="matrix(0.339292,0,0,0.493828,1032.13,-486.421)">
                                   <!-- Added class logo-path-animate -->
                                  <path class="logo-path-animate" d="M790.302,4852C750.92,4958.18 656.768,5033 547,5033C401.846,5033 284,4902.16 284,4741C284,4579.84 401.846,4449 547,4449C656.768,4449 750.92,4523.82 790.302,4630L673.089,4630C643.583,4588.11 597.645,4561.17 546.083,4561.17C457.144,4561.17 394,4642.25 394,4741C394,4839.75 457.144,4919 546.083,4919C596.889,4919 642.235,4892.84 671.78,4852L790.302,4852Z"/>
                              </g>
                          </g>
                      </g>
                      <g transform="matrix(0.567767,0,0,0.567767,2987.35,426.259)">
                          <!-- Added class logo-text-animate -->
                          <text class="logo-text-animate" x="157px" y="304px" style="font-family:'SourceSerifPro-Bold', 'Source Serif Pro', serif;font-weight:700;font-size:251.288px;fill:currentColor;">ac<tspan x="417.586px 544.738px 686.716px 799.293px 946.045px " y="304px 304px 304px 304px 304px ">corda</tspan></text>
                      </g>
                  </g>
              </g>
          </g>
      </svg>
    </div>

    <div class="w-full max-w-md z-10"> <!-- Added z-10 to ensure card is above background potentially -->
        
        <div class="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            

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

    /* SVG Animation Styles */
    @keyframes draw {
        to {
            stroke-dashoffset: 0;
        }
    }

    /* Changed keyframes to animate fill-opacity for fade effect */
    @keyframes fill-in {
        from {
            fill-opacity: 0;
        }
        to {
            fill-opacity: 1;
        }
    }

    /* Added keyframes for text fade-in */
    @keyframes fade-in-text {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .logo-path-animate {
        stroke: currentColor; 
        stroke-width: 8; 
        fill: currentColor; /* Set fill color directly */
        fill-opacity: 0; /* Start fully transparent */
        stroke-dasharray: 5000; 
        stroke-dashoffset: 5000; 
        /* Apply both animations */
        /* Draw animation: 3s duration, 0.5s delay */
        /* Fill animation (opacity): 0.5s duration, 2.0s delay (starts earlier), ease-out timing */
        animation: 
            draw 3s linear forwards 0.5s,
            fill-in 0.5s ease-out forwards 2.0s; /* Decreased delay for fill fade */
    }

    /* Added styles for text animation */
    .logo-text-animate {
        opacity: 0; /* Start transparent */
        fill: currentColor; /* Ensure fill color is set */
        animation: fade-in-text 1.0s ease-in forwards 2.5s; /* Fade in after path fill finishes */
    }
</style> 