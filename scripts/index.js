const textElements = [
  "Velo Rapido",
  "Feel the breeze, ride with ease!",
  "Pedal your way to adventure!",
  "Unleash the thrill of the open road!",
  "Discover the joy of cycling!",
  "Elevate your journey with Velo Rapido!"
];

const textElement = document.getElementById('text');
const cursorElement = document.getElementById('cursor');

let textIndex = 0;
let charIndex = 0;
let isErasing = false;

function typeText() {
  const currentText = textElements[textIndex];
  
  if (textIndex === 0) {
      textElement.innerHTML = `<span class="gradient-text">${currentText.substring(0, charIndex)}</span>`;
  } else {
      textElement.innerHTML = currentText.substring(0, charIndex);
  }

  if (charIndex <= currentText.length && !isErasing) {
      charIndex++;
  } else if (charIndex >= 0 && isErasing) {
      charIndex--;
  } else {
      isErasing = !isErasing;
      textIndex = (textIndex + (isErasing ? 0 : 1)) % textElements.length;
  }

  cursorElement.style.display = isErasing ? 'none' : 'inline';

  let typingSpeed = isErasing ? 60 : 100;
  setTimeout(typeText, typingSpeed);
}

typeText();

// Completely rewrite the typing animation code
document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing code that might be conflicting
    const typingText = document.getElementById('typing-text');
    const text = "Feel the breeze...";
    
    if (typingText) {
        // Clear any existing content
        typingText.innerHTML = '';
        
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                typingText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 150);
            } else {
                // Wait and then erase
                setTimeout(eraseText, 2000);
            }
        }
        
        function eraseText() {
            if (typingText.textContent.length > 0) {
                typingText.textContent = typingText.textContent.substring(0, typingText.textContent.length - 1);
                setTimeout(eraseText, 50);
            } else {
                // Reset and start again
                i = 0;
                setTimeout(typeWriter, 500);
            }
        }
        
        // Start the typing animation
        typeWriter();
    }
    
    // Show the vehicle with animation
    const scooter = document.getElementById('scoot');
    if (scooter) {
        setTimeout(() => {
            scooter.style.opacity = '1';
        }, 500);
    }
});
