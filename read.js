let globalData = [];
let globalRatings = [];
let csvFileHandle = null;

function checkStars(starArray, i, cardIndex) {
    for (let j = 0; j < 5; ++j) {
        starArray[j].classList.remove("checked");
    }
    for (let j = 0; j <= i; ++j) {
        starArray[j].classList.add("checked");
    }
    
    if (cardIndex !== undefined) {
        globalRatings[cardIndex] = i + 1;
    }
}

function createCard(original, translated, rating, cardIndex, opt) {
    const card = document.createElement("div");
    const orgP = document.createElement("p");
    const transP = document.createElement("p");
    const cardNumber = document.createElement("p");
    const br = document.createElement("br");
    
    card.classList.add("card");

    cardNumber.textContent = cardIndex.toString();
    card.appendChild(cardNumber);
	
    if (opt === "learn") {
        orgP.textContent = original;
        let toggle = false;
        transP.textContent = "Click to see translation";
        transP.addEventListener(
            "click",
            () => {
            if(!toggle) {
                toggle = !toggle;
                transP.textContent = translated;
            } else {
                toggle = !toggle;
                transP.textContent = "Click to see translation";
            }
        });
        card.appendChild(orgP);
        card.appendChild(br);
        card.appendChild(transP);
    } else if (opt === "recall") {
        orgP.textContent = "Click to see translation";
        transP.textContent = translated;
        orgP.addEventListener("click", () => (orgP.textContent = original));
        card.appendChild(transP);
        card.appendChild(br);
        card.appendChild(orgP);
    }
    const stars = document.createElement("div");
    const starArray = [];
    for (let i = 0; i < 5; ++i) {
        let tempStar = document.createElement("span");
        tempStar.classList.add("fa");
        tempStar.classList.add("fa-star");
        tempStar.addEventListener("click", (e) => {
            checkStars(starArray, i, cardIndex);
        });
        
        starArray.push(tempStar);
    }
	
    for (let i = 0; i < 5; ++i) {
        if ((parseInt(rating, 10) - 1) === i) {
            checkStars(starArray, i, cardIndex);
        }
    }
	
    for (let i = 0; i < 5; ++i) {
        stars.appendChild(starArray[i]);
    }
    card.appendChild(stars);
    document.getElementById("cards").append(card);
}

const dropzone = document.getElementById("drop-zone");
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => e.preventDefault());
});
["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, () =>
        dropzone.classList.add("drag-over")
    );
});
["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, () =>
        dropzone.classList.remove("drag-over")
    );
});

dropzone.addEventListener("drop", async (e) => {
    e.preventDefault();	

    const item = e.dataTransfer.items[0];
    if (!item) return;
    const file = item.getAsFile();
	
    csvFileHandle = await item.getAsFileSystemHandle();
	
    if (file && file.name.endsWith(".csv")) {
        dropzone.classList.add("dropLoadedFile");
        const reader = new FileReader();
        reader.onload = function (event) {
            const csvText = event.target.result;
            globalData = csvText.split("\n").filter((row) => row.trim() !== "");
            globalRatings = []; 
            document.getElementById("cards").replaceChildren();
            
            for (let i = 1; i < globalData.length; ++i) {
                let cleanRow = globalData[i].slice(1, -1);
                let [original, translated, rating] = cleanRow.split("#,#");
                createCard(original, translated, rating, i, "learn");
                globalRatings[i] = parseInt(rating, 10) || 0; 
            }
        };
        reader.readAsText(file);
    } else {
        alert("Provide a csv file.");
    }
});

const saveButton = document.getElementById("saveButton");

saveButton.addEventListener("click", async (e) => {
    if (globalData.length === 0 || !csvFileHandle) {
        return alert("No files loaded.");
    }

    try {
        const options = { mode: 'readwrite' };
        if (await csvFileHandle.queryPermission(options) !== 'granted') {
            if (await csvFileHandle.requestPermission(options) !== 'granted') {
                alert('Permission denied, file not saved.');
                return;
            }
        }

        let newCsvContent = globalData[0] + "\n"; 
        
        for (let i = 1; i < globalData.length; ++i) {
            let cleanRow = globalData[i].slice(1, -1);
            let [original, translated, oldRating] = cleanRow.split('#,#');
            
            let currentRating = globalRatings[i]; 
            
            newCsvContent += `#${original}#,#${translated}#,#${currentRating}#\n`;
        }

        const writable = await csvFileHandle.createWritable();
        await writable.write(newCsvContent);
        await writable.close();

        alert("Save successful.");
    } catch (err) {
        console.error("Error:", err);
        alert("There was an error.");
    }
});

const learn = document.getElementById("learn");
const recall = document.getElementById("recall");

learn.addEventListener("click", () => {
    if (globalData.length === 0) return alert("Please upload a CSV file first.");
    
    document.getElementById("cards").replaceChildren();

    for (let i = 1; i < globalData.length; ++i) {
        let cleanRow = globalData[i].slice(1, -1);
        let [original, translated, oldRating] = cleanRow.split('#,#');
        let currentRating = globalRatings[i]; 
        createCard(original, translated, currentRating, i, "learn"); 
    }
});

recall.addEventListener("click", () => {
    if (globalData.length === 0) return alert("Please upload a CSV file first.");
    
    document.getElementById("cards").replaceChildren();

    for (let i = 1; i < globalData.length; ++i) {
        let cleanRow = globalData[i].slice(1, -1);
        let [original, translated, oldRating] = cleanRow.split('#,#');
        let currentRating = globalRatings[i]; 
        createCard(original, translated, currentRating, i, "recall"); 
    }
});
