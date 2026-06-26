console.log("Wordle watcher active");
console.log("EXTENSION CONTEXT TEST:", typeof chrome, chrome?.runtime);

let buffer = "";
let lastGuess = "";
let solved = false;
let remainingGuesses = 12972;

function render() {
    const pct = Math.round((remainingGuesses / 12972) * 100)
    if (remainingGuesses === 12972) {
        box.innerText = `Possible guesses: ${remainingGuesses} (100%)`;
    } if (solved) {
        box.innerText = "Good job!🎉"
    }
    else if (pct < 1) {
        box.innerText = `Remaining valid guesses: ${remainingGuesses} (< 1%)`;
    } else {
        box.innerText = `Remaining valid guesses: ${remainingGuesses} (${pct}%)`;
    }
}

function getDateFromUrl(url) {
    const match = url.match(/(\d{4}-\d{2}-\d{2})\/?$/);
    return match ? match[1] : null;
}

const wordleDate = getDateFromUrl(location.href);

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
        //render();

        console.log("SENDING GUESS", guess)

        chrome.runtime.sendMessage(
            {
                type: "guess", guess,
                date: wordleDate
            },
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
box.style.top = "20px";
box.style.right = "20px";
box.style.zIndex = "999999";
box.style.padding = "10px";
box.style.background = "black";
box.style.color = "white";
box.style.fontFamily = "monospace";
box.style.fontSize = "14px";
box.style.borderRadius = "8px";

box.innerText = "Remaining valid guesses: 12972 (100%)";

document.body.appendChild(box);

chrome.runtime.sendMessage({
    type: "guess",
    guess: guess
}, (response) => {
    console.log("BG RESPONSE:", response);

    if (response?.data) {
        box.innerText = `Remaining guesses: ${response.data}`;
    }
});