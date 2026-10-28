import type {Empire} from './types';
/** Additive technology modifiers. Shared by economic and combat consumers. */
const effects:Record<string,Record<string,number>>={
 'combat-thrusters':{acceleration:.2},'vectored-thrust':{turnRate:.3,evasion:.1},'fusion-afterburners':{topSpeed:.25},'battle-drive':{acceleration:.3},
 'guided-slugs':{kineticAccuracy:.2},'droplet-radiators':{radiators:.5,laserDamage:.1},'coherent-arrays':{laserRange:.25},
 'automated-mining':{deposit:.25},'asteroid-mining':{beltCost:-.3},'nanofabrication':{buildingCost:-.2},'monocrystal-hulls':{hull:.5},
 'xenobiology':{biosphereResearch:3},'gene-therapy':{stability:5,tenure:.5},'neural-lace':{research:.1,stability:5},'bioindustry':{industry:.1},'longevity-treatment':{tenure:1,stability:10},'seedships':{colonyCost:-.5,colonyPopulation:2},
 'cyberwarfare':{espionage:1},'planetary-defence-network':{planetAccuracy:.25,detection:2},'predictive-tactics':{evasion:.1},'automated-governance':{stability:10},'neural-net-defence':{planetAccuracy:.3},
 'artificial-general-intelligence':{research:.25,industry:.1,stability:-5},'hyperintelligence':{research:.3},'total-awareness':{espionageDefense:3},
 'interstellar-law':{stability:5,admin:1},'trade-charters':{trade:.25},'xenolinguistics':{attitude:10},'academies':{research:.05,leaderLevel:1},'civil-defence':{garrison:2,militia:.25},
 'interstellar-banking':{commerce:.15,buyCost:-.25},'counterintelligence':{espionageDefense:2},'cultural-exchange':{researchTreaty:.5,integration:.25},'diplomatic-corps':{attitude:5,reputation:10},'deep-cover-operations':{espionage:2},
 'post-scarcity-commerce':{commerce:.25},'cluster-media':{stability:10},'xeno-integration':{integration:1},'free-trade-zone':{trade:.5,foreignLinks:1},'grand-embassies':{attitude:15},'utopia-project':{stability:20},'psychohistory':{industry:.1,commerce:.1}
};
export function bonuses(e:Empire){const result:Record<string,number>={};for(const tech of e.techs)for(const [key,value] of Object.entries(effects[tech]||{}))result[key]=(result[key]||0)+value;if(e.techs.includes('hyperintelligence'))result.research=(result.research||0)-(e.techs.includes('artificial-general-intelligence')?.25:0);for(const [id,level] of Object.entries(e.repeatables||{})){const list:Record<string,Record<string,number>>={'advanced-propulsion':{supply:1,acceleration:.05},'advanced-weapons':{weaponDamage:.05},'advanced-materials':{armour:.05,buildingCost:-.02},'advanced-biology':{capacity:.03},'advanced-computing':{research:.03},'advanced-society':{stability:2,commerce:.03}};for(const [key,value] of Object.entries(list[id]||{}))result[key]=(result[key]||0)+value*level;}return result;}
