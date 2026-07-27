from flask import Flask, jsonify
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import engine
from datetime import date

app = Flask(__name__)

CORS(app, supports_credentials=True)

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

app.logger.disabled = True
logging.getLogger("flask").disabled = True
debug_mode = False

cands = engine.cands
hard_mode = None


def reset_candidates():
    global cands
    engine.new_game()
    cands = list(engine.cands)


@app.route("/reset", methods=["POST"])
def reset():
    global current_date
    global hard_mode
    data = request.get_json(silent=True) or {}
    date_ = data.get("date", date.today().isoformat())
    hard_mode = data.get("hardMode")
    hard_mode_status = "on" if hard_mode else "off"

    reset_candidates()
    current_date = date_

    print(
        f"Reset for date: {date_} -> {len(cands)} candidates. Hard mode {hard_mode_status}",
        flush=True,
    )
    return jsonify(ok=True, remaining=len(cands))


@app.route("/hardModeChange", methods=["POST"])
def checkHardMode():
    global hard_mode
    data = request.get_json(silent=True) or {}
    hard_mode = data.get("hardMode")
    hard_mode_status = "on" if hard_mode else "off"

    print(
        f"Hard mode is {hard_mode_status}",
        flush=True,
    )
    return jsonify(ok=True)


@app.route("/guess", methods=["POST"])
def guess():
    global cands
    try:
        data = request.get_json(force=True)
        guess = data.get("guess")
        date_ = data.get("date", date.today().isoformat())
        hard_mode = data.get("hardMode", True)

        answer = engine.get_answer(date_) if date_ else engine.get_answer()
        _, solved = engine.feedback(guess, answer, hard_mode)
        cands = engine.prune_words(cands)

        remaining = len(cands)
        print(f"Guess: {guess}\nPossible words remaining: {remaining}", flush=True)

        return jsonify(ok=True, remaining=remaining, solved=solved, hard_mode=hard_mode)
    except Exception as e:
        app.logger.exception("guess failed")
        return jsonify(ok=False, error=str(e)), 500


@app.get("/result")
def result():
    return jsonify(value=len(cands))


if __name__ == "__main__":
    port = 5050
    print(f"Server running on {port}", flush=True)
    app.run(
        host="127.0.0.1", port=port, debug=debug_mode, use_reloader=False, threaded=True
    )
