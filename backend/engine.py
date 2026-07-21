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


def new_game():
    global cands, greens, yellows, blacks
    cands = set(WORDS)
    greens = {}
    yellows = {}
    blacks = set()


def get_answer(date=today):
    try:
        response = requests.get(f"https://www.nytimes.com/svc/wordle/v2/{date}.json")
        if response.status_code == 200:
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


def feedback(guess, answer):

    if guess not in WORDS:
        print("Invalid guess")
        return

    guess, answer = guess.lower(), answer.lower()
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
    # print(feedback)
    solved = all(r == "G" for r in feedback)
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
