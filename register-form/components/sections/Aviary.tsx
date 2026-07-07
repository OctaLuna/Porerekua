import React, { useState } from 'react';
import Bird from './Bird';

interface BirdData {
  id: number;
  species: string;
  top: string;
  left: string;
  isFlying: boolean;
}

// Datos iniciales de las aves: especie y posición en la pantalla.
// Ajustadas para aparecer en el centro más 5% a la derecha, manteniendo separación.
const initialBirdsData: BirdData[] = [
  { id: 1, species: 'bird1', top: '15%', left: '50%', isFlying: false },
  { id: 2, species: 'bird2', top: '25%', left: '57%', isFlying: false },
  { id: 3, species: 'bird3', top: '18%', left: '63%', isFlying: false },
];

const Aviary: React.FC = () => {
  const [birds, setBirds] = useState(initialBirdsData);

  const handleMouseOver = (birdId: number) => {
    setBirds(currentBirds =>
      currentBirds.map(bird =>
        bird.id === birdId ? { ...bird, isFlying: true } : bird
      )
    );

    // Opcional: Hacer que el ave reaparezca después de un tiempo
    setTimeout(() => {
      setBirds(currentBirds =>
        currentBirds.map(bird =>
          bird.id === birdId ? { ...bird, isFlying: false } : bird
        )
      );
    }, 5000); // El ave vuelve a su posición original después de 5 segundos
  };

  return (
    <>
      {birds.map(bird => (
        <div key={bird.id} onMouseEnter={() => handleMouseOver(bird.id)} style={{ position: 'absolute', top: bird.top, left: bird.left, zIndex: 40 }}>
          <Bird 
            species={bird.species} 
            isFlying={bird.isFlying} 
            onInteraction={() => handleMouseOver(bird.id)}
          />
        </div>
      ))}
    </>
  );
};

export default Aviary;