import {useEffect,useRef,useState} from 'react';
export function AnimatedValue({value,digits,suffix=''}:{value:number;digits?:number;suffix?:string}){
 const previous=useRef(value),[shown,setShown]=useState(value),[delta,setDelta]=useState(0);
 useEffect(()=>{const start=previous.current;previous.current=value;setDelta(value-start);if(document.documentElement.dataset.motion==='off'){setShown(value);const timer=setTimeout(()=>setDelta(0),2000);return()=>clearTimeout(timer);}let frame=0;const began=performance.now();const draw=(now:number)=>{const t=Math.min(1,(now-began)/750),ease=1-Math.pow(1-t,3);setShown(start+(value-start)*ease);if(t<1)frame=requestAnimationFrame(draw);};frame=requestAnimationFrame(draw);const timer=setTimeout(()=>setDelta(0),2000);return()=>{cancelAnimationFrame(frame);clearTimeout(timer);};},[value]);
 return <span className="animated-value">{shown>=1000?(shown/1000).toFixed(1)+'k':shown.toFixed(digits??(Number.isInteger(value)?0:1))}{suffix}{Math.abs(delta)>=.05&&<small key={value} className={'value-delta '+(delta>0?'positive':'negative')}>{delta>0?'+':''}{delta.toFixed(Math.abs(delta)<10?1:0)}</small>}</span>;
}
