"""Fetch original public astronomy catalogues; build.py works offline thereafter."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "cache"
CACHE.mkdir(parents=True, exist_ok=True)
QUERY = "select pl_name,hostname,pl_letter,pl_orbsmax,pl_orbper,pl_rade,pl_bmasse,pl_eqt,pl_orbeccen,st_spectype,st_teff,st_mass,st_lum,sy_dist,ra,dec,hip_name,hd_name,gaia_dr3_id,disc_year,discoverymethod from pscomppars where sy_dist < 100"
SOURCES = {
    "hyg-v41.csv": "https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv",
    "nasa-nearby-planets.json": "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?" + urlencode({"query": QUERY, "format": "json"}),
    "cns5-updated.csv": "https://dc.g-vo.org/tap/sync?" + urlencode({"REQUEST": "doQuery", "LANG": "ADQL", "QUERY": "select cns5_id,gj_id,component_id,n_components,primary_flag,gj_system_primary,gaia_dr3_id,hip_id,ra,dec,epoch,parallax,g_mag_resulting,g_rp_resulting,cns6_system_id,n_planets,reference_object_cns5_id,nexa_id from cns5update.main", "FORMAT": "csv", "MAXREC": "10000"}),
    "tenpc-v2.csv": "https://dc.g-vo.org/tap/sync?" + urlencode({"REQUEST": "doQuery", "LANG": "ADQL", "QUERY": "select nb_obj,nb_sys,system_name,obj_cat,obj_name,ra,dec,epoch,parallax,sp_type,common_name,gj,hd,hip,gaia_edr3,exoplanet_count,comment from tenpc.main", "FORMAT": "csv", "MAXREC": "1000"}),
    "dwarf-calibration.txt": "https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt",
    "nasa-status.json": "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?" + urlencode({"query": "select pl_name,pl_controv_flag from pscomppars where sy_dist < 100", "format": "json"}),
}

def fetch(item):
    name, url = item
    path = CACHE / name
    if not path.exists():
        with urlopen(url, timeout=120) as response:
            data = response.read()
        path.write_bytes(data)
    data = path.read_bytes()
    result = {"file": name, "url": url, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
    print(name, len(data), result["sha256"])
    return result

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=2) as pool:
        records = list(pool.map(fetch, SOURCES.items()))
    (ROOT / "sources.json").write_text(json.dumps({"retrieved": "2026-10-28", "sources": records}, indent=2), encoding="utf-8")
