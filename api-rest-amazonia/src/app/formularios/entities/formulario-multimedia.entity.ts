import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empresa } from 'src/modules/gestion-empresarial/empresas/entities/empresa.entity';
import { Organizacion } from 'src/modules/gestion-organizacional/organizaciones/entities/organizacion.entity';
import { FormularioMultimediaFragmento } from './formulario-multimedia-fragmento.entity';

/**
 * Archivo enviado durante el registro público. El binario se guarda en la BD
 * dividido en fragmentos para no depender de rutas ni de almacenamiento local.
 */
@Entity('formularios_multimedia')
export class FormularioMultimedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'id_empresa', type: 'int', nullable: true })
  idEmpresa: number | null;

  @Column({ name: 'id_organizacion', type: 'int', nullable: true })
  idOrganizacion: number | null;

  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'tipo_mime', type: 'varchar', length: 255 })
  tipoMime: string;

  // PostgreSQL devuelve BIGINT como string para no perder precisión en JS.
  @Column({ name: 'tamano_bytes', type: 'bigint', default: '0' })
  tamanoBytes: string;

  @Column({ name: 'checksum_sha256', type: 'char', length: 64, nullable: true })
  checksumSha256: string | null;

  @Column({ name: 'orden', type: 'smallint' })
  orden: number;

  @Column({ name: 'autoriza_publicacion', type: 'boolean', default: false })
  autorizaPublicacion: boolean;

  @Column({ type: 'varchar', length: 16, default: 'pendiente' })
  estado: 'pendiente' | 'adjunto';

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Empresa, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_empresa' })
  empresa?: Empresa | null;

  @ManyToOne(() => Organizacion, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_organizacion' })
  organizacion?: Organizacion | null;

  @OneToMany(
    () => FormularioMultimediaFragmento,
    (fragmento) => fragmento.multimedia,
  )
  fragmentos: FormularioMultimediaFragmento[];
}
