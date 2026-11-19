import type { CSSProperties } from 'react'

/** Position of an element in a staggered sequence (read by the motion CSS as --i). */
export const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Before first paint, MOTION_BOOT puts data-motion on <html> unless the visitor prefers
 * reduced motion. If the page has not hydrated after 4 s (slow device, script error),
 * it removes it again, so content hidden for a reveal can never stay hidden.
 */
export const MOTION_BOOT = `(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('data-motion','');setTimeout(function(){if(!d.hasAttribute('data-motion-ready'))d.removeAttribute('data-motion')},4000)}catch(e){}})()`
