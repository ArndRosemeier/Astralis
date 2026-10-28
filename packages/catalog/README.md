# Offline astronomy catalogue

Normal application builds consume the committed JSON files and make **no astronomy requests at runtime**.

```powershell
# Optional refresh: download public source snapshots, never credentials.
python packages/catalog/scripts/fetch_sources.py
# Rebuild from downloaded snapshots (offline).
python packages/catalog/scripts/build.py
# Validate committed data (offline).
python -m unittest discover -s packages/catalog/tests -v
```

`src/systems.json` and `src/planets.json` are the compact Sol-neighbourhood catalogue. `src/index.ts` provides types and an explicitly lazy `loadExtendedCatalog()` for the wider 100pc data. The roughly 11MB extended JSON must not be statically imported into the title-screen entry point.

Units: positions and distances in light-years, stellar luminosity and mass in Solar units, planet radius and mass in Earth units, orbits in AU, periods in days and temperatures in K. Galactic Cartesian coordinates have Sol at the origin; +X points toward the Galactic centre, +Y in the direction of Galactic rotation and +Z toward Galactic north. Group coordinates follow the selected primary, not a fabricated barycentre.

`status: candidate` is different from a confirmed planet. A candidate's `confidence` is a documented gameplay prior for seeded generation, not an astronomical probability. `controversial` carries the separate NASA archive flag. `estimated` identifies calculated values. Unknown atmospheres, biospheres, moons and detailed habitability belong to the game's seeded generation and must not be labelled observations.

Source URLs and SHA-256 hashes are in `sources.json`; actual counts are in `report.json`. Raw cache files are intentionally ignored by Git. Retain `LICENSE-DATA.md` and show the data credits in the app.
