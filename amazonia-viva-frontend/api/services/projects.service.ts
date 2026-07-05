import { Project, Foundation, Investigation } from '../../types/api';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Proyecto Reforestación Yacuma',
    description: 'Iniciativa comunitaria para reforestar 500 hectáreas de bosque primario afectado por la tala ilegal.',
    imageUrl: 'https://picsum.photos/seed/project1/600/400',
    location: { lat: -13.76, lng: -65.35 },
    tags: ['Reforestación', 'Comunidad', 'Conservación'],
    foundationId: 'f1',
  },
  {
    id: '2',
    name: 'Monitoreo de Vida Silvestre en Madidi',
    description: 'Uso de cámaras trampa y bioacústica para estudiar las poblaciones de jaguares en el parque nacional.',
    imageUrl: 'https://picsum.photos/seed/project2/600/400',
    location: { lat: -13.0, lng: -68.0 },
    tags: ['Biodiversidad', 'Investigación', 'Tecnología'],
    foundationId: 'f2',
  },
  {
    id: '3',
    name: 'Agua Limpia para Comunidades Tacana',
    description: 'Implementación de sistemas de recolección y purificación de agua de lluvia para comunidades indígenas.',
    imageUrl: 'https://picsum.photos/seed/project3/600/400',
    location: { lat: -14.4, lng: -67.5 },
    tags: ['Agua', 'Salud', 'Comunidad'],
    foundationId: 'f3',
  },
  {
    id: '4',
    name: 'Corredor Ecológico Amboró-Carrasco',
    description: 'Protección de un corredor biológico clave para la migración de especies en los valles subandinos.',
    imageUrl: 'https://picsum.photos/seed/project4/600/400',
    location: { lat: -17.5, lng: -64.5 },
    tags: ['Conservación', 'Corredor Ecológico'],
    foundationId: 'f1',
  },
  {
    id: '5',
    name: 'Cacao Sostenible del Beni',
    description: 'Fomento del cultivo de cacao orgánico bajo sistemas agroforestales para generar ingresos y conservar el bosque.',
    imageUrl: 'https://picsum.photos/seed/project5/600/400',
    location: { lat: -14.8, lng: -64.9 },
    tags: ['Economía Sostenible', 'Comunidad', 'Agroforestería'],
    foundationId: 'f3',
  },
  {
    id: '6',
    name: 'Educación Ambiental en Rurrenabaque',
    description: 'Programa educativo en escuelas locales para concienciar sobre la importancia de la conservación de la Amazonía.',
    imageUrl: 'https://picsum.photos/seed/project6/600/400',
    location: { lat: -14.44, lng: -67.52 },
    tags: ['Educación', 'Comunidad'],
    foundationId: 'f2',
  },
  {
    id: '7',
    name: 'Protección del Delfín Rosado (Bufeo)',
    description: 'Censo y monitoreo de la población de delfines de río en la cuenca del Mamoré para su protección.',
    imageUrl: 'https://picsum.photos/seed/project7/600/400',
    location: { lat: -13.0, lng: -65.2 },
    tags: ['Biodiversidad', 'Investigación'],
    foundationId: 'f2',
  },
  {
    id: '8',
    name: 'Manejo de Residuos en Cobija',
    description: 'Implementación de un sistema de gestión de residuos sólidos para reducir la contaminación en áreas urbanas amazónicas.',
    imageUrl: 'https://picsum.photos/seed/project8/600/400',
    location: { lat: -11.02, lng: -68.74 },
    tags: ['Salud', 'Comunidad', 'Saneamiento'],
    foundationId: 'f3',
  },
  {
    id: '9',
    name: 'Vigilancia Indígena del Territorio Isiboro Sécure',
    description: 'Equipamiento y capacitación a guardias indígenas para la vigilancia y protección contra la deforestación.',
    imageUrl: 'https://picsum.photos/seed/project9/600/400',
    location: { lat: -15.8, lng: -65.0 },
    tags: ['Conservación', 'Comunidad', 'Tecnología'],
    foundationId: 'f1',
  },
  {
    id: '10',
    name: 'Recuperación de Suelos Degradados en Pando',
    description: 'Proyecto piloto de recuperación de suelos mediante técnicas de biochar y compostaje en zonas de antigua ganadería.',
    imageUrl: 'https://picsum.photos/seed/project10/600/400',
    location: { lat: -10.5, lng: -67.8 },
    tags: ['Reforestación', 'Investigación'],
    foundationId: 'f1',
  }
];

const mockFoundations: Foundation[] = [
  {
    id: 'f1',
    name: 'Fundación Tierra Viva',
    description: 'Dedicados a la reforestación y la protección de corredores ecológicos en la Amazonía boliviana.',
    logoUrl: 'https://picsum.photos/seed/logo1/200/200',
  },
  {
    id: 'f2',
    name: 'Amazon Watch Bolivia',
    description: 'Monitoreamos la biodiversidad y abogamos por la protección de especies en peligro de extinción.',
    logoUrl: 'https://picsum.photos/seed/logo2/200/200',
  },
  {
    id: 'f3',
    name: 'Salud & Agua para Todos',
    description: 'Trabajamos con comunidades indígenas para mejorar el acceso a agua potable y servicios de saneamiento.',
    logoUrl: 'https://picsum.photos/seed/logo3/200/200',
  },
];

const mockInvestigations: Investigation[] = [
  {
    id: 'inv1',
    title: 'Impacto del Cambio Climático en los Patrones de Lluvia de la Amazonía',
    authors: ['Dr. Carlos Fernandez', 'Dra. Ana Gutiérrez'],
    summary: 'Un estudio longitudinal que analiza datos de 30 años para modelar los futuros escenarios hídricos en la cuenca amazónica.',
    imageUrl: 'https://picsum.photos/seed/inv1/600/400',
    pdfUrl: '#',
  },
  {
    id: 'inv2',
    title: 'El Rol del Jaguar como Especie Clave en el Ecosistema Madidi',
    authors: ['Dr. Roberto Suarez'],
    summary: 'Análisis de datos de cámaras trampa que revela la importancia del jaguar para el control de poblaciones y la salud del ecosistema.',
    imageUrl: 'https://picsum.photos/seed/inv2/600/400',
    pdfUrl: '#',
  },
];

export const getAllProjects = async (): Promise<Project[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockProjects), 500));
};

export const getAllFoundations = async (): Promise<Foundation[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockFoundations), 500));
};

export const getAllInvestigations = async (): Promise<Investigation[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockInvestigations), 500));
};