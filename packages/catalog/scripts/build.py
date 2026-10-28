"""Build committed, offline Astralis astronomy data from source catalogue snapshots.

All coordinates are measured catalogue positions, rotated ICRS -> Galactic, in ly.
Unmeasured physical properties are explicitly marked as estimates.
"""
import csv
import hashlib
import json
import math
from pathlib import Path
import re
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "cache"
OUT = ROOT / "src"
OUT.mkdir(parents=True, exist_ok=True)
LY = 3.261563777167433
# IAU ICRS-to-Galactic rotation, same matrix used by Astropy/SOFA conventions.
ROT = ((-.0548755604162154, -.8734370902348850, -.4838350155487132),
       (.4941094278755837, -.4448296299600112, .7469822444972180),
       (-.8676661490190047, -.1980763734312015, .4559837761750669))
DWARFS = []
for line in (CACHE/"dwarf-calibration.txt").read_text(encoding="utf-8").splitlines():
    parts=line.split()
    if len(parts)<32 or not re.fullmatch(r"[OBAFGKMLTY]\d(?:\.\d)?V",parts[0]) or not parts[1].isdigit(): continue
    DWARFS.append({"type":parts[0][0],"subtype":float(re.search(r"\d(?:\.\d)?",parts[0])[0]),"temperature":float(parts[1]),"bc":float(parts[3]) if re.fullmatch(r"-?\d+(?:\.\d+)?",parts[3]) else None,"logL":float(parts[4]) if re.fullmatch(r"-?\d+(?:\.\d+)?",parts[4]) else None,"mass":float(parts[-2]) if re.fullmatch(r"\d+(?:\.\d+)?",parts[-2]) else None})

def rows(name):
    return list(csv.DictReader((CACHE / name).open(encoding="utf-8-sig")))

def number(value, default=None):
    try:
        v = float(value)
        return v if math.isfinite(v) else default
    except (ValueError, TypeError):
        return default

def norm(value):
    value = str(value or "")
    gj = re.fullmatch(r"(?:Gl|GJ)\s*(\d+(?:\.\d+)?)\s*[A-Z]*", value, re.I)
    if gj:
        return "gj" + gj[1]
    return re.sub(r"\s+", "", value).lower()

def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

def position(ra, dec, pc):
    ra, dec = math.radians(float(ra)), math.radians(float(dec))
    eq = (pc * math.cos(dec) * math.cos(ra), pc * math.cos(dec) * math.sin(ra), pc * math.sin(dec))
    return [round(sum(a*b for a,b in zip(axis,eq))*LY, 6) for axis in ROT]

def difference(a, b):
    return math.sqrt(sum((a[k]-b[k])**2 for k in ("x","y","z")))

def spatial_match(a,b):
    da=math.sqrt(sum(a[k]**2 for k in ("x","y","z")))
    db=math.sqrt(sum(b[k]**2 for k in ("x","y","z")))
    if min(da,db)==0: return False
    cosine=sum(a[k]*b[k] for k in ("x","y","z"))/(da*db)
    return cosine>math.cos(math.radians(.1)) and abs(da-db)<max(.12,.04*da)

