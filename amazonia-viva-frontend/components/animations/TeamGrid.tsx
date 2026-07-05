import React, { useCallback, useRef, useState } from 'react';
import { gsap } from './gsap-setup';
import TeamModal from './TeamModal';

export interface TeamMember {
  initials: string;
  name: string;
  role: string;
  /** Foto opcional. Con foto → efecto grayscale→color; sin foto → avatar de iniciales. */
  photo?: string;
  bio?: string;
}

const GRAYSCALE_OUT = 'grayscale(100%) brightness(0.9)';
const GRAYSCALE_IN = 'grayscale(0%) brightness(1.05)';

const TeamCard: React.FC<{ member: TeamMember; onOpen: () => void }> = ({ member, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleEnter = () => {
    if (member.photo && imgRef.current) {
      gsap.to(imgRef.current, { filter: GRAYSCALE_IN, scale: 1.04, duration: 0.45, ease: 'power2.out' });
    }
    gsap.to(cardRef.current, { y: -4, duration: 0.3, ease: 'power2.out' });
  };

  const handleLeave = () => {
    if (member.photo && imgRef.current) {
      gsap.to(imgRef.current, { filter: GRAYSCALE_OUT, scale: 1, duration: 0.4, ease: 'power2.inOut' });
    }
    gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
  };

  return (
    <div
      ref={cardRef}
      className="team-card flex cursor-pointer flex-col items-center rounded-xl border border-carbon/10 bg-blanco-puro/95 p-4 text-center shadow-medium backdrop-blur-md transition-shadow duration-300 hover:shadow-lg dark:border-white/10 dark:bg-noche-selva/60 md:p-6"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {member.photo ? (
        <div className="team-img-wrap mb-3 w-full overflow-hidden rounded-lg md:mb-4" style={{ aspectRatio: '3 / 4' }}>
          <img
            ref={imgRef}
            className="team-img h-full w-full object-cover"
            style={{ filter: GRAYSCALE_OUT, willChange: 'filter, transform' }}
            src={member.photo}
            alt={member.name}
          />
        </div>
      ) : (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-verde-brote shadow-verde-glow md:mb-4 md:h-14 md:w-14">
          <span className="text-sm font-bold tracking-wide text-white md:text-lg">{member.initials}</span>
        </div>
      )}
      <h3 className="mb-1 font-serif text-sm font-bold leading-snug text-carbon dark:text-beige-arena md:mb-2 md:text-base">
        {member.name}
      </h3>
      <p className="text-xs leading-relaxed text-gris-piedra dark:text-beige-arena/60 md:text-sm">{member.role}</p>
    </div>
  );
};

const TeamGrid: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="team-grid grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {members.map((member) => (
          <TeamCard key={member.name} member={member} onOpen={() => setSelected(member)} />
        ))}
      </div>
      <TeamModal member={selected} onClose={handleClose} />
    </>
  );
};

export default TeamGrid;
