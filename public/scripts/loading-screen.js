/**
 * Loading Screen Controller
 * Manages the loading screen visibility until page is fully loaded
 */

(function() {
    // Track loading state
    window.pageLoadingState = {
        domReady: false,
        dataLoaded: false,
        minTimeElapsed: false
    };

    const MIN_LOADING_TIME = 800; // Minimum display time in ms for smooth UX

    // Start minimum time timer
    setTimeout(() => {
        window.pageLoadingState.minTimeElapsed = true;
        checkAndHideLoader();
    }, MIN_LOADING_TIME);

    // DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        window.pageLoadingState.domReady = true;
        checkAndHideLoader();
    });

    // Window fully loaded (images, etc.)
    window.addEventListener('load', () => {
        // If no async data loading, mark as loaded
        if (!window.waitingForData) {
            window.pageLoadingState.dataLoaded = true;
            checkAndHideLoader();
        }
    });

    // Function to hide loading screen
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 500);
        }
    }

    // Check all conditions and hide if ready
    function checkAndHideLoader() {
        const state = window.pageLoadingState;
        if (state.domReady && state.dataLoaded && state.minTimeElapsed) {
            hideLoadingScreen();
        }
    }

    // Expose function to mark data as loaded (call from page scripts)
    window.dataLoadComplete = function() {
        window.pageLoadingState.dataLoaded = true;
        checkAndHideLoader();
    };

    // Expose function to indicate page is waiting for data
    window.setWaitingForData = function(waiting) {
        window.waitingForData = waiting;
        if (!waiting) {
            window.pageLoadingState.dataLoaded = true;
            checkAndHideLoader();
        }
    };
})();
