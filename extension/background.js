console.log("BACKGROUND SCRIPT LOADED");
const SERVER = "http://127.0.0.1:5050";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "guess") {
        fetch(`${SERVER}/guess`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                guess: msg.guess,
                date: msg.date,
                hardMode: msg.hardMode
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
    }

    else if (msg.type === "reset") {
        fetch(`${SERVER}/reset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: msg.date,
                hardMode: msg.hardMode
            })
        })
            .then((r) => r.json())
            .then((data) => {
                sendResponse({ ok: true, remaining: data.remaining });
            })
            .catch((err) => {
                sendResponse({ ok: false, error: String(err) });
            });

        return true;
    }

    else if (msg.type === "hardModeChange") {
        fetch(`${SERVER}/hardModeChange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: msg.date,
                hardMode: msg.hardMode
            })
        })
            .then((r) => r.json())
            .catch((err) => {
                sendResponse({ ok: false, error: String(err) });
            });

        return true;
    }
});