console.log("Wordle watcher active");
console.log("EXTENSION CONTEXT TEST:", typeof chrome, chrome?.runtime);

let buffer = "";

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

        console.log("FINAL GUESS:", guess);

        console.log("CHROME OBJECT:", window.chrome);

        if (!window.chrome?.runtime?.sendMessage) {
            console.error("chrome.runtime is missing");
        } else {
            window.chrome.runtime.sendMessage({
                type: "guess",
                guess: guess
            }, (response) => {
                console.log("BG RESPONSE:", response);
            });
        }
    }
});