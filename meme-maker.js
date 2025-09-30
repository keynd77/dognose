// Meme Maker JavaScript
let stage, layer, backgroundImage, noseImages = [];
let selectedNose = null;

// Initialize the meme maker
function initMemeMaker() {
    // Create Konva stage
    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: 400,
        height: 300,
    });

    // Create layer
    layer = new Konva.Layer();
    stage.add(layer);

    // Set up event listeners
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    const uploadBtn = document.getElementById('uploadBtn');
    const addNoseBtn = document.getElementById('addNoseBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');

    // Upload button
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    // File input
    fileInput.addEventListener('change', handleFileSelect);
    
    // Add nose button
    addNoseBtn.addEventListener('click', addNoseToCanvas);
    
    // Download button
    downloadBtn.addEventListener('click', downloadMeme);
    
    // Clear button
    clearBtn.addEventListener('click', clearCanvas);
    
    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Prevent default drag behaviors
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageToCanvas(file);
    }
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

// Handle drop
function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadImageToCanvas(files[0]);
    }
}

// Load image to canvas
function loadImageToCanvas(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Clear existing background
            if (backgroundImage) {
                backgroundImage.destroy();
            }
            
            // Calculate dimensions to fit within screen
            const maxWidth = Math.min(800, window.innerWidth - 100);
            const maxHeight = Math.min(600, window.innerHeight - 200);
            
            let { width, height } = img;
            
            // Scale down if image is too large
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            // Resize stage to fit the scaled image
            stage.width(width);
            stage.height(height);
            
            // Create background image at scaled size
            backgroundImage = new Konva.Image({
                x: 0,
                y: 0,
                image: img,
                width: width,
                height: height,
            });
            
            // Add click handler to hide transformers when clicking on background
            backgroundImage.on('click', function(e) {
                layer.find('Transformer').forEach(t => t.detach());
                selectedNose = null;
                layer.draw();
            });
            
            layer.add(backgroundImage);
            layer.draw();
            
            // Hide drop zone and expand canvas container
            document.getElementById('dropZone').classList.add('hidden');
            const canvasContainer = document.querySelector('.canvas-container');
            canvasContainer.style.width = width + 'px';
            canvasContainer.style.height = height + 'px';
            canvasContainer.style.maxWidth = '95vw';
            canvasContainer.style.maxHeight = '80vh';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Add nose to canvas
function addNoseToCanvas() {
    if (!backgroundImage) {
        alert('Please upload an image first!');
        return;
    }
    
    // Use a simple Image load without crossOrigin for local files
    const noseImg = new Image();
    noseImg.onload = function() {
        const nose = new Konva.Image({
            x: Math.random() * (stage.width() - 100),
            y: Math.random() * (stage.height() - 100),
            image: noseImg,
            width: 80,
            height: 80,
            draggable: true,
        });
        
        // Add transformer for resizing, rotating, and mirroring
        const transformer = new Konva.Transformer({
            nodes: [nose],
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'],
            rotateEnabled: true,
            borderStroke: '#00D2FF',
            borderStrokeWidth: 2,
            anchorStroke: '#00D2FF',
            anchorFill: '#00D2FF',
            anchorSize: 8,
            rotationAnchorOffset: 20,
        });
        
        // Store transformer reference on the nose object
        nose.transformer = transformer;
        
        // Add delete functionality on double click
        nose.on('dblclick', function(e) {
            e.cancelBubble = true;
            clearTimeout(clickTimeout); // Cancel the single-click action
            transformer.destroy();
            this.destroy();
            layer.draw();
        });
        
        // Toggle transformer on click (with delay to distinguish from double-click)
        let clickTimeout;
        nose.on('click', function(e) {
            e.cancelBubble = true;
            clickTimeout = setTimeout(() => {
                // Hide all other transformers first
                layer.find('Transformer').forEach(t => t.detach());
                
                // If this nose is already selected, deselect it
                if (selectedNose === this) {
                    selectedNose = null;
                    this.transformer.detach();
                } else {
                    // Select this nose
                    selectedNose = this;
                    this.transformer.nodes([this]);
                    layer.add(this.transformer);
                }
                layer.draw();
            }, 200); // 200ms delay to distinguish from double-click
        });
        
        // Hide transformer when clicking elsewhere
        stage.on('click', function(e) {
            if (e.target === stage) {
                layer.find('Transformer').forEach(t => t.detach());
                selectedNose = null;
                layer.draw();
            }
        });
        
        
        layer.add(nose);
        noseImages.push(nose);
        layer.draw();
    };
    noseImg.onerror = function() {
        console.error('Failed to load nose image');
        alert('Failed to load nose image. Please try again.');
    };
    noseImg.src = 'dognose.png';
}


// Download meme using Konva's built-in method with fallback
function downloadMeme() {
    if (!backgroundImage) {
        alert('Please upload an image first!');
        return;
    }
    
    // Hide all transformers before downloading
    layer.find('Transformer').forEach(t => t.detach());
    layer.draw();
    
    try {
        // Try Konva's built-in method first
        const dataURL = stage.toDataURL({
            mimeType: 'image/png',
            quality: 1,
            pixelRatio: 1
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'nose-meme.png';
        link.href = dataURL;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Konva export failed, trying manual method:', error);
        
        // Fallback: Create a new Konva stage for export
        try {
            // Create a temporary container
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            document.body.appendChild(tempContainer);
            
            // Create a new stage with the same dimensions
            const exportStage = new Konva.Stage({
                container: tempContainer,
                width: stage.width(),
                height: stage.height(),
            });
            
            const exportLayer = new Konva.Layer();
            exportStage.add(exportLayer);
            
            // Clone background image
            if (backgroundImage) {
                const exportBg = new Konva.Image({
                    x: backgroundImage.x(),
                    y: backgroundImage.y(),
                    image: backgroundImage.image(),
                    width: backgroundImage.width(),
                    height: backgroundImage.height(),
                });
                exportLayer.add(exportBg);
            }
            
            // Clone nose images with all transformations
            noseImages.forEach(nose => {
                const exportNose = new Konva.Image({
                    x: nose.x(),
                    y: nose.y(),
                    image: nose.image(),
                    width: nose.width(),
                    height: nose.height(),
                    scaleX: nose.scaleX(),
                    scaleY: nose.scaleY(),
                    rotation: nose.rotation(),
                });
                exportLayer.add(exportNose);
            });
            
            exportLayer.draw();
            
            // Export the clean stage
            const dataURL = exportStage.toDataURL({
                mimeType: 'image/png',
                quality: 1,
                pixelRatio: 1
            });
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'nose-meme.png';
            link.href = dataURL;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            exportStage.destroy();
            document.body.removeChild(tempContainer);
            
        } catch (fallbackError) {
            console.error('Fallback export failed:', fallbackError);
            alert('Download failed due to security restrictions. Please try using a web server instead of opening the file directly.');
        }
    }
}

// Clear canvas
function clearCanvas() {
    if (confirm('Are you sure you want to clear everything?')) {
        layer.destroyChildren();
        noseImages = [];
        backgroundImage = null;
        // Reset stage size to default
        stage.width(400);
        stage.height(300);
        // Reset canvas container size
        const canvasContainer = document.querySelector('.canvas-container');
        canvasContainer.style.width = '300px';
        canvasContainer.style.height = '200px';
        canvasContainer.style.maxWidth = 'none';
        canvasContainer.style.maxHeight = 'none';
        document.getElementById('dropZone').classList.remove('hidden');
        layer.draw();
    }
}

// Handle window resize
function handleResize() {
    if (stage) {
        const container = document.getElementById('konvaContainer');
        const containerWidth = container.offsetWidth;
        const containerHeight = Math.max(400, window.innerHeight - 200);
        
        stage.width(containerWidth);
        stage.height(containerHeight);
        stage.draw();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMemeMaker();
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize
});
