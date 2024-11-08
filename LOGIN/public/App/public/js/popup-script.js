document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailOrUsername = document.getElementById('emailOrUsername').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = await response.json();

    if (data.token) {
        // Store the token in local storage
        localStorage.setItem('token', data.token);

        // Hide the login form and main content
        document.getElementById('mainContent').classList.add('hidden');

        // Close the popup and overlay
        document.getElementById('popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    } else {
        // Display the error message if login fails
        alert(data.message);
    }
});

// Function to show the popup and overlay
function showPopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}


// Show the popup on page load
window.onload = function() {
    showPopup();
};