console.log("BACKGROUND SCRIPT LOADED");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "guess") return;

    fetch("http://127.0.0.1:5050/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: msg.guess })
    })
        .then(async (r) => {
            const text = await r.text();
            console.log("RAW FLASK RESPONSE:", text);
            return JSON.parse(text);
        })
        .then((data) => {
            sendResponse({ ok: true, remaining: data.remaining });
        })
        .catch((err) => {
            console.error("FETCH FAILED:", err);
            sendResponse({ ok: false, error: String(err) });
        });

    return true;
});