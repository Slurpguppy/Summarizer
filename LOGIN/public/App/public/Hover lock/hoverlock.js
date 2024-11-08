 // Select all buttons with the class 'locked-button'
 const buttons = document.querySelectorAll('.locked-button');

 // Attach click event listener to each button
 buttons.forEach(button => {
     button.addEventListener('click', function() {
         const link = this.getAttribute('data-link');
         window.location.href = link; // Redirect to the subscription page
     });
 });