import React from 'react';
import { ProyectoCard as ProyectoCardType } from '../../types/api';
import Card from '../../components/ui/Card';

interface ProjectListProps {
  projects: ProyectoCardType[];
}

/** Tags derivados de los catálogos tipo/área (el card real no trae `tags`). */
const tagsOf = (p: ProyectoCardType): string[] =>
  [p.tipo?.nombre, p.area?.nombre].filter((t): t is string => Boolean(t));

const ProjectCard: React.FC<{ project: ProyectoCardType }> = ({ project }) => {
  return (
    <Card className="flex flex-col h-full transition-transform duration-300 ease-in-out hover:scale-105">
      {project.imagenPrincipalUrl ? (
        <img src={project.imagenPrincipalUrl} alt={project.nombre} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-verde-hoja-seca/40 dark:bg-noche-selva/80" aria-hidden="true" />
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold font-serif text-carbon dark:text-beige-arena mb-2">{project.nombre}</h3>
        <p className="text-gris-piedra dark:text-beige-arena/80 text-sm mb-4 flex-grow">{project.descripcionCorta ?? ''}</p>
        <div className="flex flex-wrap gap-2">
          {tagsOf(project).map(tag => (
            <span key={tag} className="bg-terracota/20 text-terracota dark:bg-terracota/30 dark:text-beige-arena text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <div key={project.id}>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
