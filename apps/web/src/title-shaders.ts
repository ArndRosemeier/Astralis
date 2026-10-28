// Continuous 3D noise keeps the spherical surfaces seamless at the longitude seam.
export const noiseGLSL=`
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise3(p);p=p*2.03+vec3(7.1,3.7,1.9);a*=.5;}return v;}
`;
export const sphereVertex=`varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;
void main(){vLocal=position;vWorld=(modelMatrix*vec4(position,1.)).xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`;
export const planetFragment=`
uniform vec3 sun;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;
${noiseGLSL}
void main(){vec3 p=normalize(vLocal),n=normalize(vNormal),eye=normalize(cameraPosition-vWorld);
float terrain=fbm(p*3.6+vec3(4.2,1.,7.));float detail=fbm(p*32.);float land=smoothstep(.515,.53,terrain);
float latitude=abs(p.y);float dry=fbm(p*6.+12.);float mountains=smoothstep(.56,.68,terrain+detail*.09);
vec3 ocean=mix(vec3(.008,.035,.11),vec3(.02,.30,.37),smoothstep(.47,.53,terrain));
vec3 ground=mix(vec3(.055,.17,.095),vec3(.38,.29,.14),smoothstep(.43,.63,dry+latitude*.1));ground=mix(ground,vec3(.32,.33,.32),mountains);ground*=.75+detail*.6;
float ice=smoothstep(.78,.93,latitude+noise3(p*22.)*.07);ground=mix(ground,vec3(.81,.89,.93),smoothstep(.64,.76,mountains*.25+latitude*.5));
vec3 color=mix(ocean,ground,land);color=mix(color,vec3(.78,.88,.94),ice);
float day=dot(n,sun);float diffuse=max(day,0.);vec3 halfV=normalize(sun+eye);float spec=pow(max(dot(n,halfV),0.),75.)*(1.-land)*(1.-ice);
vec3 lit=color*(.035+diffuse*1.5)+vec3(.88,.86,.68)*spec*.6;
float coast=1.-smoothstep(.01,.09,abs(terrain-.535));float cities=pow(noise3(p*160.),18.)*coast*land*(1.-ice);
lit+=vec3(1.,.62,.22)*cities*5.*(1.-smoothstep(-.15,.12,day));
float rim=pow(1.-max(dot(n,eye),0.),3.);lit+=vec3(.08,.32,.65)*rim*smoothstep(-.35,.4,day)*.48;
gl_FragColor=vec4(lit,1.);}
`;
export const cloudsFragment=`uniform vec3 sun;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;${noiseGLSL}
void main(){vec3 p=normalize(vLocal);float twist=fbm(p*4.);float cover=fbm(p*8.+vec3(twist*3.,0.,twist));float cloud=smoothstep(.52,.69,cover)*.88;float day=dot(normalize(vNormal),sun);vec3 tint=mix(vec3(.12,.18,.29),vec3(.95,.96,1.),smoothstep(-.1,.6,day));gl_FragColor=vec4(tint,cloud);}`;
export const atmosphereFragment=`uniform vec3 sun;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;
void main(){vec3 n=normalize(vNormal),eye=normalize(cameraPosition-vWorld);float rim=pow(1.-abs(dot(n,eye)),3.5);float day=dot(n,sun);float light=smoothstep(-.35,.65,day);vec3 tint=mix(vec3(.75,.23,.08),vec3(.12,.48,1.),smoothstep(-.08,.35,day));gl_FragColor=vec4(tint,rim*light*.65);}`;
export const moonFragment=`uniform vec3 sun;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;${noiseGLSL}
void main(){vec3 p=normalize(vLocal);float grain=fbm(p*28.);float maria=fbm(p*5.);float crater=0.;vec3 grid=p*18.;vec3 cell=floor(grid);for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 c=cell+vec3(float(x),float(y),float(z));vec3 center=c+vec3(hash(c),hash(c+3.),hash(c+7.));float d=length(grid-center);float radius=.15+hash(c+11.)*.22;crater+=exp(-pow((d-radius)*25.,2.))*.15-exp(-pow(d/radius*1.5,2.))*.16;}
vec3 color=mix(vec3(.19,.20,.23),vec3(.53,.51,.47),smoothstep(.35,.65,maria))*(.75+grain*.5)+crater;float day=max(dot(normalize(vNormal),sun),0.);gl_FragColor=vec4(color*(.045+day*1.5),1.);}`;
