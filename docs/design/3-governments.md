# Astralis — Governments (detail)

Part of the design plan ([design.md](../design.md) §5.11, §7.4). Draft, planning only.

## 1. Rules (D36)

- **The government is fixed per species, as in MOO2.** It is a pick on the species sheet (species
  §5.11) and never changes during a game. There is no government switching and no anarchy.
- **Constitutional Reform** (Society tier 6) turns the government into its **mature form**: the
  only change a government ever goes through.
- Species with the *Hive mind* special always have **Unified**. No other species can pick it.
- Multi-species empires use the government of the empire's founding species. Conquered and joined
  species live under it.

## 2. The governments

Base stability and administration limit feed the economy (economy doc §6). "Admin limit" is the
number of colonies before the over-limit stability penalty starts; outposts count ¼. Pick costs
are draft values on the species budget (10 points) and will be calibrated (species §5.13).

| Government | Pick cost | Base stability | Admin limit | Effects | Mature form |
|------------|-----------|----------------|-------------|---------|-------------|
| **Autocracy** | 0 | 55 | 8 | ships −10% cost, troops +25%, research −10%, war weariness ×0.5 | **Imperium:** admin 12, ships −20%, no research penalty |
| **Republic** | −3 | 60 | 6 | credits +20%, research +10%, war weariness ×1.5, starting an unprovoked war: stability −10 for 5 turns | **Commonwealth:** credits +30%, research +15%, stability +5 |
| **Communion** (spiritual collective) | −1 | 70 | 7 | troops +25%, conquered populations assimilate ×1.5, research −15% | **Ascendant Communion:** stability 80, research only −5% |
| **Federation** | −3 | 60 | 12 | attitude +10 with everyone, mixed-species colonies have no stability penalty, credits +10%, ships +10% cost, the same war rule as Republic | **Grand Federation:** admin 16, attitude +15 |
| **Technocracy** | −4 | 50 | 7 | research +25%, credits −10%, leaders gain experience ×1.5 | **Enlightened Technocracy:** research +35%, stability 55 |
| **Directorate** (corporate) | −3 | 50 | 8 | credits +30%, buying −25%, trade treaty income +25%, espionage +1 | **Hegemony:** credits +40%, buying −35% |
| **Unified** (hive minds only) | in the Hive mind special | fixed 75, no unrest | 10 | industry +20%, research −10% | **Gestalt:** industry +30%, admin 14 |

Every government has one clear strength and one clear cost. Each fits a playstyle: wide
(Federation, Imperium), tall research (Technocracy), money (Directorate, Republic), war (Autocracy,
Communion).

## 3. Diplomatic effect

- Same government: attitude +10.
- Opposed pairs: attitude −10: **Autocracy ↔ Republic**, **Communion ↔ Technocracy**.
- Unified: −5 with every non-Unified empire (hive minds feel alien to everyone).

Because governments are fixed per species, these relations are part of each species' identity.

## 4. Balance

The calibration harness reports the win rate per government, like every other pick. A government
that is clearly stronger or weaker across many maps gets its pick cost or effects retuned.
