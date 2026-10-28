import {deserialize,serialize} from '../../../packages/sim/src/engine';
import type {GameState} from '../../../packages/sim/src/types';
export const asset=(path:string)=>import.meta.env.BASE_URL+path.replace(/^\//,'');
export const short=(n:number)=>n>=1000?(n/1000).toFixed(1)+'k':Number.isInteger(n)?String(n):n.toFixed(1);
export type Settings={sound:boolean;music:number;effects:number;motion:boolean;hints:boolean;tutorial:boolean;scale:number;quality:'High'|'Low'};
export const DEFAULT_SETTINGS:Settings={sound:true,music:.35,effects:.45,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,hints:true,tutorial:true,scale:1,quality:'High'};
export function loadSettings():Settings{try{return {...DEFAULT_SETTINGS,...JSON.parse(localStorage.getItem('astralis-settings')||'{}')};}catch{return DEFAULT_SETTINGS;}}
let track:HTMLAudioElement|null=null;let current='';let config=loadSettings();let audioStarted=false;
export function configureAudio(settings:Settings){config=settings;if(track){track.volume=settings.sound?settings.music:0;if(audioStarted&&settings.sound)void track.play().catch(()=>{});else track.pause();}}
// Called synchronously by the start button, while browser user activation is active.
export function startAudio(settings:Settings){audioStarted=true;config=settings;if(!track)music('title-theme');else configureAudio(settings);}
export function music(name:string){if(name===current)return;track?.pause();current=name;track??=new Audio();track.src=asset(`assets/${name}.mp3`);track.loop=true;track.volume=config.sound?config.music:0;if(audioStarted&&config.sound)void track.play().catch(()=>{});}
export function effect(name='ui-confirm'){if(!audioStarted||!config.sound)return;const file=name==='discovery'?'discovery-ethereal.wav':`${name}.mp3`;const a=new Audio(asset(`assets/${file}`));a.volume=config.effects;void a.play().catch(()=>{});}
const dbPromise=new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open('astralis',1);req.onupgradeneeded=()=>req.result.createObjectStore('saves');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
export async function saveGame(state:GameState,slot='autosave'){const db=await dbPromise;await new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(JSON.stringify({...JSON.parse(serialize(state)),commander:Number(localStorage.getItem('astralis-last-seat')||0)}),slot);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});localStorage.setItem('astralis-last-save',JSON.stringify({turn:state.turn,empire:state.empires[0].name,slot}));}
export async function loadGame(slot='autosave'){const db=await dbPromise;const text=await new Promise<string|undefined>((resolve,reject)=>{const req=db.transaction('saves').objectStore('saves').get(slot);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});if(!text)return null;const state=deserialize(text);const owner=JSON.parse(text).commander;if(Number.isInteger(owner)&&state.empires[owner]&&!state.empires[owner].threat)localStorage.setItem('astralis-last-seat',String(owner));return state;}
export function download(name:string,text:string){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
