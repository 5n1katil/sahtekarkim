# Sahtekar (Spyfall-style) Game

## Manual Test Checklist

Use this checklist to verify game rules, multi-spy behavior, and race-safety after changes to `gameLogic.js`.

### Setup

- **N=6, I=2**: 6 players, 2 spies. Start game and confirm 2 spies and 4 innocents; one location/role for innocents.

### Win conditions

| # | Scenario | Expected |
|---|----------|----------|
| 1 | **Parity win (I ≥ C)** | When spies count ≥ innocents count (e.g. 2 spies, 2 innocents left), voting eliminates 1 innocent → spies win immediately. |
| 2 | **All spies eliminated** | Vote out both spies → innocents win. |
| 3 | **Correct guess** | During voting phase, any spy submits correct location/role → spies win immediately (status finished, winner spy). |
| 4 | **Wrong last guess** | Spy has 1 guess left, submits wrong answer → innocents win immediately (status finished, winner innocent). |
| 5 | **Wrong guess, guesses left** | Spy guesses wrong but has remaining guesses → only that spy’s `guessesLeft` decrements; game continues; no spy names revealed. |

### Race and idempotency

| # | Scenario | Expected |
|---|----------|----------|
| 6 | **Simultaneous guesses** | Two spies submit guesses at the same time: only one commit wins (transaction); no double win, no double decrement of guesses. |
| 7 | **Double finalize voting** | `finalizeVoting` called twice (e.g. timer + “all voted”): first run applies; second run sees `voting.status !== "in_progress"` or `room.status === "finished"` and no-ops. No duplicate gameOver. |
| 8 | **Guess after game finished** | Spy submits guess after room is already `status: "finished"`: transaction no-ops, no state change. |

### Notifications and leaks

| # | Scenario | Expected |
|---|----------|----------|
| 9 | **Mid-game elimination** | One player eliminated, game continues: public message must NOT reveal spy list; `revealSpies` false; no `remainingSpies` / spy names in result. |
| 10 | **Game end (vote or guess)** | When game ends: spy names may be shown; `gameOver` and final messages may include spy list. |

### Quick reference: authoritative end conditions

- **A** Any spy correctly guesses location/role → spies win (status finished, winner spy).
- **B** Spy guesses wrong: decrement that spy’s `guessesLeft`; if it becomes 0 → innocents win; else continue (no spy reveal).
- **C** All spies eliminated by voting → innocents win.
- **D** At any moment, if spy count ≥ innocent count → spies win (parity rule).

Guessing is allowed only when `game.phase === "voting"` or `room.phase === "voting"`.
