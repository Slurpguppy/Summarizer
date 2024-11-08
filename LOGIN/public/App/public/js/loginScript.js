document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });
            const data = await response.json();
            alert(data.message);
        });

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailOrUsername = document.getElementById('emailOrUsername').value;
            const password = document.getElementById('login-password').value;

            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername, password }),
            });
            const data = await response.json();

            if (data.token) {
                // Store the token in local storage
                localStorage.setItem('token', data.token);

                // Redirect to the members-only page (or the specific URL you want)
                fetch('public\index.html')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('content').innerHTML = data;
                    document.getElementById('content').style.display = 'block'; // Show about content
                }); // This will navigate to lego.com
            } else {
                // Display the error message if login fails
                alert(data.message);
            }
        });