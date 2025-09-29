// Sound toggle functionality
let soundEnabled = true;
const soundToggle = document.getElementById('soundToggle');
const playingAudio = []; // Track all playing audio instances

soundToggle.addEventListener('click', function(event) {
    event.stopPropagation(); // Prevent triggering the main click handler
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        soundToggle.textContent = '🔊';
        soundToggle.classList.remove('muted');
    } else {
        soundToggle.textContent = '🔇';
        soundToggle.classList.add('muted');
        
        // Stop all currently playing audio
        playingAudio.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        playingAudio.length = 0; // Clear the array
    }
});

document.addEventListener('click', function(event) {
    // Don't create dognose if clicking the sound toggle button
    if (event.target === soundToggle) {
        return;
    }
    
    // Create a new dog nose image element
    const dogNose = document.createElement('img');
    dogNose.src = 'dognose.png';
    dogNose.className = 'dog-nose';
    
    // Generate random size between 60px and 170px
    const size = Math.floor(Math.random() * 111) + 60; // 60-170px
    dogNose.style.width = size + 'px';
    dogNose.style.height = size + 'px';
    
    // Randomly mirror horizontally (50% chance)
    if (Math.random() < 0.5) {
        dogNose.classList.add('mirrored');
    }
    
    // Position the dog nose at the click coordinates
    const x = event.clientX - (size / 2); // Offset by half the image width
    const y = event.clientY - (size / 2); // Offset by half the image height
    
    dogNose.style.left = x + 'px';
    dogNose.style.top = y + 'px';
    
    // Create and play sniffing sound only if sound is enabled
    if (soundEnabled) {
        const audio = new Audio('sniffing.mp3');
        audio.volume = 0.5; // Set volume to 50%
        
        // Add to playing audio array
        playingAudio.push(audio);
        
        // Remove from array when audio ends
        audio.addEventListener('ended', function() {
            const index = playingAudio.indexOf(audio);
            if (index > -1) {
                playingAudio.splice(index, 1);
            }
        });
        
        audio.play().catch(error => {
            console.log('Audio play failed:', error);
            // Remove from array if play failed
            const index = playingAudio.indexOf(audio);
            if (index > -1) {
                playingAudio.splice(index, 1);
            }
        });
    }
    
    // Add the dog nose to the page
    document.body.appendChild(dogNose);
});
