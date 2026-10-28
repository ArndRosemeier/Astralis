export const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export const quant=(n:number)=>Math.round(n*1000)/1000;
export function seedHash(text:string){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return h>>>0||1;}
export function random(state:{rng:number}){let x=state.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;state.rng=x>>>0;return state.rng/4294967296;}
export const distance=(a:{x:number;y:number;z:number},b:{x:number;y:number;z:number})=>Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)+(a.z-b.z)*(a.z-b.z));
export function hash(value:unknown){return seedHash(JSON.stringify(value)).toString(16).padStart(8,'0');}
export function weighted<T>(state:{rng:number},values:T[]){return values[Math.floor(random(state)*values.length)]!;}
