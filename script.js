document.addEventListener('click', function(event) {
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
    
    // Add the dog nose to the page
    document.body.appendChild(dogNose);
});
