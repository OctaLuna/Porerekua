import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../../hooks/useUI';
import { solicitarAcceso } from '../../../services/solicitudes.service';
import { ApiError } from '../../../services/apiClient';
import Button from '../../ui/Button';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const inputClass = "w-full px-4 py-2.5 rounded-lg bg-blanco-puro dark:bg-verde-hoja-seca border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-verde-brote dark:focus:ring-verde-brote focus:border-transparent transition-all duration-300";

const RegistrationPanel: React.FC = () => {
    const { closePanel } = useUI();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [institucion, setInstitucion] = useState('');
    const [proposito, setProposito] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closePanel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closePanel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await solicitarAcceso({
                nombreSolicitante: nombre,
                emailSolicitante: email,
                institucion,
                proposito,
            });
            setSuccess(true);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 409 ? 'Ya existe una solicitud con este correo.' : err.message);
            } else {
                setError('No se pudo enviar la solicitud. Intenta de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-fibra-natural dark:bg-carbon rounded-lg shadow-2xl w-full max-w-lg relative p-8 text-carbon dark:text-beige-arena"
            >
                <button
                    onClick={closePanel}
                    className="absolute top-4 right-4 text-gris-piedra hover:text-carbon dark:hover:text-beige-arena transition-colors"
                    aria-label="Cerrar panel de registro"
                >
                    <XIcon />
                </button>

                {success ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-verde-brote rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blanco-puro" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-gris-piedra dark:text-beige-arena/80 mb-6">
                            Revisaremos tu solicitud de acceso y te contactaremos por correo.
                        </p>
                        <Button onClick={closePanel} className="w-full h-12 text-base">Cerrar</Button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold font-serif text-carbon dark:text-beige-arena">
                                Solicitud de Investigador
                            </h2>
                            <p className="text-gris-piedra mt-2">
                                Completa el formulario para solicitar acceso a la plataforma.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {error && (
                                    <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-4 py-2.5">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="reg-name" className="block text-sm font-medium text-gris-piedra dark:text-beige-arena/80 mb-1">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        id="reg-name"
                                        required
                                        minLength={2}
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className={inputClass}
                                        placeholder="Ej: Dra. Jane Goodall"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reg-email" className="block text-sm font-medium text-gris-piedra dark:text-beige-arena/80 mb-1">
                                        Correo Electrónico Institucional
                                    </label>
                                    <input
                                        type="email"
                                        id="reg-email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClass}
                                        placeholder="tu@institucion.edu"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reg-institucion" className="block text-sm font-medium text-gris-piedra dark:text-beige-arena/80 mb-1">
                                        Institución u Organización
                                    </label>
                                    <input
                                        type="text"
                                        id="reg-institucion"
                                        required
                                        minLength={2}
                                        value={institucion}
                                        onChange={(e) => setInstitucion(e.target.value)}
                                        className={inputClass}
                                        placeholder="Ej: Instituto de Investigación Amazónica"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reg-proposito" className="block text-sm font-medium text-gris-piedra dark:text-beige-arena/80 mb-1">
                                        Propósito de la investigación
                                    </label>
                                    <textarea
                                        id="reg-proposito"
                                        required
                                        minLength={20}
                                        maxLength={1000}
                                        rows={4}
                                        value={proposito}
                                        onChange={(e) => setProposito(e.target.value)}
                                        className={inputClass}
                                        placeholder="Describe tu área de investigación y por qué necesitas acceso (mínimo 20 caracteres)..."
                                    />
                                </div>
                                <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                                    {submitting ? 'Enviando…' : 'Enviar Solicitud'}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default RegistrationPanel;
