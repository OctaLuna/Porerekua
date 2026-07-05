import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../../hooks/useUI';
import { useAuth } from '../../../hooks/useAuth';
import { ApiError } from '../../../services/apiClient';
import Button from '../../ui/Button';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const LoginPanel: React.FC = () => {
    const { closePanel, openRegistrationPanel } = useUI();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            closePanel();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 401 ? 'Correo o contraseña incorrectos.' : err.message);
            } else {
                setError('No se pudo conectar con el servidor. Intenta de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closePanel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closePanel]);

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
                className="bg-fibra-natural dark:bg-carbon rounded-lg shadow-2xl w-full max-w-md relative p-8 text-carbon dark:text-beige-arena"
            >
                <button
                    onClick={closePanel}
                    className="absolute top-4 right-4 text-gris-piedra hover:text-carbon dark:hover:text-beige-arena transition-colors"
                    aria-label="Cerrar panel de inicio de sesión"
                >
                    <XIcon />
                </button>
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-serif text-carbon dark:text-beige-arena">
                        Bienvenido de vuelta
                    </h2>
                    <p className="text-gris-piedra mt-2">
                        Accede para gestionar tus proyectos.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {error && (
                            <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-4 py-2.5">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email-login" className="block text-sm font-medium text-gris-piedra dark:text-beige-arena/80 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email-login"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-blanco-puro dark:bg-verde-hoja-seca border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-verde-brote dark:focus:ring-verde-brote focus:border-transparent transition-all duration-300"
                                placeholder="tu@ejemplo.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="password" className="block text-sm font-medium text-gris-piedra dark:text-beige-arena/80 mb-1">
                                    Contraseña
                                </label>
                                <a href="#" className="text-sm text-terracota hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-blanco-puro dark:bg-verde-hoja-seca border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-verde-brote dark:focus:ring-verde-brote focus:border-transparent transition-all duration-300"
                                placeholder="••••••••"
                            />
                        </div>
                        <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                            {submitting ? 'Ingresando…' : 'Ingresar'}
                        </Button>
                    </div>
                </form>
                
                <div className="text-center mt-8">
                    <p className="text-sm text-gris-piedra">
                        ¿Deseas abrir una cuenta de investigador?{' '}
                        <button onClick={openRegistrationPanel} className="font-semibold text-verde-brote hover:text-verde-oscuro hover:underline focus:outline-none">
                            Rellena el formulario
                        </button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoginPanel;