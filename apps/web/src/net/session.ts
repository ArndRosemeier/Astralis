import {turnSubmissionError} from '../../../../packages/sim/src/turn-readiness';
import {GAMEHUB_APP_KEY} from './config';
import {connect,type GameHub,type RoomSummary} from './gamehub';
import type {Command,GameState} from '../../../../packages/sim/src/types';
import {applyCommand,processTurn,validateCommand} from '../../../../packages/sim/src/engine';
import {VERSION} from '../../../../packages/sim/src/rules';
type Seat={empire:number;token:string;peer:number;name:string};
type Packet={version:string;game:GameState;seats:Seat[];pending:Record<string,Command[]>;chat:{name:string;text:string}[];turnSeconds?:number;deadline?:number};
type Envelope={version:string;revision:number;gzip:string};
type Intent={type:'claim';token:string;name:string}|{type:'ready';token:string;orders:Command[]}|{type:'chat';text:string}|{type:'snapshot'};
export type NetworkInfo={code:string;host:boolean;name:string;seat:number;players:{name:string;empire:number;ready:boolean;connected:boolean}[];chat:{name:string;text:string}[];waiting:boolean;turnSeconds:number;secondsRemaining:number|null;researchHold:boolean};
async function encode(packet:Packet){const stream=new Blob([JSON.stringify(packet)]).stream().pipeThrough(new CompressionStream('gzip'));const bytes=new Uint8Array(await new Response(stream).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
async function decode(text:string){const bytes=Uint8Array.from(atob(text),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(stream).text()) as Packet;}
function timeout<T>(promise:Promise<T>,ms=10000){return new Promise<T>((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('GameHub did not respond in time. Please reconnect.')),ms);promise.then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);});});}
export class Multiplayer{
 hub:GameHub<Envelope,never,Intent>;packet:Packet|null=null;token='';name:string;revision=0;seen=-1;code='';closed=false;queue=Promise.resolve();disconnected=new Map<number,number>();clock:ReturnType<typeof setInterval>;
 onChange:(game:GameState,info:NetworkInfo)=>void;onError:(message:string)=>void;
 constructor(name:string,onChange:Multiplayer['onChange'],onError:Multiplayer['onError']){
  this.name=name;this.onChange=onChange;this.onError=onError;this.clock=setInterval(()=>this.tick(),1000);
  this.hub=connect({app:'astralis',appKey:GAMEHUB_APP_KEY,name});
  this.hub.on('state',(envelope)=>{void this.receive(envelope).catch(e=>onError(String(e)));});
  this.hub.on('msg',(message,from)=>{if(this.hub.isHost)void this.intent(message,from).catch(e=>onError(String(e)));});
  this.hub.on('need-snapshot',()=>this.publish());
  this.hub.on('host',()=>{if(this.hub.isHost&&this.packet)this.publish();this.notify();});
  this.hub.on('player-',()=>{this.notify();this.advance();});
  this.hub.on('close',()=>{if(!this.closed)onError('Connection lost. Your autosave is safe. Reconnect with the room code to reclaim your seat.');});
  this.hub.on('error',e=>onError('GameHub: '+e.code));
 }
 async create(game:GameState){await timeout(this.hub.ready);const room=await timeout(this.hub.create({name:`${this.name}'s expedition`,public:false,maxPlayers:game.options.players,meta:{version:VERSION,turn:game.turn}}));this.code=room.id;this.token=crypto.randomUUID();localStorage.setItem('astralis-seat-'+this.code,this.token);game=structuredClone(game);game.empires[0].ai=false;this.packet={version:VERSION,game,seats:[{empire:0,token:this.token,peer:this.hub.you!,name:this.name}],pending:{},chat:[]};this.publish();return room;}
 async join(code:string){await timeout(this.hub.ready);this.code=code.toUpperCase().trim();this.token=localStorage.getItem('astralis-seat-'+this.code)||crypto.randomUUID();localStorage.setItem('astralis-seat-'+this.code,this.token);const room=await timeout(this.hub.join(this.code));this.hub.send({type:'claim',token:this.token,name:this.name},this.hub.host!);await timeout(new Promise<void>(resolve=>{const check=()=>{if(this.closed)return resolve();if(this.packet?.seats.some(s=>s.token===this.token&&s.peer===this.hub.you))resolve();else setTimeout(check,100);};check();}));return room;}
 async receive(envelope:Envelope){if(envelope.version!==VERSION){this.onError('Game version mismatch. Reload Astralis on every device.');return;}const packet=await decode(envelope.gzip);if(envelope.revision<this.seen)return;this.seen=envelope.revision;this.revision=Math.max(this.revision,envelope.revision);this.packet=packet;this.notify();}
 async intent(message:Intent,from:number){if(!this.packet)return;const p=this.packet;if(message.type==='claim'){
   let seat=p.seats.find(s=>s.token===message.token);if(seat){if(this.hub.players.some(pl=>pl.id===seat!.peer)&&seat.peer!==from){this.hub.send({type:'snapshot'},from);return;}seat.peer=from;seat.name=message.name;p.game.empires[seat.empire].ai=false;}
   else{const empire=p.game.empires.find(e=>!e.eliminated&&!e.threat&&!p.seats.some(s=>s.empire===e.id));if(!empire){this.onError('No unclaimed empire seats remain.');return;}seat={empire:empire.id,token:message.token,peer:from,name:message.name};p.seats.push(seat);empire.ai=false;}this.publish();
  }else if(message.type==='ready'){const seat=p.seats.find(s=>s.token===message.token&&s.peer===from);if(!seat)return;if(message.orders.length>200)return;if(turnSubmissionError(p.game,seat.empire,message.orders))return;p.pending[seat.empire]=message.orders;p.game.empires[seat.empire].ready=true;this.publish();this.advance();
  }else if(message.type==='chat'){const sender=this.hub.players.find(p=>p.id===from);if(sender&&typeof message.text==='string'){p.chat.push({name:sender.name,text:message.text.slice(0,500)});p.chat=p.chat.slice(-50);this.publish();}}
  else this.publish();
 }
 submit(orders:Command[]){const seat=this.packet?.seats.find(s=>s.token===this.token);if(!this.packet||!seat)return false;const error=turnSubmissionError(this.packet.game,seat.empire,orders);if(error){this.onError(error);return false;}const message:Intent={type:'ready',token:this.token,orders};if(this.hub.isHost)void this.intent(message,this.hub.you!);else this.hub.send(message,this.hub.host!);return true;}
 say(text:string){if(!text.trim())return;const message:Intent={type:'chat',text};if(this.hub.isHost)void this.intent(message,this.hub.you!);else this.hub.send(message,this.hub.host!);}
 advance(){if(!this.hub.isHost||!this.packet)return;const p=this.packet;const connected=p.seats.filter(s=>this.hub.players.some(pl=>pl.id===s.peer)&&!p.game.empires[s.empire].eliminated);if(!connected.length||connected.some(s=>!p.game.empires[s.empire].ready||turnSubmissionError(p.game,s.empire,p.pending[s.empire]||[])))return;const orders=Object.values(p.pending).flat();p.game=processTurn(p.game,orders);p.pending={};if(p.turnSeconds)p.deadline=Date.now()+p.turnSeconds*1000;this.publish();}
 publish(){if(!this.packet||!this.hub.isHost)return;this.revision++;const revision=this.revision;const packet=structuredClone(this.packet);this.notify();this.queue=this.queue.then(async()=>{const gzip=await encode(packet);if(gzip.length>900000){this.onError('Network snapshot is too large. Export this game before continuing.');return;}if(!this.closed&&this.hub.isHost){this.hub.setState({version:VERSION,revision,gzip});this.hub.setRoom({meta:{version:VERSION,turn:packet.game.turn}});}}).catch(e=>this.onError(String(e)));}
 notify(){if(!this.packet)return;const p=this.packet,seat=p.seats.find(s=>s.token===this.token);if(!seat)return;this.onChange(p.game,{code:this.code||this.hub.room?.id||'',host:this.hub.isHost,name:this.name,seat:seat.empire,players:p.seats.map(s=>({name:s.name,empire:s.empire,ready:p.game.empires[s.empire].ready,connected:this.hub.players.some(pl=>pl.id===s.peer)})),chat:p.chat,waiting:p.game.empires[seat.empire].ready,turnSeconds:p.turnSeconds||0,researchHold:!!p.turnSeconds&&!p.deadline,secondsRemaining:p.turnSeconds&&p.deadline?Math.max(0,Math.ceil((p.deadline-Date.now())/1000)):null});}
 setTimer(seconds:number){if(!this.packet||!this.hub.isHost||![0,60,180,600].includes(seconds))return;this.packet.turnSeconds=seconds;this.packet.deadline=seconds?Date.now()+seconds*1000:undefined;this.publish();}
 tick(){if(!this.packet||this.closed)return;const p=this.packet;if(this.hub.isHost){let changed=false;for(const seat of p.seats){const connected=this.hub.players.some(pl=>pl.id===seat.peer);if(connected)this.disconnected.delete(seat.peer);else{if(!this.disconnected.has(seat.peer))this.disconnected.set(seat.peer,Date.now());if(Date.now()-this.disconnected.get(seat.peer)!>60000&&!p.game.empires[seat.empire].ai){p.game.empires[seat.empire].ai=true;changed=true;}}}if(p.turnSeconds&&p.deadline&&Date.now()>=p.deadline&&p.game.winner===null){for(const seat of p.seats.filter(s=>this.hub.players.some(pl=>pl.id===s.peer)))p.game.empires[seat.empire].ready=!turnSubmissionError(p.game,seat.empire,p.pending[seat.empire]||[]);p.deadline=undefined;this.publish();this.advance();return;}if(changed)this.publish();}if(p.turnSeconds)this.notify();}
 close(){this.closed=true;clearInterval(this.clock);this.hub.close();}
}
