import * as THREE from 'three';

const suns=[
 {name:'Golden sun',core:'#fff2c5',corona:'#ff9c36'},
 {name:'Blue-white sun',core:'#edf7ff',corona:'#78b9ff'},
 {name:'Rose sun',core:'#ffe7d1',corona:'#ff796f'},
 {name:'Pearl sun',core:'#fffbe9',corona:'#d4b1ff'},
];
export const chooseTitleSun=(random=Math.random)=>suns[Math.floor(random()*suns.length)];
export type TitleSun=typeof suns[number];
export function createTitleSun(profile:TitleSun){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{time:{value:0},coreColor:{value:new THREE.Color(profile.core)},coronaColor:{value:new THREE.Color(profile.corona)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float time;uniform vec3 coreColor;uniform vec3 coronaColor;
   float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
   float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
     mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
   void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);
    float flow=sin(a*9.+time*.18)+.4*sin(a*17.-time*.12);
    float disk=1.-smoothstep(.245,.26,r+.0025*flow);
    float halo=exp(-max(0.,r-.25)*(7.+flow*.65));
    float rays=pow(max(0.,sin(a*6.+time*.025)),12.)*exp(-r*3.8)*.5;
    float loops=exp(-abs(r-(.285+.035*sin(a*3.+time*.12)))*65.)*pow(max(0.,sin(a*4.-time*.07)),10.)*.42;
    float fade=1.-smoothstep(.78,1.,r);
    float mu=sqrt(max(0.,1.-pow(r/.26,2.)));
    vec3 surface=vec3(p/.26,mu)+vec3(time*.025,0,time*.012);
    float cells=noise(surface*24.)*.65+noise(surface*49.)*.35;
    float spots=smoothstep(.70,.88,noise(surface*5.));
    vec3 photosphere=mix(coronaColor,coreColor,.28+mu*.64)*(.66+cells*.42-spots*.35);
    float alpha=(disk*.98+halo*.42+rays+loops)*fade;
    vec3 color=mix(coronaColor,photosphere,disk);
    gl_FragColor=vec4(color,alpha);
   }`});
 return {mesh:new THREE.Mesh(new THREE.PlaneGeometry(1,1),material),update:(time:number)=>{material.uniforms.time.value=time;}};
}
