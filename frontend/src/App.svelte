<script lang="ts">
  import { fade } from 'svelte/transition';
  import Welcome from './components/Welcome.svelte';
  import ContractAnalysis from './components/ContractAnalysis.svelte';
  import ContractComparison from './components/ContractComparison.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import TopBar from './components/TopBar.svelte'; // Minimal top bar
  import ContractSummary from './components/ContractSummary.svelte'; // Import the new component
  import HelpTutorial from './components/HelpTutorial.svelte'; // Import the new help component
  import Login from './components/Login.svelte'; // Import the Login component
  import LoadingSpinner from './components/LoadingSpinner.svelte'; // Import the spinner
  import SettingsView from './components/SettingsView.svelte'; // Import the Settings component

  type View = 'welcome' | 'analysis' | 'comparison' | 'summary' | 'help' | 'settings'; // Add 'settings' view
  let currentView: View = 'welcome';
  let isLoggedIn = false; // Start as not logged in
  let isLoadingAfterLogin = false; // Added loading state
  let isLoggingOut = false; // Added logout loading state
  let loginError = ''; // To display login errors if needed
  let loggedInUsername = ''; // Store the username
  let loggedInUserEmail = ''; // Store the email

  // Define an interface for user data
  interface UserData {
    password: string;
    email: string;
    name: string;
  }

  function navigate(view: View) {
    currentView = view;
  }

  // Fake login handler
  function handleLoginAttempt(event: CustomEvent<{ username: string; password: string}>) { // Explicitly type event detail
    const { username, password } = event.detail;
    // Define user data with type annotation
    const users: Record<string, UserData> = {
      'sara.mendes': { password: 'blackcat123', email: 'sara.mendes@accorda.legal', name: 'Sara Mendes' },
      'eltemate': { password: 'verysecurepassword', email: 'eltemate@accorda.legal', name: 'Eltemate admin' } // Added another user example
    };

    const user = users[username]; // Get user data

    if (user && user.password === password) {
      loginError = ''; // Clear error on successful attempt start
      isLoadingAfterLogin = true; // Start loading animation
      loggedInUsername = user.name; // Set username
      loggedInUserEmail = user.email; // Set email

      // Wait for a bit before showing the app
      setTimeout(() => {
        isLoggedIn = true;
        isLoadingAfterLogin = false; // Stop loading
        currentView = 'welcome'; // Navigate to welcome screen after login
      }, 500); // 0.5 second delay

    } else {
      loginError = 'Invalid username or password.';
      // Optionally clear the error after a few seconds
      // setTimeout(() => loginError = '', 3000);
    }
  }

  // Sign out handler
  function handleSignOut() {
    isLoggingOut = true; // Start logout spinner
    setTimeout(() => {
      isLoggedIn = false;
      loggedInUsername = ''; // Clear username
      loggedInUserEmail = ''; // Clear email
      loginError = ''; // Clear any previous login error
      isLoggingOut = false; // Stop logout spinner
      // Optionally reset view or do other cleanup
      // currentView = 'welcome';
    }, 500); // 0.5 second delay
  }

  // Could add logic here later to hide sidebar on welcome screen if desired

</script>

{#if isLoggingOut} <!-- Show spinner during logout -->
  <div class="fixed inset-0 flex items-center justify-center bg-neutral-lightest z-50">
      <LoadingSpinner />
  </div>
{:else if !isLoggedIn && !isLoadingAfterLogin} <!-- Show Login -->
  <Login on:loginAttempt={handleLoginAttempt} loginError={loginError} />
{:else if isLoadingAfterLogin} <!-- Show spinner during login -->
  <div class="fixed inset-0 flex items-center justify-center bg-neutral-lightest z-50">
      <LoadingSpinner />
  </div>
{:else} <!-- Show App -->
  <!-- Existing App Layout -->
  <div class="flex h-screen bg-neutral-lightest">
    <!-- Sidebar (Hidden on small screens, fixed on medium+) -->
    <Sidebar {currentView} {navigate} userName={loggedInUsername} userEmail={loggedInUserEmail} />

    <!-- Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Minimal Top Bar (Optional) -->
      <TopBar {currentView} on:signOut={handleSignOut} on:navigate={(event) => navigate(event.detail)} />

      <!-- Main Content Scroll Area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-lightest" id="main-content">
        {#key currentView}
          <div in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }} class="w-full h-full">
            {#if currentView === 'welcome'}
              <!-- Welcome might need full bleed or different container -->
              <Welcome {navigate} />
            {:else if currentView === 'analysis'}
              <div class="p-6 md:p-10"> <ContractAnalysis /> </div>
            {:else if currentView === 'comparison'}
               <div class="p-6 md:p-10"> <ContractComparison /> </div>
            {:else if currentView === 'summary'}
               <div class="p-6 md:p-10"> <ContractSummary /> </div>
            {:else if currentView === 'help'}
               <div class="p-6 md:p-10"> <HelpTutorial /> </div>
            {:else if currentView === 'settings'}
               <div class="p-6 md:p-10"> <SettingsView /> </div>
            {/if}
          </div>
        {/key}
      </main>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    /* Base styles set in index.html body tag */
  }
  /* Ensure content scrolls, not the whole page with the sidebar */
</style> 