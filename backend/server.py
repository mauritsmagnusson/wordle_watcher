from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import engine

app = Flask(__name__)

CORS(app, supports_credentials=True)

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

app.logger.disabled = True
logging.getLogger("flask").disabled = True

answer = engine.get_answer("2026-06-20")
# answer = engine.get_answer()
cands = engine.cands
greens = engine.greens
yellows = engine.yellows
blacks = engine.blacks


@app.route("/guess", methods=["POST", "OPTIONS"])
def guess():

    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return response

    global cands
    global greens
    global yellows
    global blacks
    data = request.json
    guess = data["guess"]
    engine.feedback(guess, answer)
    cands = engine.prune_words(cands)

    print(f"Guess: {guess}\nPossible words remaining: {len(cands)}", flush=True)

    response = jsonify(ok=True)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


port = 5050

if __name__ == "__main__":
    print(f"Server running on {port}", flush=True)
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
