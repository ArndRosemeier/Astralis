import * as THREE from 'three';

type Outline=number[][];
const glyphs:Record<string,{outer:Outline;hole?:Outline;width:number}>={
 A:{width:.94,outer:[[0,0],[.29,1.14],[.65,1.14],[.94,0],[.69,0],[.61,.3],[.31,.3],[.24,0]],hole:[[.37,.53],[.55,.53],[.46,.92]]},
 S:{width:.86,outer:[[.04,0],[.69,0],[.86,.18],[.86,.51],[.69,.67],[.25,.67],[.25,.91],[.83,.91],[.83,1.14],[.18,1.14],[0,.96],[0,.64],[.17,.46],[.6,.46],[.6,.23],[.04,.23]]},
 T:{width:.92,outer:[[0,.91],[.33,.91],[.33,0],[.59,0],[.59,.91],[.92,.91],[.92,1.14],[0,1.14]]},
 R:{width:.93,outer:[[0,0],[.25,0],[.25,.43],[.45,.43],[.67,0],[.95,0],[.68,.49],[.86,.65],[.86,.96],[.68,1.14],[0,1.14]],hole:[[.25,.67],[.59,.67],[.62,.7],[.62,.88],[.59,.91],[.25,.91]]},
 L:{width:.8,outer:[[0,0],[.8,0],[.8,.24],[.26,.24],[.26,1.14],[0,1.14]]},
 I:{width:.42,outer:[[0,0],[.42,0],[.42,.18],[.33,.18],[.33,.96],[.42,.96],[.42,1.14],[0,1.14],[0,.96],[.09,.96],[.09,.18],[0,.18]]},
};
const path=(points:Outline)=>new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));

/** Authored solid letterforms, with real bevels, cut-outs, extrusion and inlaid light. */
export function createTitleLettering(){
 const root=new THREE.Group();root.name='ASTRALIS sculpture';
 const face=new THREE.MeshStandardMaterial({color:'#dfd9ce',metalness:.8,roughness:.24});
 const edge=new THREE.MeshStandardMaterial({color:'#937351',metalness:.85,roughness:.3});
 const dark=new THREE.MeshStandardMaterial({color:'#0c1729',metalness:.65,roughness:.35});
 const seam=new THREE.MeshBasicMaterial({color:'#8cdfff'});
 const letters:THREE.Group[]=[];let x=0;
 for(const [index,char] of [...'ASTRALIS'].entries()){
  const glyph=glyphs[char],shape=path(glyph.outer);if(glyph.hole)shape.holes.push(path(glyph.hole));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.18+index%3*.035,steps:1,bevelEnabled:true,bevelThickness:.035,bevelSize:.025,bevelSegments:2,curveSegments:1});
  geometry.translate(-glyph.width/2,-.57,0);
  const letter=new THREE.Group();letter.userData.homeX=x+glyph.width/2;letter.position.x=letter.userData.homeX;
  const core=new THREE.Mesh(geometry,[face,edge]);letter.add(core);
  const back=new THREE.Mesh(geometry,dark);back.position.z=-.09;back.scale.set(1.045,1.045,1);letter.add(back);
  // Sparse, inset light seams give the letters the feel of assembled artifacts.
  const inlay=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.12,glyph.width*.28),.012,.018),seam);
  inlay.position.set(glyph.width*.1,index%2?.46:-.46,.245);letter.add(inlay);
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:'#342d3d',transparent:true,opacity:.65}));letter.add(outline);
  root.add(letter);letters.push(letter);x+=glyph.width+.16;
 }
 const width=x-.16;for(const letter of letters){letter.userData.homeX-=width/2;letter.position.x=letter.userData.homeX;}
 const dust=new THREE.Group();root.add(dust);
 const chips:THREE.Mesh[]=[];
 for(let i=0;i<22;i++){const chip=new THREE.Mesh(new THREE.OctahedronGeometry(.025+(i%3)*.012,0),i%3?edge:seam);dust.add(chip);chips.push(chip);}
 const halo=new THREE.Mesh(new THREE.PlaneGeometry(width*1.2,2.9),new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uv0;void main(){vec2 p=(uv0-.5)*2.;float a=exp(-dot(p*vec2(1.,1.6),p*vec2(1.,1.6))*2.4)*.58;gl_FragColor=vec4(.015,.025,.06,a);}'}));halo.position.z=-.25;root.add(halo);
 function update(time:number,surprise:number){
  const age=time-surprise,envelope=age>=0&&age<5?Math.sin(age/5*Math.PI)**2:0;
  letters.forEach((letter,i)=>{
   const stagger=envelope*Math.sin(age*1.1+i*.55);
   const progress=THREE.MathUtils.smoothstep(age-i*.16,0,3.5);
   const roll=age>=0&&age<5?progress*Math.PI*2:0;
   letter.position.set(letter.userData.homeX*(1+envelope*.045),Math.sin(time*.55+i*.65)*.015+stagger*.24,envelope*Math.sin(i*.8)*.45);
   letter.rotation.set(Math.sin(time*.28+i)*.025+roll,Math.sin(time*.25+i)*.025+stagger*.45,stagger*.12);
  });
  chips.forEach((chip,i)=>{const angle=time*.18+i*2.4;chip.position.set(Math.cos(angle)*(.7+i/22*width*.52),Math.sin(angle)*(.68+envelope*.35),Math.sin(angle*.6)*.35);chip.rotation.set(time*.4+i,time*.2+i,angle);chip.scale.setScalar(.5+envelope*1.4);});
 }
 return {root,width,height:1.28,update};
}
