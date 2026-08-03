import requests
from datetime import date
from pathlib import Path
from collections import defaultdict

WORDS = []
with open(f"{Path().cwd()}/words.txt") as f:
    for line in f:
        WORDS.append(line.strip())

cands = set(WORDS)
alpha = {chr(i): "W" for i in range(ord("a"), ord("z") + 1)}
today = date.today().isoformat()
guesses_made = {}
hard_mode = True


def new_game():
    global cands, greens, yellows, blacks, guesses_made
    cands = set(WORDS)
    greens = {}
    yellows = {}
    blacks = set()
    guesses_made = {}


def get_answer(date=today):
    try:
        response = requests.get(f"https://www.nytimes.com/svc/wordle/v2/{date}.json")
        if response.status_code == 200:
            # print(f"Answer: {response.json()['solution']}")
            return response.json()["solution"]
        else:
            print(f"status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred when fetching answer:\n {e}")


def findOccurrences(s, c):
    return [i for i, l in enumerate(s) if l == c]


greens = {}
yellows = {}
blacks = set()


def feedback(guess, answer, hard_mode):

    global guesses_made
    guess, answer = guess.lower(), answer.lower()
    if guess not in WORDS:
        return None, None

    if hard_mode and not is_valid_hard_mode_guess(guess):
        return None, None

    feedback = [""] * 5

    for i, c in enumerate(guess):
        if c not in answer:
            feedback[i] = "B"
            blacks.add(c)
            continue

        occs = findOccurrences(answer, c)

        if i in occs:
            greens[i] = c
            feedback[i] = "G"

        elif c in greens.values() and len(occs) < 2:
            feedback[i] = "B"
            blacks.add(c)
        else:
            yellows[i] = c
            feedback[i] = "Y"
    print(feedback)
    solved = all(r == "G" for r in feedback)
    guesses_made[guess] = feedback
    return feedback, solved


def prune_words(cands):

    prune = set()
    for cand in cands:
        p = cand in WORDS[:10]

        for i, gc in greens.items():
            if cand[i] != gc:
                prune.add(cand)
                break

        for i, yc in yellows.items():
            if yc not in cand:
                prune.add(cand)
                break
            if cand[i] == yc:
                prune.add(cand)
                break

        for i, c in enumerate(cand):
            if c in blacks:
                is_duplicate = (c in greens.values()) or c in yellows.values()
                if not is_duplicate:
                    prune.add(cand)
                    break

    cands = [c for c in cands if c not in prune]
    return cands


def is_valid_hard_mode_guess(guess):
    global guesses_made

    if not guesses_made:
        return True
    for w, f in guesses_made.items():
        for i, col in enumerate(f):
            letter = w[i]
            if col != "B" and w[i] not in guess:
                return False
            elif col == "G" and findOccurrences(w, letter) != findOccurrences(
                guess, letter
            ):
                return False
    return True