def stellar_estimates(spectral, lum=None):
    match = re.search(r"([OBAFGKMLTYD])(\d(?:\.\d)?)?", spectral or "")
    cls = match[1] if match else "M"
    subtype = float(match[2] or 5) if match else 5
    calibration=[d for d in DWARFS if d["type"]==cls]
    if calibration and not re.search(r"I{2,}",spectral):
        d=min(calibration,key=lambda d:abs(d["subtype"]-subtype))
        # HYG is a V-band luminosity; correct relative to the Sun before using
        # it in bolometric heating estimates. Values remain modeled, not measured.
        if lum is not None and d["bc"] is not None:
            bolometric=lum*10**(-.4*(d["bc"]+.085))
        elif d["logL"] is not None:
            bolometric=10**d["logL"]
        else:
            bolometric=lum if lum is not None else .00001
        return round(max(bolometric,1e-8),8), d["mass"] or (.05 if cls in "LTY" else .25), int(d["temperature"])
    ranges = {"O": (45000,33000,30), "B": (30000,11000,8), "A": (10000,7500,2),
              "F": (7300,6000,1.3), "G": (5900,5200,1), "K": (5200,3800,.7),
              "M": (3800,2400,.25), "L": (2300,1300,.06), "T": (1300,500,.035),
              "Y": (450,250,.015), "D": (15000,6000,.65)}
    hi, lo, mass = ranges.get(cls, ranges["M"])
    temperature = round(hi+(lo-hi)*subtype/9)
    if lum is None:
        lum = .0001 if cls=="D" else (mass**4 if mass>=.43 else .23*mass**2.3)
    elif cls not in "DLTY":
        mass = lum**.25 if lum>=.034 else (max(lum,1e-8)/.23)**(1/2.3)
    return round(max(lum, 1e-8), 8), round(max(mass,.01),4), temperature

hyg = rows("hyg-v41.csv")
hyg_by_alias = {}
def h_aliases(h):
    return [h.get("proper"),h.get("gl"),"HIP "+h["hip"] if h.get("hip") else "",
            "HD "+h["hd"] if h.get("hd") else "",h.get("bf")]
for h in hyg:
    for a in h_aliases(h):
        if a and (norm(a) not in hyg_by_alias or number(h["mag"],99)<number(hyg_by_alias[norm(a)]["mag"],99)):
            hyg_by_alias[norm(a)] = h

systems = []
aliases = {}
used_ids = set()

def add_system(name, xyz, spectral, lum, stars, source, alias_list, estimated, epoch=2000):
    sid = "sol" if name=="Sol" else slug(name)
    if sid in used_ids:
        sid += "-" + str(len(systems))
    used_ids.add(sid)
    luminosity,mass,temperature = stellar_estimates(spectral,lum)
    distance = round(math.sqrt(sum(v*v for v in xyz)),6)
    s = {"id":sid,"name":name,"x":xyz[0],"y":xyz[1],"z":xyz[2],"distance":distance,
         "spectral":spectral or "M (estimated)","luminosity":luminosity,"mass":mass,"temperature":temperature,
         "observationDepth":"deep" if distance<20 and spectral[:1] in "FGK" else "moderate" if distance<33 else "shallow",
         "stars":stars,"source":source,"estimated":sorted(set(estimated+["luminosity","mass","temperature"])),"epoch":epoch,
         "aliases":sorted(set(a for a in alias_list if a))}
    systems.append(s)
    for alias in [name]+alias_list:
        if alias: aliases[norm(alias)] = s
    return s

add_system("Sol",[0,0,0],"G2V",1,[{"name":"Sun","spectral":"G2V","category":"star"}],"IAU nominal solar units",["Sun"],[],2000)
systems[0].update(mass=1,temperature=5772)
systems[0]["estimated"]=[]

# The vetted 10pc sample supplies named components, brown dwarfs and system grouping.
groups = defaultdict(list)
for t in rows("tenpc-v2.csv"):
    if int(t["nb_sys"])<1000 and "Planet" not in t["obj_cat"]:
        groups[t["nb_sys"]].append(t)
