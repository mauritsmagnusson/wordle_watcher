console.log("Wordle watcher active");
console.log("EXTENSION CONTEXT TEST:", typeof chrome, chrome?.runtime);

const TOTAL_GUESSES = 12972;

function getDateFromUrl(url) {
    const match = url.match(/(\d{4}-\d{2}-\d{2})\/?$/);
    return match ? match[1] : null;
}

function getHardMode() {
    const wordleKey = Object.keys(localStorage).find(k => k.startsWith('games-state-wordleV2/'));
    const stateRaw = wordleKey ? localStorage.getItem(wordleKey) : null;
    const state = stateRaw ? JSON.parse(stateRaw) : null;
    return state?.states?.[0]?.data?.hardMode ?? false;
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
    currHardMode = getHardMode()

    buffer = "";
    lastGuess = "";
    solved = false;
    remainingGuesses = TOTAL_GUESSES;
    render();

    console.log("RESETTING for date:", wordleDate, "hardMode:", currHardMode);

    chrome.runtime.sendMessage(
        { type: "reset", date: wordleDate, hardMode: currHardMode },
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
            { type: "guess", guess, date: wordleDate, hardMode: getHardMode() },
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

    const latestHardMode = getHardMode();
    if (latestHardMode !== currHardMode) {
        currHardMode = latestHardMode;
        console.log("HARD MODE CHANGED mid-game:", currHardMode);

        chrome.runtime.sendMessage(
            { type: "hardModeChange", date: wordleDate, hardMode: currHardMode },
            (response) => {
                console.log("HARD MODE CHANGE RESPONSE:", response);
                if (response?.remaining !== undefined) {
                    remainingGuesses = response.remaining;
                    render();
                }
            }
        );
    }
}, 750);