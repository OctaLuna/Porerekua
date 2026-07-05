// Central GSAP plugin registration. Import from here (not from `gsap` directly)
// in animation components so every plugin is registered exactly once.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// SplitText/ScrambleText are free since GSAP 3.13 — no Club license needed.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };
