import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FormularioMultimedia } from './formulario-multimedia.entity';

@Entity('formularios_multimedia_fragmentos')
@Unique('uq_formularios_multimedia_fragmento_orden', ['idMultimedia', 'numero'])
export class FormularioMultimediaFragmento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_multimedia', type: 'uuid' })
  idMultimedia: string;

  @Column({ type: 'integer' })
  numero: number;

  @Column({ name: 'contenido', type: 'bytea' })
  contenido: Buffer;

  @ManyToOne(
    () => FormularioMultimedia,
    (multimedia) => multimedia.fragmentos,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'id_multimedia' })
  multimedia: FormularioMultimedia;
}
