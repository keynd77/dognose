// Gallery JavaScript
let currentImageIndex = 0;
let allImages = [];

// Initialize the gallery
function initGallery() {
    loadAllMemes();
    setupModal();
}

// Load all memes from the memes folder
function loadAllMemes() {
    const galleryGrid = document.getElementById('galleryGrid');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading memes...';
    galleryGrid.appendChild(loadingDiv);
    
    // Generate array of image numbers from 1 to 307
    const imageNumbers = Array.from({length: 307}, (_, i) => i + 1);
    
    // Load images
    let loadedCount = 0;
    const totalImages = imageNumbers.length;
    
    imageNumbers.forEach((num, index) => {
        const img = new Image();
        img.onload = function() {
            createGalleryItem(img.src, num, index);
            loadedCount++;
            
            if (loadedCount === totalImages) {
                // Remove loading message
                const loading = document.querySelector('.loading');
                if (loading) {
                    loading.remove();
                }
            }
        };
        img.onerror = function() {
            // If image fails to load, still count it
            loadedCount++;
            if (loadedCount === totalImages) {
                const loading = document.querySelector('.loading');
                if (loading) {
                    loading.remove();
                }
            }
        };
        img.src = `memes/nose_${num}.jpg`;
    });
}

// Create a gallery item
function createGalleryItem(imageSrc, imageNumber, index) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.onclick = () => openModal(index);
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = `Nose Meme ${imageNumber}`;
    img.loading = 'lazy';
    
    galleryItem.appendChild(img);
    
    // Store image data
    allImages.push({
        src: imageSrc,
        number: imageNumber,
        index: index
    });
    
    galleryGrid.appendChild(galleryItem);
}

// Setup modal for full-size image viewing
function setupModal() {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal';
    
    const modalContent = document.createElement('img');
    modalContent.className = 'modal-content';
    modalContent.id = 'modalImage';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    
    modal.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside or on close button
    modal.onclick = function(event) {
        if (event.target === modal || event.target === closeBtn) {
            closeModal();
        }
    };
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Open modal with specific image
function openModal(index) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    if (allImages[index]) {
        modalImg.src = allImages[index].src;
        modal.style.display = 'block';
        currentImageIndex = index;
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});
