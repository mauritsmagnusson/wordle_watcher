console.log("BACKGROUND SCRIPT LOADED");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "guess") return;

    fetch("http://127.0.0.1:5050/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            guess: msg.guess,
            date: msg.date
        })
    })
        .then((r) => r.json())
        .then((data) => {
            sendResponse({ ok: true, remaining: data.remaining, solved: data.solved });
        })
        .catch((err) => {
            sendResponse({ ok: false, error: String(err) });
        });

    return true;
});