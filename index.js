<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Summarizer</title>
  <link rel="icon" href="imgs/newspaper-regular.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
  
  <style>



    body {
      font-family: Ubuntu, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
      padding: 0;
    }

    .header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  background: #343434;
  border-bottom: 1px solid #585858;
  margin-bottom: 10px;
  position: relative;
}

.header-dark {
  background: #fff;
  border-bottom: 1px solid #ddd;
  color: #4f4f4f;
}


    .logo {
      width: 90%;
      top: 5px;
      
      position: fixed;
      left: 50px;
    }

    .theme-tog{
      padding: 10px;
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      position: fixed;
      top: 30px;
      right: 50px;
      background-image: url('imgs/sun-regular.svg');
      background-repeat: no-repeat;
      background-color: #ffffff;
    }

    .about {
      position: absolute;
    top: 40px; /* Move down 50% of the viewport height */
    left: 50%; /* Move right 50% of the viewport width */
    transform: translate(-50%, -50%); /* Shift back by 50% of the element's size to perfectly center it */
    font-size: large;
    color: #fff;
    text-align: center;
}


    .chat-container {
      width: 90%;
      max-width: 600px;
      margin: auto;
      background-color: #343434;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .chat-log {
      
      overflow-y: auto;
      padding: 20px;
      border-bottom: 1px solid #ddd;
      height: 75vh;
    }
    .link-text {
    font-weight: bold; /* Optional: make it bold */
    color: #000000; /* Optional: change the text color */
    }
    .ai-text{
    font-weight: bold; /* Optional: make it bold */
    color: #007BFF; /* Optional: change the text color */
    }
    .message {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 10px;
      position: relative;
    }
    .user-message {
      background-color: #ececec;
      color: #333;
      align-self: flex-end;
    }
    .ai-message {
      background-color: #ffffff;
      color: #333;
      font-size: larger;
      align-self: flex-start;
    }
    .input-container {
      display: flex;
      padding: 10px;
      background-color: #4f4f4f;
      padding: 10px;
    }
    .input-container-dark {
  background: #f0f0f0;
  border-bottom: 1px solid #ddd;
  color: #4f4f4f;
}
    #user-input:hover {
      background-color: #eeeeee;
    }
    .user-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-right: 10px;
      font-size: 16px;
      background-color: #4f4f4f;
    }

    .user-input-dark {
      background: #fff;
    }


    .send-btn {
      padding: 10px 15px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #0056b3;
    }
    
    .footer {
    background-color: #f9f9f9;
    color: black; /* Change color to black for better visibility */
    text-align: left; /* Align text to the left */
    padding: 8px 5px 10px 10px;
    margin: 0; /* Remove any default margin */
    font-size: small;
}
    
    /* dark mode */
    .chat-dark-mode {
      background-color: #fff;
    }
    .text-dark-mode {
      color: #4f4f4f;
    }
    .dark-mode {
    background-color: rgb(32, 32, 32);
    color: white;
    }
  </style>
</head>
<body>
  <div class="header header-dark" id="header">
  <div class="logo">
  <object type="image/svg+xml" data="imgs/newspaper-regular.svg" width="70" height="70">
    Your browser does not support SVG
  </object>
  
  <button class="theme-tog" onclick="myFunction()" width="20" height="20">
 </button>
  </div>
</div>
<div class="chat-container chat-dark-mode">
  <div class="chat-log" id="chat-log"></div>
  <div class="input-container input-container-dark" id="input-container">
    <input type="text" class="user-input user-input-dark" id="user-input" placeholder="Enter URL..." />
    <button class="send-btn" onclick="sendMessage()">Summarize</button>
  </div>
  <div class="footer">Created by <span style="color: #216d21;">Will Ratkowski</span>, powered by Groq AI.</div>
</div>
  <div class="about text-dark-mode"></i>AI-powered article and text <span style="color: #007BFF;">summarizer</span></div>
  <script>
    async function sendMessage() {
      const input = document.getElementById("user-input");
      const message = input.value;
      if (!message) return;

      const chatLog = document.getElementById("chat-log");

      chatLog.innerHTML = '';

      // Add user's message to chat log
      chatLog.innerHTML += `<div class="message user-message"><span class="link-text">Your link</span>: ${message}</div>`;
      input.value = "";
      chatLog.scrollTop = chatLog.scrollHeight; // Scroll to bottom

      // Send message to backend
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });
        const data = await response.json();

        // Add AI's response to chat log
        chatLog.innerHTML += `<div class="message ai-message"><span class="ai-text">Summarized</span>: ${data.response}</div>`;
        chatLog.scrollTop = chatLog.scrollHeight; // Scroll to bottom
      } catch (error) {
        console.error("Error:", error);
        chatLog.innerHTML += `<div class="message ai-message">Error: Could not get a response</div>`;
        chatLog.scrollTop = chatLog.scrollHeight; // Scroll to bottom
      }
    }
// theme toggle
function myFunction() {
    var bodyElement = document.body;
    var chatContainer = document.querySelector('.chat-container');
    const about = document.querySelector(".about");
    const header = document.getElementById("header");
    const inputContainer = document.getElementById("input-container");
    const userInput = document.getElementById("user-input");

    // Toggle dark mode class on body
    bodyElement.classList.toggle("dark-mode");
    header.classList.toggle("header-dark");
    
    // Toggle chat dark mode class on chat container
    chatContainer.classList.toggle("chat-dark-mode");
    inputContainer.classList.toggle("input-container-dark");
    userInput.classList.toggle("user-input-dark")

    about.classList.toggle("text-dark-mode");
  }


  </script>
</body>
</html>
