// Countdown Timer Script for MASNAD HOLDING

// Set the target launch date (March 1, 2026)
const targetDate = new Date('2026-03-15T00:00:00').getTime();

// Get DOM elements
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');

// Function to pad numbers with leading zero
function padNumber(num) {
    return num.toString().padStart(2, '0');
}

// Function to calculate and update the countdown
function updateCountdown() {
    // Get current time
    const now = new Date().getTime();
    
    // Calculate the difference
    const difference = targetDate - now;
    
    // If the countdown is finished
    if (difference <= 0) {
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        return;
    }
    
    // Calculate time units
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Update the DOM with padded values
    daysElement.textContent = padNumber(days);
    hoursElement.textContent = padNumber(hours);
    minutesElement.textContent = padNumber(minutes);
    secondsElement.textContent = padNumber(seconds);
}

// Initial call to display countdown immediately
updateCountdown();

// Update countdown every second
setInterval(updateCountdown, 1000);

// Smooth scroll for any future internal links (optional)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Log page load
console.log('MASNAD HOLDING - Coming Soon Page Loaded');
console.log('Launch Date: March 15th, 2026');
