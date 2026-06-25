import requests

url = "http://127.0.0.1:5050/guess"
guesses = ["trace", "power", "miser", "bluer", "under"]

while True:
    guess = input()
    payload = {"type": "guess", "guess": f"{guess}"}
    response = requests.post(url, json=payload)
