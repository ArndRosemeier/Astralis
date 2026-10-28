"""Final 26 portrait production, intentionally run only after specials calibration."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import importlib.util
import json

ROOT = Path(__file__).resolve().parents[2]
if not (ROOT / "docs" / "balance" / "calibration.json").is_file():
    raise RuntimeError("Species art requires completed pre-roster special calibration")
if not (ROOT / "docs" / "balance" / "final-prices.json").is_file():
    raise RuntimeError("Expanded roster art requires final production-engine calibration")
spec = importlib.util.spec_from_file_location("generate", Path(__file__).with_name("generate.py"))
generate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generate)

ROSTER = {
    "humans": "An adaptable future human diplomat, a thoughtful middle-aged East Asian woman with a confident and humane expression, silver-black close-cropped hair, wearing an original elegant dark exploration uniform with a simple amber shoulder accent. Natural realistic human anatomy.",
    "vael": "A tall slim alien evolved in the twilight band of a red-dwarf world. Broad reflective black eyes, subtle violet-gray skin, delicately elongated head and neck, fine protective translucent membranes around the eyes, graceful and watchful. Unmistakably alien anatomy, not a human wearing makeup.",
    "oolu": "A translucent deep-ocean cephalopod alien from beneath a moon's ice. A rounded glasslike mantle, opalescent internal organs, eight graceful short sensory arms clustered below, dark intelligent eyes and delicate bioluminescent filaments. Suspended naturally in dark water with a few tiny ice particles. Not a human torso.",
    "brathak": "A compact heavy-world alien with extremely robust proportions, a broad low head, four thick supportive arms, dense stone-gray skin with naturally overlapping mineral-like plates, amber intelligent eyes. Powerful but calm rather than monstrous. A subtle functional exploration harness, no weapon.",
    "sylphae": "An ethereal buoyant alien evolved in a gas giant atmosphere. A translucent floating amber and sea-glass mantle with a luminous internal air sac, a circle of fine intelligent sensory nodules, trailing delicate tendrils, soft iridescent membranes. Beautiful plausible atmospheric life, no human face or body.",
    "corundi": "An ancient silicon-based living crystal being, a patient living mountain in miniature. An asymmetrical sculpted mass of amber quartz and smoky purple minerals, layered mineral plates, very subtle warm light within several deep sensory facets. Clearly a sentient organism, not a humanoid robot or a simple gem pile.",
    "myriad": "A collective alien swarm made of hundreds of tiny ivory and amber insectlike organisms, clustered together to form one coherent elegant diplomatic silhouette with a hollow central sensory aperture. Individual small creatures visibly interlock, delicate legs and antennae, curious and coordinated, no human face.",
    "lattice": "An elegant nonhumanoid geometric machine consciousness. Three nested floating dark metallic polyhedral rings arranged around a small warm crystalline core, precise thin sea-glass light traces, fine articulated sensor fins. Minimal, intelligent, quietly dignified, original hard science-fiction industrial design. No humanoid face or limbs.",
    "tessit": "A mobile photosynthetic alien organism. An upright cluster of broad dark jade fronds and pale golden leaf veins, a central flowerlike sensory crown with fine spiral tendrils, several flexible rootlike locomotor limbs visible at the base. Alert and gentle, a botanical civilization representative, not a human with leaves attached.",
    "skethi": "A slender alien from a freezing ammonia world. Faceted frost-blue exoskeleton, an elongated diamond-shaped head, four small luminous dark sapphire sensory eyes in a vertical arrangement, delicate articulated neck ridges, subtle ammonia frost crystals. A calm scholarly bearing, beautiful biological geometry, not a humanoid in armor.",
    "hallowfleet": "An original alien nomadic trader in a carefully patched habitat suit. A broad asymmetrical soft alien head with a horizontal array of three luminous amber eyes and fine whiskerlike chemical sensors, mottled indigo skin. Practical worn graphite fabric with elegant hand-repaired copper stitching and small trade tokens, friendly resourceful presence. Clearly not human.",
    "qelloth": "A patient slow-moving alien from a cold hydrocarbon lake. A pearly segmented protective shell with oily lavender and amber iridescence, a low curved body, delicate long sensory tendrils emerging from a narrow opening, multiple small dark reflective sensory pits. Sophisticated but utterly nonhumanoid, a beautiful plausible cold-chemistry organism. A few soft hydrocarbon droplets.",
    "mur": "A blind alien cavern dweller who perceives vibration and heat. A broad low eyeless clay-brown head with delicate whiskerlike vibration feelers, small infrared sensing pits along two cheek ridges, supple mineral-dusted skin, a compact sturdy body and powerful digging hands. Fine tactile exploration harness. Intelligent patient presence, no visible eyes, no human face, not a rodent.",
    "kiriel": "An elegant alien glider from a low-gravity world with a thick atmosphere. A long lightly built six-limbed body, two very broad translucent ivory flight membranes folded around the shoulders so their shape remains visible in the portrait, two fine manipulator arms, narrow amber forward eyes, pale slate-blue pebbled skin, a delicate swept-back sensory crest. Clearly an original biological flying alien, not a human angel or a familiar Earth bird.",
    "ulqua": "An intelligent shallow-ocean cephalopod alien who speaks through living color. A wide oval mantle covered in intricate naturally changing magenta, teal and gold chromatophore patterns, luminous waves of color across textured skin, eight graceful expressive arms gathered below, two deep intelligent eyes with horizontal pupils. Richly colored opaque skin, unlike a transparent squid. Diplomatic calm. No human torso, no clothes.",
    "tharn": "A robust herd-descended alien representative, patient and reassuring. A broad blunt gentle head with a short flexible split muzzle, wide-set dark thoughtful eyes, heavy taupe velvet-textured skin, low blunt protective forehead ridges. A powerful four-legged lower body with a pair of precise manipulation limbs raised at the chest, a simple communal woven ochre shoulder harness. Original alien anatomy, neither a human nor an Earth cow or elephant.",
    "wardens": "A biological keeper originally created by an ancient Gardener civilization. An ivory chitinous living being with an elongated triangular head, several tiny dark green sensory eyes recessed into a protective brow, four graceful articulated arms, subtle organic gold channels under translucent skin, protective leaflike plates grown as part of the body. Dignified and uncertain, an ancient custodian learning independence. Clearly alive, not a robot, no armor costume or franchise symbols.",
    "mycel": "A mobile fungal-network alien composed of several connected fruiting bodies. Overlapping pale parchment mushroom-like fans with intricate dark gills, fine rootlike walking tendrils woven into one coherent upright silhouette, warm amber spore chambers and tiny teal bioluminescent nodes threaded through soft fibrous tissue. No central face or eyes, no humanoid torso, a sophisticated sentient network rather than a decorative mushroom bouquet.",
    "ixit": "A radiotrophic alien whose mineral-black biological body feeds on radiation. A compact sculptural living organism with six flexible jointed limbs, matte obsidian skin etched by fine crimson and amber metabolic veins, several small dark sensory nodules, glowing coral-red radiation-processing vents along the neck and upper mantle. Calm curious presence, warm internal life visible beneath a black crust. No human face, no robot plating, no flames.",
    "vorr": "An original alien pack hunter from rugged highlands. A lean powerful upper body with copper-gray leathery skin, an angular wedge-shaped head, four forward-facing small amber predator eyes, fine backward-swept keratin ridges, subtle old scars, exposed strong neck tendons and a firm closed jaw with fine sensory palps. Wears a minimal practical dark command harness. Confident disciplined captain, not snarling, not an Earth wolf, cat or reptile in clothes.",
    "sorrin": "An original alien trade-guild diplomat from an archipelago world. Sea-green and blue pebble-textured skin, a broad soft asymmetric face with a short flattened sensory snout, a small array of dark glossy compound eyes, an elegant translucent fanlike crest behind the head. Carefully tailored graphite trading garments with warm golden shell-like tokens and fine copper stitching. Open intelligent attentive expression, sophisticated merchant presence, clearly nonhuman and distinct from a familiar Earth animal.",
    "kith": "A small quick short-lived alien full of alert curiosity and exuberance. A compact delicate body with four nimble little manipulator arms, two very large dark turquoise eyes, bright muted jade skin with fine pale speckles, narrow head and broad fan-shaped sensory ear membranes. A simple light exploration vest with tiny practical pockets. Agile youthful-looking adult with an eager thoughtful posture, original alien anatomy, not a child, fairy or recognizable Earth animal.",
    "aumaru": "An ancient alien representative carrying the elegance of a fading golden age. A long broad mauve-gray head with a softly fluted backward crest, four narrow thoughtful gold eyes, delicate silver sensory membranes along the cheeks, a long graceful neck with subtle age folds and iridescent skin. Wears exquisitely crafted but gently worn deep-plum diplomatic drapery with restrained geometric golden threads. Melancholy dignity and intelligence. Clearly nonhuman, no elf ears, no crown, no fantasy jewelry.",
    "abyssals": "A chemosynthetic alien from the sunless ocean of a brown-dwarf moon. An utterly nonhumanoid dark-blue tubular body with a radial crown of delicate branching sensory cilia and several soft jointed anchoring limbs, luminous warm orange symbiotic bacterial patches around fine metabolic vents, pearly pale inner membranes visible through openings. Beautiful plausible deep-vent life, quiet intelligence without a human face or conventional eyes. Suspended in very dark water, no surrounding scenery.",
    "keth-ra": "An armored desert arthropod alien whose culture treasures water. A broad ochre and warm sandstone segmented exoskeleton, six sturdy articulated limbs with two precise claw-like manipulators held at the chest, two large dark faceted eyes protected by natural ridged brows, fine mouth palps, a compact water-preserving body with elegant overlapping plates. A small practical graphite water flask in a simple harness. Disciplined exacting engineer, calm rather than aggressive, original alien anatomy rather than an Earth insect enlarged.",
    "seren": "An aquatic alien with a natural electrical sense, evolved in a twilight sea. A long flexible blue-gray body with an elegant manta-like head, small recessed dark eyes and a broad collar of delicate translucent sensory frills threaded with faint sea-glass bioluminescent channels, fine electrosensory filaments fanning outward, graceful paired swimming limbs gathered below. Intelligent poised presence, beautifully plausible marine biology, no human face or torso, no familiar Earth fish silhouette.",
}

STYLE = """Portrait artwork for Astralis, a premium grounded science-fiction strategy game.
One single species representative, composed centrally and filling most of a square image,
distinct silhouette readable at a small icon size. Subject: {subject}
Shared visual direction: realistic detailed painterly concept art, dark midnight-ink
observatory-like neutral background with a faint circular instrument halo, soft sea-glass
teal rim light from the left, warm parchment and restrained amber key light from the right,
rich tactile materials, dignified expression or intelligent presence, calm optimistic mystery.
Close portrait or equivalent full organism framing for a nonhumanoid. Consistent sophisticated
lighting and rendering across a set of 26 species. Original design with no franchise characters.
No letters, no labels, no logo, no watermark, no frame, no collage, no multiple portraits,
no weapons, no visual interface, no Earth flags. Square 1:1 composition."""


def worker(item):
    species_id, subject = item
    path = ROOT / "public" / "assets" / "species" / (species_id + ".webp")
    if path.exists():
        print("Already generated: " + species_id, flush=True)
        return {"species": species_id, "existing": True}
    result = generate.make("image", "species/" + species_id, STYLE.format(subject=subject), size="1024x1024")
    return {"species": species_id, "path": result["asset"], "cost_usd": result["cost_usd"]}


if __name__ == "__main__":
    results = []
    with ThreadPoolExecutor(max_workers=3) as executor:
        pending = {executor.submit(worker, item): item[0] for item in ROSTER.items()}
        for future in as_completed(pending):
            try:
                results.append(future.result())
            except Exception as error:
                print("Portrait failed for " + pending[future] + ": " + str(error).replace(generate.load_key(), "[redacted]"), flush=True)
                raise
    print(json.dumps(results, indent=2))
