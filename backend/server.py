from flask import Flask, jsonify
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

answer = engine.get_answer("2026-06-05")
# answer = engine.get_answer()

cands = engine.cands


@app.route("/guess", methods=["POST"])
def guess():
    global cands
    try:
        data = request.get_json(force=True)
        guess = data["guess"]

        engine.feedback(guess, answer)
        cands = engine.prune_words(cands)

        remaining = len(cands)
        print(f"Guess: {guess}\nPossible words remaining: {remaining}", flush=True)

        return jsonify(ok=True, remaining=remaining)
    except Exception as e:
        app.logger.exception("guess failed")
        return jsonify(ok=False, error=str(e)), 500


@app.get("/result")
def result():
    return jsonify(value=len(cands))


if __name__ == "__main__":
    port = 5050
    print(f"Server running on {port}", flush=True)
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False, threaded=True)
