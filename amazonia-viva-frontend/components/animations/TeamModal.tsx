import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap, SplitText } from './gsap-setup';
import type { TeamMember } from './TeamGrid';

interface Props {
  member: TeamMember | null;
  onClose: () => void;
}

/**
 * Side panel (estilo Wolverine) rendered via portal to `document.body` so it is
 * never clipped by an ancestor's `overflow`. Slides in from the right with GSAP,
 * animates the name with SplitText, and closes on ✕ / overlay / Escape.
 */
const TeamModal: React.FC<Props> = ({ member, onClose }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!member) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(panelRef.current, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power3.out' });

      if (nameRef.current) {
        const split = new SplitText(nameRef.current, { type: 'chars' });
        gsap.from(split.chars, { yPercent: 60, autoAlpha: 0, duration: 0.5, stagger: 0.025, ease: 'back.out(1.5)', delay: 0.2 });
      }
      gsap.from('.modal-anim', { y: 25, autoAlpha: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.35 });
    }, rootRef);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      ctx.revert();
    };
  }, [member, onClose]);

  if (!member) return null;

  return createPortal(
    <div ref={rootRef} className="team-modal fixed inset-0 z-[9999] flex justify-end" role="dialog" aria-modal="true" aria-label={member.name}>
      <div ref={overlayRef} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-10 flex h-full w-full flex-col gap-6 overflow-y-auto bg-noche-selva p-8 text-beige-arena sm:p-10 md:w-[45%] md:max-w-[600px]"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
        >
          ✕
        </button>
        <h3 id="modal-name" ref={nameRef} aria-label={member.name} className="mt-8 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {member.name}
        </h3>
        <p className="modal-anim text-sm uppercase tracking-widest text-amarillo-sol">{member.role}</p>
        {member.photo && (
          <img className="modal-anim w-full max-w-xs rounded-lg object-cover" style={{ aspectRatio: '4 / 5' }} src={member.photo} alt={member.name} />
        )}
        <p className="modal-anim text-sm leading-relaxed text-beige-arena/70">{member.bio || member.role}</p>
      </div>
    </div>,
    document.body,
  );
};

export default TeamModal;
