console.log("BACKGROUND SCRIPT LOADED");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    console.log("BACKGROUND GOT:", msg);

    fetch("http://127.0.0.1:5050/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg)
    })
        .then(r => r.text())
        .then(t => {
            console.log("PYTHON RESPONSE:", t);
            sendResponse({ ok: true });
        })
        .catch(err => {
            console.error("FETCH FAILED:", err);
            sendResponse({ ok: false });
        });

    return true;
});