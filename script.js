document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTION ---
    const splashScreen = document.getElementById('splash-screen');
    const cardWrapper = document.getElementById('card-wrapper');
    const music = document.getElementById('birthday-music');
    const popSound = document.getElementById('pop-sound');
    const closeButton = document.getElementById('close-card-btn');
    const celebrationContainer = document.getElementById('final-celebration');

    const pages = document.querySelectorAll('.page');
    let currentPageIndex = 1; // Start at page 1

    // --- CONFIGURATION ---
    const SPLASH_DURATION = 3000; // 3 seconds
    const BALLOON_COLORS = ['#ff4d4d', '#1e90ff', '#ff9ff3', '#ffe66d']; // Red, Blue, Pink, Yellow
    const NUM_BALLOONS = 10;
    const TOTAL_PAGES = pages.length;

    // --- AUDIO FUNCTIONS ---

    /**
     * Attempts to play music, handling browser autoplay restrictions.
     */
    function playMusic() {
        // Attempt to play music only after a user interaction
        music.volume = 0.6; // Keep volume moderate
        music.play().catch(error => {
            console.warn("Autoplay prevented:", error);
            // On mobile, the music may only start when the user taps/clicks the page
        });
    }

    /**
     * Plays the pop sound effect.
     */
    function playPopSound() {
        popSound.currentTime = 0; // Rewind the sound to play immediately
        popSound.play().catch(error => console.warn("Pop sound failed:", error));
    }


    // --- CARD FLOW FUNCTIONS ---

    /**
     * Hides the splash screen and reveals the card.
     */
    function revealCard() {
        // Remove the tap listener once we transition
        splashScreen.removeEventListener('click', startSequence);
        splashScreen.classList.add('hidden');
        
        // Wait for the opacity transition to finish (0.5s defined in CSS)
        setTimeout(() => {
            splashScreen.style.display = 'none';
            cardWrapper.classList.remove('hidden');
            // Add listeners for the page flip
            addPageFlipListeners();
        }, 500); 
    }

    /**
     * Main sequence starter, triggered by the first user tap.
     */
    function startSequence() {
        playMusic();

        // 1. Initial happy birthday screen is visible for 3 seconds
        // (The appearance is controlled by CSS, we just wait here)
        setTimeout(revealCard, SPLASH_DURATION);
    }


    // --- PAGE FLIPPING LOGIC ---

    /**
     * Flips the current visible page to reveal the next.
     */
    function flipPage() {
        // Get the current page element (index starts at 1)
        const currentPageElement = document.getElementById(`page-${currentPageIndex}`);
        
        if (currentPageElement && currentPageIndex < TOTAL_PAGES) {
            // Apply the CSS class to trigger the 3D flip animation
            currentPageElement.classList.add('is-flipped');
            currentPageIndex++;
            
            // If the next page is the back cover, we don't add another click listener
            if (currentPageIndex === TOTAL_PAGES) {
                removePageFlipListeners();
            }
        }
    }

    /**
     * Adds click listeners to unflipped pages for the page-turn animation.
     */
    function addPageFlipListeners() {
        pages.forEach(page => {
            // Only add the listener if the page hasn't been flipped yet
            if (!page.classList.contains('is-flipped')) {
                page.addEventListener('click', flipPage, { once: true });
            }
        });
    }

    /**
     * Removes click listeners from all pages (called when we reach the end).
     */
    function removePageFlipListeners() {
        pages.forEach(page => {
            page.removeEventListener('click', flipPage);
        });
    }


    // --- FINAL CELEBRATION LOGIC ---

    /**
     * Creates and launches a single balloon element.
     */
    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');

        // Randomize initial position (X-axis) and color
        const randomX = Math.random() * (window.innerWidth - 60); // 60px is balloon width
        const randomColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
        
        balloon.style.left = `${randomX}px`;
        balloon.style.backgroundColor = randomColor;

        // Randomize animation duration for a natural look
        const randomDuration = Math.random() * 4 + 4; // 4 to 8 seconds
        balloon.style.animationDuration = `${randomDuration}s`;
        
        celebrationContainer.appendChild(balloon);

        // Schedule the balloon to "blast" when it reaches the top
        setTimeout(() => {
            blastBalloon(balloon);
        }, randomDuration * 1000 * 0.9); // Blast slightly before it fully leaves view
    }

    /**
     * Handles the balloon blast (pop sound and image reveal).
     * @param {HTMLElement} balloon - The balloon element to blast.
     */
    function blastBalloon(balloon) {
        if (!balloon || balloon.parentElement !== celebrationContainer) return; // Check if it still exists
        
        playPopSound();
        
        // Get the balloon's current position for image reveal
        const rect = balloon.getBoundingClientRect();
        const blastX = rect.left + rect.width / 2;
        const blastY = rect.top + rect.height / 2;

        // 1. Reveal hidden pictures scattering from the blast point
        for (let i = 0; i < 3; i++) { // Scatter 3 pictures per balloon
            revealPicture(blastX, blastY, i);
        }

        // 2. Remove the balloon
        celebrationContainer.removeChild(balloon);
    }

    /**
     * Creates and animates a scattered picture.
     * @param {number} x - Blast X coordinate.
     * @param {number} y - Blast Y coordinate.
     * @param {number} index - Used to vary the scatter direction.
     */
    function revealPicture(x, y, index) {
        const pic = document.createElement('img');
        pic.src = `assets/photo-small-${index + 1}.jpg`; // Ensure you have photo-small-1.jpg, -2.jpg, etc.
        pic.classList.add('scatter-pic');
        pic.style.left = `${x}px`;
        pic.style.top = `${y}px`;
        
        celebrationContainer.appendChild(pic);

        // CSS Keyframe for scattering is needed here, but for simplicity, we use JS translation:
        const scatterDistance = 200;
        const angle = (index * 120) * (Math.PI / 180); // 120-degree separation
        const endX = x + scatterDistance * Math.cos(angle);
        const endY = y + scatterDistance * Math.sin(angle);
        
        // Apply the final scatter position and fade out
        pic.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
        setTimeout(() => {
            pic.style.transform = `translate(${endX - x}px, ${endY - y}px) scale(0.5) rotate(${Math.random() * 360}deg)`;
            pic.style.opacity = '0';
        }, 50);

        // Clean up the picture after animation
        setTimeout(() => {
            if(pic.parentElement === celebrationContainer) celebrationContainer.removeChild(pic);
        }, 1600);
    }

    /**
     * Starts the balloon launching and popping interval.
     */
    function startCelebration() {
        cardWrapper.style.display = 'none'; // Hide the card itself
        music.pause();
        
        // Start launching balloons every 500ms
        let balloonInterval = setInterval(createBalloon, 500);

        // Stop the balloon launch after 5 seconds (5 * 500ms = 10 balloons + 1-2 extra)
        setTimeout(() => {
            clearInterval(balloonInterval);
        }, 5000); 
    }


    // --- INITIALIZATION ---

    // The first user interaction on the splash screen starts the entire sequence
    splashScreen.addEventListener('click', startSequence, { once: true });
    
    // Set up the close button listener
    closeButton.addEventListener('click', startCelebration);
});
