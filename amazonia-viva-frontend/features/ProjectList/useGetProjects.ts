import { useQuery } from '@tanstack/react-query';
import { getAllProjects, getAllFoundations, getAllInvestigations } from '../../api/services/projects.service';
import { Project, Foundation, Investigation } from '../../types/api';

export const useGetProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  });
};

export const useGetFoundations = () => {
  return useQuery<Foundation[], Error>({
    queryKey: ['foundations'],
    queryFn: getAllFoundations,
  });
};

export const useGetInvestigations = () => {
  return useQuery<Investigation[], Error>({
    queryKey: ['investigations'],
    queryFn: getAllInvestigations,
  });
};