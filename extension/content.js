console.log("Wordle watcher active");
console.log("EXTENSION CONTEXT TEST:", typeof chrome, chrome?.runtime);

const TOTAL_GUESSES = 12972;

function getDateFromUrl(url) {
    const match = url.match(/(\d{4}-\d{2}-\d{2})\/?$/);
    return match ? match[1] : null;
}

let buffer = "";
let lastGuess = "";
let solved = false;
let remainingGuesses = TOTAL_GUESSES;
let currentUrl = location.href;
let wordleDate = getDateFromUrl(currentUrl);

function render() {
    const pct = Math.round((remainingGuesses / TOTAL_GUESSES) * 100);

    if (solved) {
        box.innerText = "Good job!🎉";
    } else if (remainingGuesses === TOTAL_GUESSES) {
        box.innerText = `Possible guesses: ${remainingGuesses} (100%)`;
    } else if (pct < 1) {
        box.innerText = `Remaining valid guesses: ${remainingGuesses} (< 1%)`;
    } else {
        box.innerText = `Remaining valid guesses: ${remainingGuesses} (${pct}%)`;
    }
}

function resetState() {
    buffer = "";
    lastGuess = "";
    solved = false;
    remainingGuesses = TOTAL_GUESSES;
    render();

    console.log("RESETTING for date:", wordleDate);

    chrome.runtime.sendMessage(
        { type: "reset", date: wordleDate },
        (response) => {
            console.log("RESET RESPONSE:", response);
            if (response?.remaining !== undefined) {
                remainingGuesses = response.remaining;
                solved = false;
                render();
            }
        }
    );
}

document.addEventListener("keydown", (e) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
        if (buffer.length < 5) buffer += e.key.toUpperCase();
    }

    if (e.key === "Backspace") {
        buffer = buffer.slice(0, -1);
    }

    if (e.key === "Enter") {
        const guess = buffer;
        buffer = "";

        if (guess.length !== 5) return;

        lastGuess = guess;

        console.log("SENDING GUESS", guess);

        chrome.runtime.sendMessage(
            { type: "guess", guess, date: wordleDate },
            (response) => {
                console.log("CALLBACK RESPONSE:", response);
                if (response?.remaining !== undefined) {
                    remainingGuesses = response.remaining;
                    solved = response.solved;
                    render();
                }
            }
        );
    }
});

const box = document.createElement("div");

box.style.position = "fixed";
box.style.top = "120px";
box.style.right = "20px";
box.style.zIndex = "999999";
box.style.padding = "10px";
box.style.background = "#121213";
box.style.color = "white";
box.style.fontFamily = "monospace";
box.style.fontSize = "14px";
box.style.borderRadius = "8px";

box.innerText = `Remaining valid guesses: ${TOTAL_GUESSES} (100%)`;

document.body.appendChild(box);


resetState();

setInterval(() => {
    if (location.href !== currentUrl) {
        currentUrl = location.href;
        wordleDate = getDateFromUrl(currentUrl);
        resetState();
    }
}, 750);