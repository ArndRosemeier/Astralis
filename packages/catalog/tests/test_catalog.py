"""Offline validation of the committed data, using only Python's standard library."""
import hashlib
import json
import math
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class CatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.systems=json.loads((ROOT/'src/systems.json').read_text(encoding='utf-8'))
        cls.planets=json.loads((ROOT/'src/planets.json').read_text(encoding='utf-8'))
        cls.by_id={s['id']:s for s in cls.systems}

    def test_sol_origin(self):
        s=self.by_id['sol']
        self.assertEqual([s['x'],s['y'],s['z']], [0,0,0])
        self.assertEqual(s['mass'],1)

    def test_source_measured_positions(self):
        self.assertGreater(len(self.systems),300)
        for s in self.systems:
            self.assertTrue(s['source'])
            self.assertAlmostEqual(math.sqrt(sum(s[k]**2 for k in ['x','y','z'])),s['distance'],places=5)
            self.assertLessEqual(s['distance'],32.00001)
            self.assertTrue(all(math.isfinite(s[k]) for k in ['x','y','z','mass','temperature','luminosity']))

    def test_unique_identifiers(self):
        self.assertEqual(len(self.by_id),len(self.systems))
        self.assertEqual(len({p['id'] for p in self.planets}),len(self.planets))

    def test_grouped_alpha_centauri(self):
        a=self.by_id['alpha-centauri']
        self.assertEqual(len(a['stars']),3)
        self.assertTrue(4.2<a['distance']<4.5)
        self.assertTrue(1<a['luminosity']<2)
        self.assertTrue(a['temperature']>5500)
        proxima=next(s for s in a['stars'] if s['name']=='Proxima Cen')
        self.assertTrue(.001<proxima['luminosity']<.002)
        p=next(p for p in self.planets if p['id']=='proxima-cen-b')
        self.assertTrue(p['hostLuminosity']<.002)

    def test_brown_and_white_dwarfs(self):
        self.assertTrue(any(s['name']=='Luhman 16' for s in self.systems))
        self.assertTrue(any(s['name']=='WISE 0855-0714' for s in self.systems))
        self.assertTrue(any(st['category']=='white dwarf' for s in self.systems for st in s['stars']))

    def test_planets_have_hosts_and_provenance(self):
        for p in self.planets:
            self.assertIn(p['systemId'],self.by_id)
            self.assertTrue(p['source'])
            for k in ['radius','mass','orbit','temperature','period']:
                if p[k] is not None:
                    self.assertGreater(p[k],0)

    def test_solar_system(self):
        solar=[p for p in self.planets if p['systemId']=='sol']
        self.assertEqual(len(solar),8)
        earth=next(p for p in solar if p['name']=='Earth')
        self.assertEqual(earth['orbit'],1)
        self.assertEqual(earth['radius'],1)

    def test_candidate_separation(self):
        c=next(p for p in self.planets if p['id']=='proxima-cen-c')
        self.assertEqual(c['status'],'candidate')
        self.assertTrue(0<c['confidence']<1)
        self.assertIn('gameplay',c['confidenceBasis'])
        self.assertFalse(any(p['name']=='tau Cet e' for p in self.planets))

    def test_no_unresolved_near_duplicates(self):
        for i,a in enumerate(self.systems):
            for b in self.systems[i+1:]:
                d=math.dist([a[k] for k in ['x','y','z']], [b[k] for k in ['x','y','z']])
                self.assertGreater(d,.3, (a['name'],b['name'],d))

    def test_extended_catalog(self):
        extended=json.loads((ROOT/'src/extended-systems.json').read_text(encoding='utf-8'))
        self.assertGreater(len(extended),20000)
        self.assertTrue(all(s['distance']<100*3.261564 for s in extended))
        self.assertEqual(len({s['id'] for s in extended}),len(extended))

    def test_cached_source_hashes_when_available(self):
        sources=json.loads((ROOT/'sources.json').read_text(encoding='utf-8'))['sources']
        self.assertGreaterEqual(len(sources),6)
        for src in sources:
            cached=ROOT/'cache'/src['file']
            if cached.exists():
                self.assertEqual(hashlib.sha256(cached.read_bytes()).hexdigest(),src['sha256'])

if __name__=='__main__':
    unittest.main()
