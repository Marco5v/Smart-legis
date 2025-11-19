
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email);
    if (!success) {
      setError('Usuário não encontrado. Tente um dos e-mails de teste.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sapv-blue-dark text-sapv-gray-light">
      <div className="w-full max-w-md p-8 space-y-8 bg-sapv-blue-light rounded-lg shadow-xl">
        <div className="text-center">
            <div className="flex items-center justify-center gap-4" aria-label="Smart Legis Logo">
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 65 65"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="logoGradientLogin" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#64ffda" />
                      <stop offset="100%" stopColor="#00abe4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M49.4 56.5C47.9 56.5 46.7 55.3 46.7 53.8V9.2C46.7 7.7 47.9 6.5 49.4 6.5H51.9C53.4 6.5 54.6 7.7 54.6 9.2V46.7C54.6 48.2 53.4 49.4 51.9 49.4H10.1C8.6 49.4 7.4 48.2 7.4 46.7V9.2C7.4 7.7 8.6 6.5 10.1 6.5H29.2M31.3 49.4C31.3 49.4 30.1 56.5 26.3 56.5C22.5 56.5 21.4 49.4 21.4 49.4"
                    stroke="url(#logoGradientLogin)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.1 26.5L30 37.4L58.2 8.5"
                    stroke="url(#logoGradientLogin)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h1 className="text-4xl font-black text-white font-sans tracking-tight">
                  SMART LEGIS
                </h1>
            </div>
             <p className="mt-4 text-sapv-gray">
                Sistema de Votação
            </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sapv-gray-light">
              E-mail (Login Simulado)
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-dark border border-sapv-gray-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: presidente@sapv.gov"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
              Entrar
            </Button>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>
         <div className="text-xs text-sapv-gray text-center pt-4 border-t border-sapv-gray-dark">
            <p className="font-bold mb-2">E-mails de teste:</p>
            <ul className="list-disc list-inside">
                <li>presidente@sapv.gov (Presidente)</li>
                <li>controlador@sapv.gov (Operador)</li>
                <li>secretaria@sapv.gov</li>
                <li>adriano.ferreira@sapv.gov (Vereador)</li>
                 <li>publico@sapv.gov</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