overrides = {"1":"Alpha Centauri", "7":"Sirius", "16":"Procyon", "11":"Epsilon Eridani"}
for group_id, components in sorted(groups.items(), key=lambda kv:int(kv[0])):
    components.sort(key=lambda t:(not t["obj_name"].endswith(" A"),int(t["nb_obj"])))
    p = next((t for t in components if number(t["parallax"],0)>0 and number(t["ra"]) is not None), None)
    if p is None: continue
    ha = [a for t in components for a in (t["obj_name"],t["system_name"],t["common_name"],t["gj"],t["hd"],t["hip"])]
    hs = [hyg_by_alias[norm(a)] for a in ha if a and norm(a) in hyg_by_alias]
    primary_h = hs[0] if hs else None
    if primary_h:
        ha += [a for h in hs for a in h_aliases(h)]
    name = overrides.get(group_id) or p["common_name"] or (primary_h["proper"] if primary_h else "") or p["system_name"]
    if "085510" in name: name="WISE 0855-0714"
    spectral = p["sp_type"] or (primary_h["spect"] if primary_h else "")
    lum = number(primary_h["lum"]) if primary_h else None
    stars = [{"name":t["obj_name"],"spectral":t["sp_type"],"category":"brown dwarf" if "BD" in t["obj_cat"] else "white dwarf" if "WD" in t["obj_cat"] else "star", "uncertain":"?" in t["obj_cat"]} for t in components]
    add_system(name,position(p["ra"],p["dec"],1000/float(p["parallax"])),spectral,lum,stars,
               "Reyle et al. 10pc sample v2; HYG v4.1 luminosity where crossmatched",ha,
               ["mass","temperature"]+([] if lum is not None else ["luminosity"]),number(p["epoch"],2000))

# Updated CNS5 extends the dense nearby region to25pc and reconciles catalogue aliases.
cns_groups=defaultdict(list)
for c in rows("cns5-updated.csv"):
    comp=c["component_id"]
    if c["cns6_system_id"]!="0" and not re.fullmatch(r"[b-z]",comp) and number(c["parallax"],0)>0 and number(c["ra"]) is not None:
        cns_groups[c["cns6_system_id"]].append(c)
for components in cns_groups.values():
    components.sort(key=lambda c:c["primary_flag"]!="1")
    p=components[0]
    al=[a for c in components for a in ("GJ "+c["gj_id"] if c["gj_id"] else "", "HIP "+c["hip_id"] if c["hip_id"] else "",c["nexa_id"] if c["nexa_id"] not in ("","--") else "")]
    existing=next((aliases[norm(a)] for a in al if a and norm(a) in aliases),None)
    xyz=position(p["ra"],p["dec"],1000/float(p["parallax"]))
    test=dict(zip(("x","y","z"),xyz))
    if not existing and math.sqrt(sum(v*v for v in xyz))<34:
        near=min(systems,key=lambda s:difference(s,test))
        if spatial_match(near,test): existing=near
    if existing:
        for a in al:
            if a: aliases[norm(a)]=existing
        continue
    hs=[hyg_by_alias[norm(a)] for a in al if a and norm(a) in hyg_by_alias]
    h=hs[0] if hs else None
    if h: al += [a for hh in hs for a in h_aliases(hh)]
    color=number(p["g_rp_resulting"])
    spectral=h["spect"] if h and h["spect"] else "M5 (estimated)" if color is None else "K5 (estimated)" if color<.9 else "M3 (estimated)"
    name=(h["proper"] if h else "") or ("GJ "+p["gj_id"] if p["gj_id"] else "CNS5 "+p["cns5_id"])
    stars=[{"name":("GJ "+c["gj_id"] if c["gj_id"] else "CNS5 "+c["cns5_id"])+(c["component_id"] if c["component_id"]!="--" else ""),"spectral":spectral,"category":"star"} for c in components]
    add_system(name,xyz,spectral,number(h["lum"]) if h else None,stars,"CNS5-updated; HYG v4.1 photometry where crossmatched",al,["mass","temperature"]+([] if h else ["spectral","luminosity"]),number(p["epoch"],2016))

# HYG wider region supports random map centres out to100pc, with known incompleteness.
hyg_groups=defaultdict(list)
for h in hyg:
    if 0<number(h["dist"],1e9)<100:
        hyg_groups[h["comp_primary"] if h["comp_primary"] not in ("","0") else h["id"]].append(h)
