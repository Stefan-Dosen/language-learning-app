function parseSentences(sentences)
{
	if (!sentences) return [];
	let n = sentences.length;
	let sentencesArray = new Array();
	let sentenceBeginning = 0;
	let tempSentence = "";
	
	let error = 1;
	if(n===0){return error};
	
	for(let i=0; i<=n; ++i)
	{
			if(sentences[i] === '\n' || i=== n)
			{
				tempSentence = sentences.slice(sentenceBeginning, i);
				sentenceBeginning = i +1;
				sentencesArray.push(tempSentence);
			}
	}
	return sentencesArray;
}

async function translateSentences(sentences, source, target)
{
	// try better api
	const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentences)}&langpair=${source}|${target}`;
	
	const res = await fetch(url);
	const data = await res.json();
	
	if (data.responseData && data.responseData.translatedText) {
		return data.responseData.translatedText;
	}
	return "";
}

function makeCSV(original, translated, source, target, filename = "langModule.csv", )
{
	 let rows = [];
	 rows.push(`#${source}#,#${target},#rating#`);
	for(let i=0; i<original.length; ++i)
	{
		let row = `#${translated[i]}#,#${original[i]}#,#0#`;
        rows.push(row);
	}
	let combined = rows.join("\n");
	
	let blob = new Blob(["\uFEFF" + combined], { type: "text/csv;charset=utf-8;" });
	
	let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
   
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function startTranslate()
{
	let sentences = document.getElementById("sentences").value;
	let translatedTemp = "";
	
	let originalSentences = new Array();
	let translatedSentences = new Array();
	
	let source = document.getElementById("source").value;
	let target = document.getElementById("target").value;
	
	
	if(sentences === "" || sentences === "Type your sentences here, seperate them by a new line.") alert("No sentences provided!");
	
	else{
		
			originalSentences = parseSentences(sentences);
			for(let i = 0; i < originalSentences.length; ++i)
			{
				translatedTemp = await translateSentences(originalSentences[i], source, target);
				translatedSentences.push(translatedTemp);
			}
			
			makeCSV(originalSentences, translatedSentences, source, target);
	}
	
	// add sentence count
	
}
document.addEventListener("DOMContentLoaded", () => {
    const sourceSelect = document.getElementById("source");
    const targetSelect = document.getElementById("target");

    function preventDuplicateSelection(changedSelect, otherSelect) {
        const selectedValue = changedSelect.value;

        for (let option of otherSelect.options) {
            if (option.value === selectedValue) {
                option.disabled = true; 

                if (otherSelect.value === selectedValue) {
                    for (let altOption of otherSelect.options) {
                        if (altOption.value !== selectedValue) {
                            otherSelect.value = altOption.value;
                            break;
                        }
                    }
                }
            } else {
                option.disabled = false;
            }
        }
    }

    sourceSelect.addEventListener("change", () => preventDuplicateSelection(sourceSelect, targetSelect));
    targetSelect.addEventListener("change", () => preventDuplicateSelection(targetSelect, sourceSelect));

    preventDuplicateSelection(sourceSelect, targetSelect);
});