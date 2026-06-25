greens = {}
yellows = {}
blacks = set()


def feedback(guess, answer):
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
    print(feedback)


def findOccurrences(s, c):
    return [i for i, l in enumerate(s) if l == c]


def prune_words(cands):

    ccands = cands.copy()
    for cand in ccands:
        for i, c in enumerate(cand):
            if c in blacks or (c in yellows and yellows[i] == c):
                cands.remove(c)
                break


answer = "robin"

while True:
    guess = input()
    feedback(guess, answer)
    print(f"Greens: {greens}, yellows: {yellows}, blacks: {blacks}")
