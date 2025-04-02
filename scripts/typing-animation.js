document.addEventListener('DOMContentLoaded', function() {
    // Simple typing animation
    const typingElement = document.getElementById('typing-text');
    const text = "Feel the breeze...";
    let index = 0;
    let direction = 'typing'; // 'typing' or 'erasing'
    
    function updateText() {
        if (direction === 'typing') {
            // Add one character
            typingElement.textContent = text.substring(0, index);
            index++;
            
            if (index > text.length) {
                // Wait before starting to erase
                direction = 'waiting';
                setTimeout(() => {
                    direction = 'erasing';
                    updateText();
                }, 2000);
                return;
            }
        } else if (direction === 'erasing') {
            // Remove one character
            index--;
            typingElement.textContent = text.substring(0, index);
            
            if (index === 0) {
                // Wait before typing again
                direction = 'waiting';
                setTimeout(() => {
                    direction = 'typing';
                    updateText();
                }, 500);
                return;
            }
        } else {
            // We're in waiting state, function will be called by setTimeout
            return;
        }
        
        // Schedule next update
        const speed = direction === 'typing' ? 150 : 50;
        setTimeout(updateText, speed);
    }
    
    // Start the animation
    if (typingElement) {
        updateText();
    }
});