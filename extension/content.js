console.log("Wordle watcher active");
console.log("EXTENSION CONTEXT TEST:", typeof chrome, chrome?.runtime);

let buffer = "";
let lastGuess = "";
let remainingGuesses = null;

function render() {
    box.innerText = `Current guess: ${lastGuess || "-"}\nRemaining guesses: ${remainingGuesses ?? "-"}`;
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
        //render();

        console.log("SENDING GUESS", guess)

        chrome.runtime.sendMessage(
            { type: "guess", guess },
            (response) => {
                console.log("CALLBACK RESPONSE:", response);
                if (response?.remaining !== undefined) {
                    remainingGuesses = response.remaining;
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

box.innerText = "Wordle stats loading...";

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