for components in hyg_groups.values():
    ha=[a for h in components for a in h_aliases(h)]
    existing=next((aliases[norm(a)] for a in ha if a and norm(a) in aliases),None)
    if existing:
        for a in ha:
            if a: aliases[norm(a)]=existing
        continue
    h=min(components,key=lambda h:number(h["mag"],99))
    name=h["proper"] or h["base"] or h["gl"] or h["bf"] or ("HIP "+h["hip"] if h["hip"] else "HYG "+h["id"])
    xyz=position(float(h["ra"])*15,h["dec"],float(h["dist"]))
    if float(h["dist"])<25:
        test=dict(zip(("x","y","z"),xyz))
        nearest=min(systems,key=lambda s:difference(s,test))
        if spatial_match(nearest,test):
            for a in ha:
                if a: aliases[norm(a)]=nearest
            continue
    s=add_system(name,xyz,h["spect"],number(h["lum"]),[{"name":hh["proper"] or hh["gl"] or "HYG "+hh["id"],"spectral":hh["spect"],"category":"white dwarf" if hh["spect"].startswith("D") else "star"} for hh in components],"HYG v4.1",ha,["mass","temperature"])

# NASA archive is the authority for confirmed planet status at snapshot time.
planets=[]
nasa=json.loads((CACHE/"nasa-nearby-planets.json").read_text(encoding="utf-8"))
nasa_status={p["pl_name"]:bool(p["pl_controv_flag"]) for p in json.loads((CACHE/"nasa-status.json").read_text(encoding="utf-8"))}
nasa_missing=[]
for p in nasa:
    host_aliases=[p["hostname"],p["hip_name"],p["hd_name"]]
    system=next((aliases[norm(a)] for a in host_aliases if a and norm(a) in aliases),None)
    if system is None:
        xyz=position(p["ra"],p["dec"],p["sy_dist"])
        test=dict(zip(("x","y","z"),xyz))
        nearest=min(systems,key=lambda s:difference(s,test))
        if difference(nearest,test)<max(.15,p["sy_dist"]*LY*.02):
            system=nearest
        else:
            lum=10**p["st_lum"] if p["st_lum"] is not None else None
            system=add_system(p["hostname"],xyz,p["st_spectype"] or "M (estimated)",lum,[{"name":p["hostname"],"spectral":p["st_spectype"] or "unknown","category":"star"}],"NASA Exoplanet Archive PSCompPars",host_aliases,["luminosity"] if lum is None else [],2016)
        for a in host_aliases:
            if a: aliases[norm(a)]=system
    host_mass=p["st_mass"] if p["st_mass"] is not None else system["mass"]
    host_luminosity=10**p["st_lum"] if p["st_lum"] is not None else system["luminosity"]
    if len(system["stars"])==1:
        if p["st_mass"] is not None:
            system["mass"]=p["st_mass"]
            system["estimated"]=[v for v in system["estimated"] if v!="mass"]
        if p["st_teff"] is not None:
            system["temperature"]=p["st_teff"]
            system["estimated"]=[v for v in system["estimated"] if v!="temperature"]
        if p["st_lum"] is not None:
            system["luminosity"]=round(10**p["st_lum"],8)
            system["estimated"]=[v for v in system["estimated"] if v!="luminosity"]
    else:
        host_star=next((star for star in system["stars"] if norm(star["name"])==norm(p["hostname"])),None)
        if host_star:
            host_star.update(mass=host_mass,luminosity=round(host_luminosity,8),temperature=p["st_teff"])
    estimated=[]
    radius,mass,orbit,temp=p["pl_rade"],p["pl_bmasse"],p["pl_orbsmax"],p["pl_eqt"]
    if mass is None and radius is not None:
        mass=radius**(3 if radius<1.6 else 1.6); estimated.append("mass")
    if radius is None and mass is not None:
        radius=mass**(1/3.7) if mass<2 else min(13,mass**.4); estimated.append("radius")
    if orbit is None and p["pl_orbper"]:
        orbit=(host_mass*(p["pl_orbper"]/365.25)**2)**(1/3); estimated.append("orbit")
    if temp is None and orbit:
        temp=278*host_luminosity**.25/math.sqrt(orbit); estimated.append("temperature")
    planets.append({"id":slug(p["pl_name"]),"systemId":system["id"],"name":p["pl_name"],"host":p["hostname"],"hostLuminosity":round(host_luminosity,8),"hostMass":host_mass,"status":"confirmed","controversial":nasa_status.get(p["pl_name"],False),"radius":round(radius,5) if radius else None,"mass":round(mass,5) if mass else None,"orbit":round(orbit,6) if orbit else None,"temperature":round(temp,2) if temp else None,"period":p["pl_orbper"],"eccentricity":p["pl_orbeccen"],"discoveryYear":p["disc_year"],"discoveryMethod":p["discoverymethod"],"estimated":estimated,"source":"NASA Exoplanet Archive PSCompPars (2026-10-28)"})

# A still-unconfirmed candidate, kept separate from NASA's confirmed table.
# Existence probability is a named gameplay prior, NOT a published confidence.
planets.append({"id":"proxima-cen-c","systemId":"alpha-centauri","name":"Proxima Cen c","host":"Proxima Cen","hostLuminosity":.00151,"hostMass":.1221,"status":"candidate","controversial":True,"confidence":.5,"confidenceBasis":"gameplay prior; not a scientific posterior","radius":round(5.8**.4,5),"mass":5.8,"orbit":1.48,"temperature":39,"period":1900,"eccentricity":0,"estimated":["radius"],"source":"NASA Exoplanet Archive Proxima overview, Damasso et al. 2020 candidate solution; https://exoplanetarchive.ipac.caltech.edu/overview/Proxima"})

# Nominal Solar System values, explicitly physical data rather than generated planets.
for name,radius,mass,orbit,temp,period in [("Mercury",.383,.0553,.3871,440,87.969),("Venus",.949,.815,.7233,737,224.701),("Earth",1,1,1,288,365.256),("Mars",.532,.107,1.5237,210,686.98),("Jupiter",10.973,317.83,5.2029,165,4332.59),("Saturn",9.14,95.16,9.537,134,10759.22),("Uranus",3.981,14.54,19.191,76,30688.5),("Neptune",3.865,17.15,30.069,72,60182)]:
    planets.append({"id":slug(name),"systemId":"sol","name":name,"host":"Sun","status":"confirmed","radius":radius,"mass":mass,"orbit":orbit,"temperature":temp,"period":period,"eccentricity":None,"estimated":[],"source":"NASA NSSDC Planetary Fact Sheet; nominal values"})

systems.sort(key=lambda s:(s["distance"],s["id"]))
nearby=[s for s in systems if s["distance"]<=32.00001]
nearby_ids={s["id"] for s in nearby}
for name,data in [("systems.json",nearby),("extended-systems.json",systems),("planets.json",[p for p in planets if p["systemId"] in nearby_ids]),("extended-planets.json",planets)]:
    (OUT/name).write_text(json.dumps(data,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
report={"generated":"2026-10-28","coordinateSystem":"IAU Galactic Cartesian; Sol origin; light-years","nearbySystems":len(nearby),"extendedSystems":len(systems),"nearbyKnownPlanets":sum(p["systemId"] in nearby_ids and p["status"]=="confirmed" for p in planets),"extendedKnownPlanets":sum(p["status"]=="confirmed" for p in planets),"candidatePlanets":sum(p["status"]=="candidate" for p in planets),"systemsPerRadiusLy":{str(r):sum(s["distance"]<=r for s in systems) for r in [15,20,25,32]},"nearbyMultipleSystems":sum(len(s["stars"])>1 for s in nearby),"nearbyBrownDwarfSystems":sum(any(t["category"]=="brown dwarf" for t in s["stars"]) for s in nearby),"sources":json.loads((ROOT/"sources.json").read_text(encoding="utf-8"))}
(ROOT/"report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
print(json.dumps({k:v for k,v in report.items() if k!="sources"},indent=2))
