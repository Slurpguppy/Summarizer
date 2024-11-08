 // Function to load logs from localStorage and display them
 function loadLogs(sortMethod = 'default') {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logList = document.getElementById("logList");
    logList.innerHTML = ''; // Clear existing log list

    // Sort logs based on the selected sort method
    if (sortMethod === 'alphabetical') {
        logs.sort((a, b) => a.localeCompare(b));
    } else if (sortMethod === 'chronological' || sortMethod === 'default') {
        logs.reverse();  // Show the newest logs at the top
    }

    logs.forEach(log => {
        const logItem = document.createElement("li");
        logItem.textContent = log;
        logList.appendChild(logItem);
    });
}

// Load logs on page load
window.onload = function() {
    loadLogs();

    // Add event listener for sorting
    document.getElementById("sortOptions").addEventListener("change", function() {
        loadLogs(this.value);
    });
};

document.getElementById("copyButton").addEventListener("click", function() {
    // Get the text to copy from the div
    const textToRead = document.getElementById("textToRead").innerText;

    // Copy the text to the clipboard
    navigator.clipboard.writeText(textToRead).then(() => {
        // Retrieve existing logs or create a new array
        const logs = JSON.parse(localStorage.getItem('logs')) || [];
        
        // Add the new log to the array and save it back to localStorage
        logs.push(textToRead);
        localStorage.setItem('logs', JSON.stringify(logs));

        // Load the updated logs
        loadLogs();

        // Optionally, alert the user that the text has been copied
        alert("Text copied to clipboard and saved to logs!");
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
});

document.getElementById("clearLogsButton").addEventListener("click", function() {
    // Clear logs from localStorage and update the log display
    localStorage.removeItem('logs');
    loadLogs();
    alert("Logs cleared!");
});