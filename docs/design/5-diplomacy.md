# Astralis — Diplomacy and the Concord (detail)

Part of the design plan ([design.md](../design.md) §6.4, §12, §15). Draft, planning only.

## 1. Contact

Diplomacy needs a **tanglelink exchange** (design.md §6.4). Contact is made at the end of a turn when:

- any ship of yours (probes included) is in a system with a ship or colony of theirs, **or**
- one of your colonies is within **6 ly** of one of theirs, **or**
- a third empire **introduces** you (a treaty item, §4).

**First meeting is peaceful:** two empires without contact never fight on the turn they meet; they
exchange links and start at **Neutral** (Q40). Before contact you see only what telescopes and
probes show.

## 2. Relation states

| State | Combat when fleets meet | Notes |
|-------|-------------------------|-------|
| **War** | yes | |
| **Ceasefire** | no | lasts 4 turns, then becomes Neutral automatically |
| **Neutral** | no | the default after contact |
| **Non-Aggression Pact** | no | declaring war needs cancelling first (2 turns' notice); without notice it is a **treaty breach** |
| **Defensive Alliance** | no | each side joins if the other is *attacked* |
| **Alliance** | no | shared vision, shared supply range, joint wars, allies count as one side in battles |

Battles happen only between empires at war (and with Custodians or the Approach). Declaring war
from Neutral is legal but costs −5 attitude with everyone who knows you.

## 3. Attitude (−100 … +100)

Every AI empire has an attitude towards every contact. The diplomacy screen always lists the
**reasons** with their values, so behaviour is never a mystery.

| Reason | Value |
|--------|-------|
| Your species' Diplomacy aptitude | −15 / +15 / +30 |
| Habitat overlap (they want the same worlds as you) | 0 to −20 |
| Border tension | −5 per pair of colonies within 5 ly (max −25) |
| Government | same +10, opposed −10, Unified −5 (governments doc §4) |
| Treaties | NAP +5, trade +10, research +10, alliance +20 |
| Shared enemy | +15 |
| Gifts | +1 per 10 credits (fades over 10 turns) |
| Treaty breach against them | −30 (fades 1 per turn) |
| Caught spying | −15 (fades) |
| Bombardment (of anyone / of them) | −5 / −20 |
| Relativistic impactor used (anyone) | −100 with everyone |
| At war with them | −50 while the war lasts |
| Concord vote (for them / against them) | +10 / −5 |
| Personality and "chemistry" | fixed ±10 per pair, set at game start |

**Habitat overlap** is computed from the two species' environment profiles: how many of the
region's worlds both rate Good or better. Complementary species (warm vs. cold, land vs. aquatic)
have almost none.

## 4. Agreements and exchanges

| Item | Effect |
|------|--------|
| **Trade treaty** | each side gets credits = 15% of the *smaller* partner's commerce output, ramping up over 5 turns; plus foreign system links (design.md §7.8, D35) |
| **Research treaty** | each side gets research = 10% of the smaller partner's research, ramping over 5 turns |
| **Map sharing** | one-off or continuous exchange of what each side knows |
| **Introduction** | gives the other side contact with a third empire you know |
| **Tech exchange** | one-off; the AI values techs by cost and usefulness |
| **Credits** | one-off or per turn |
| **Colony or system transfer** | rare; AI accepts only for very high value or under pressure |
| **Tribute** | credits per turn, demanded or offered |
| **Demand** | "give X or else". Refusal can lead to war; the AI evaluates its strength |
| **Peace terms** | ceasefire, peace with exchanges, or surrender of colonies |

Trade and research treaties are **cancelled automatically** by war.

## 5. Reputation

One value per empire, 0–100, starting at 50, seen by everyone.

- Treaty breach −20. Using a relativistic impactor −50.
- Keeping treaties for a long time +1 per 10 turns (max 80 that way).
- Reputation scales how readily *every* AI accepts proposals. Liars find it hard to get treaties
  later.

## 6. Proposals (UX and AI)

- **Proposal screen:** two columns ("you give / you get") filled from the lists above.
- The AI's answer is shown **before sending** as a meter (Certain / Likely / Possible / Unlikely /
  Never) with the top three reasons ("they need credits", "they fear your fleet", "−20 habitat
  overlap"). Players learn what works.
- Proposals between humans in multiplayer are delivered **instantly** through the relay (it is
  real-time tanglelink communication in the fiction too). They take effect when the turn is
  processed. Chat stays as in StarLord.
- The AI may also propose things during your turn. They appear in the turn summary as
  "The Vael propose a trade treaty", with accept/decline buttons.

## 7. War and peace

- **War weariness** (economy doc §6): −0.5 stability per turn at war, plus losses (−1 per lost
  warship of Cruiser size or larger, −5 per lost colony), max −20. It fades by 2 per turn in
  peace. Autocracy halves it; Republic increases it ×1.5 (governments doc §2).
- **Ceasefire** stops fighting for 4 turns. Peace needs an agreement.
- **AI war decisions** follow personality, relative strength (it compares *known* fleet power),
  attitude and opportunity (you are at war elsewhere).

## 8. AI personalities

Each AI empire has a personality mix, defaulting from its species and slightly randomised:

| Personality | Tends to |
|-------------|----------|
| Expansionist | grab land fast, accept NAPs, fight over borders |
| Militarist | strong fleets, demands, opportunistic wars |
| Trader | trade treaties everywhere, avoids war, pays for peace |
| Scholar | research treaties, defends rather than attacks |
| Diplomat | alliances, Concord votes, punishes treaty breakers |
| Isolationist | few treaties, defends hard, rarely starts wars |
| Opportunist | changes sides, attacks the weak, breaks treaties more often |

Species defaults come from their sheet: high Troops/Piloting leans Militarist, high Commerce leans
Trader, high Research leans Scholar, high Diplomacy leans Diplomat, Xenophobic leans Isolationist.

## 9. The Concord

### 9.1 Formation

The Concord forms when the largest **contact network** (empires connected through contacts)
contains at least half of the surviving empires. Members are the empires in that network; others
join when they make contact with any member.

### 9.2 Sessions and votes

- A session every **10 turns** (50 years), the first one in the turn after formation.
- **Votes:** 1 per bn of population. Nothing else changes the vote count (D37).
- **Candidates:** the two members with the most votes.
- **Voting is an order like any other:** during the turn before a session, each player sets
  their vote (candidate A, candidate B, or abstain). Default: abstain; an advisor suggests one.
  The session never pauses the game (in the spirit of D15). Candidates vote for themselves; AIs
  vote by attitude and interest.
- **Election:** a candidate with **2/3 of all Concord votes** (abstentions count in the total)
  becomes Speaker. That is the **Concord victory**.

### 9.3 Defying the Concord

A player may set a standing order **"Defy the Concord if a vote goes against me"** (Q42). If the
Speaker is elected and an empire defies:

- the defiers are at war with the Speaker and everyone who voted for the Speaker;
- the Concord dissolves and the game continues: victory now only by conquest, Legacy, the
  Approach or score;
- if nobody defies, the game ends with the Concord victory.

AIs defy if they are strong, aggressive and have low attitude towards the Speaker.

### 9.4 Laws

Concord laws (e.g. a ban on relativistic impactors, open borders) come later (D26).

## 10. Espionage, as it touches diplomacy

(The light intelligence system of design.md §13.1, stated here so diplomacy is complete.)

- Agents can only target empires you have **contact** with.
- Each agent mission (steal tech, sabotage, incite unrest, gather intel) has a success chance
  from espionage offence versus defence. A **caught** agent gives −15 attitude and is reported to
  the victim with its owner's name.
- Gathered intel shows the target's fleets, techs and treaties for 10 turns.

## 11. The diplomacy screen (UX)

- Overview: all known empires as portraits, sorted by attitude, coloured green to red; icons for
  state, treaties, habitat overlap and border tension.
- Empire page: attitude bar with the reason list, reputation, treaties, war weariness, history
  ("Turn 34: they broke the NAP").
- Species-flavoured message text (generated from each species' personality), always followed by a
  plain summary line.

## 12. Decisions

Q40 (first meeting never fights) and Q42 (defying as a standing order) are accepted (design.md D38). Q41: votes are by population only, with no modifiers (D37).
