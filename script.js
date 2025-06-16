// we take all the elements regarding the pick color btn
// the clear btn the list of colors and also the btn that exports the colors as files
const pickerBtn = document.getElementById("picker-btn");
const clearBtn = document.getElementById("clear-btn");
const colorList = document.querySelector(".all-colors");
const exportBtn = document.getElementById("export-btn");

// into a variable we will retrieve the colors from local storage using the key "colors-list"
// or if there are no variables of colors in the local storage we will put an empty array
let pickedColors = JSON.parse(localStorage.getItem("colors-list")) || [];

// a variable that we will keep track of the current color pop-up
let currentPopUp = null;

// we will define a function that is copying text to the clipboard of device
// an async function
const copyToClipboard = async (text, element) => {
    try {
        //Clipboard API is used to write text to the clipboard
        await navigator.clipboard.writeText(text);
        element.innerText = "Copied"; // provides user feedback by temporarily changing the element`s text to "Copied"
        // Reset element text after 1 second to its original value
        setTimeout(() => {
            element.innerText = text;
        }, 1000)
    } catch (error) {
        alert("Failed to copy the text");
    }
};

// Function to export colors into a text file
const exportColors = () => {
    const colorText = pickedColors.join("\n"); //Joining the elements of pickedColors array into a single string and then separating them by a new line`
    // Using Blob API to create a text file from the pickedColors array 
    const blob = new Blob([colorText], { type: "text/plain" });
    const url = URL.createObjectURL(blob); // creating a url object for the blob object so that it can be downloaded
    const a = document.createElement("a"); // creating the <a> element dynamically
    a.href = url; // setting the href of the <a> element to the url object 
    a.download = "Colors.txt"; // name of the file to be downloaded
    document.body.appendChild(a); // appending the <a> element to the HTML body
    a.click(); // programmatically clicking the tag element to trigger the download for the button
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Function to create the color pop-up of the selected colors
const createColorPopUp = (color) => {
    const popup = document.createElement("div"); // creatiung an HTML div element to hold the pop-up
    popup.classList.add("color-popup"); // adding a class to the element created above
    popup.innerHTML = `
        <div class="color-popup-content">
            <span class="close-popup"><i class="ri-close-circle-line"></i></span>
            <span class="close-popup-onclick"><i class="ri-close-circle-fill"></i></span>
            <div classs="color-info">
                <div class="color-preview" style="background-color: ${color};"></div>
                <div class="color-details">
                   <span class="label">Hex:</span>
                   <span class="value hex" data-color="${color}">${color}</span>
                </div>
                <div class="color-value">
                     <span class="label">RGB:</span>
                     <span class="value rgb" data-color="${color}">${hexToRgb(color)}</span>
                </div>
            </div>
        </div>
    </div>`;

    //Close button inside the pop-up
    const closePopUp = popup.querySelector(".close-popup"); // all the elements that have the class close-popup ti be removed from the DOM
    closePopUp.addEventListener("click", () => {
        setTimeout(() => {
            document.body.removeChild(popup);
            currentPopUp = null;
        }, 100);

    });

    const clickCloseBtn = popup.querySelector(".close-popup-onclick");
    const notClickedCloseBtn = popup.querySelector(".close-popup");


    notClickedCloseBtn.addEventListener("click", () => {
        clickCloseBtn.style.display = "block";
        notClickedCloseBtn.style.display = "none";
        console.log('it has been clicked');
    });

    // Event listener to copy color values to clipboard
    const colorValues = popup.querySelectorAll(".value");
    colorValues.forEach((value) => { // for each value of the color valuea that have the class "value" is added the event listener click and the text to be copied in the clipboard
        value.addEventListener('click', (e) => {
            const text = e.currentTarget.innerText;
            copyToClipboard(text, e.currentTarget);
        });
    });
    return popup;
};

// Function to display the picked colors
const showColors = () => {
    colorList.innerHTML = pickedColors.map((color) =>
        `
            <li class="color">
                <span class="rect" style="background: ${color}; border: 1px solid ${color === "#ffffff" ? "#ccc" : color}"></span>
                <span class="value hex" data-color="${color}">${color}</span>
            </li>
        `
    ).join("");

    const colorElements = document.querySelectorAll(".color");
    colorElements.forEach((li) => {
        const colorHex = li.querySelector(".value.hex");
        colorHex.addEventListener('click', (e) => {
            const color = e.currentTarget.dataset.color;
            if (currentPopUp) {
                document.body.removeChild(currentPopUp);
            }
            const popup = createColorPopUp(color);
            document.body.appendChild(popup);
            currentPopUp = popup;
        });
    });
    const pickedColorsContainer = document.querySelector(".colors-list");
    pickedColorsContainer.classList.toggle("hide", pickedColors.length === 0);
};

// Function to convert a hex color code to rgb format
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
};

// Function to activate the eye dropper color picker
const activateEyeDropper = async () => {
    document.body.style.display = "none";
    try {
        // Opening the eyeDropper and retrieving the selected color
        const { sRGBHex } = await new EyeDropper().open();

        if (!pickedColors.includes(sRGBHex)) {
            pickedColors.push(sRGBHex);
            localStorage.setItem("colors-list", JSON.stringify(pickedColors));
        }
        showColors();
    } catch (error) {
        alert("Failed to copy the color code!");
        console.log(error);
    } finally {
        document.body.style.display = "block";
    }
};

// Function to clear all picked colors
const clearAllColors = () => {
    // the array of the picked colors is set to an empty array
    pickedColors = [];
    // deleting the key that have all the colors in local storage
    localStorage.removeItem("colors-list");
    showColors();
};

// Event listeres for buttons 
clearBtn.addEventListener("click", clearAllColors);
pickerBtn.addEventListener("click", activateEyeDropper);
exportBtn.addEventListener("click", exportColors);

// Displaying the picked colors on document load
showColors();
