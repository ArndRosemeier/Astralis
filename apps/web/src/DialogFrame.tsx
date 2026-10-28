import type {ReactNode} from 'react';

/** Keep decoration outside the scrolling dialog so its edge stays in place. */
export function DialogFrame({children,setup=false}:{children:ReactNode;setup?:boolean}){
  return <div className={`dialog-frame${setup?' dialog-frame--setup':''}`}>{children}</div>;
}
