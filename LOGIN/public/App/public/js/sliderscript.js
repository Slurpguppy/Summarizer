const slider = document.getElementById("mySlider");
const sliderValue = document.getElementById("sliderValue");
const sliderPosition = document.getElementById("sliderPosition");

const settings = ["Short", "Medium", "Long"];
const positions = ["20 and 50", "100 and 150", "175 and 225"];

slider.addEventListener("input", function() {
    sliderValue.textContent = settings[slider.value - 1];
    sliderPosition.textContent = positions[slider.value - 1];  // Update slider position with words
});

// Initialize the display with the default value
sliderValue.textContent = settings[slider.value - 1];
sliderPosition.textContent = positions[slider.value - 1];  // Initialize slider position with words