import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import './style.css';
import './refinements.css';
import './accessibility.css';
import './glowup.css';
import './cinematic-title.css';
import './ships.css';
import './moments.css';
import './world-portraits.css';
class Boundary extends React.Component<{children:React.ReactNode},{error:string|null}>{state={error:null as string|null};static getDerivedStateFromError(error:Error){return {error:error.message};}render(){return this.state.error?<main className="crash"><h1>Signal interrupted</h1><p>{this.state.error}</p><p>Your last autosave remains in this browser.</p><button onClick={()=>location.reload()}>Reconnect to Astralis</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<Boundary><App/></Boundary>);
