import React, { useState } from 'react';
import { loginWithGoogle, loginAsDemo } from '../services/storageService';
import { AlertCircle, UserCircle2, ArrowRight } from 'lucide-react';

const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestGuest, setSuggestGuest] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuggestGuest(false);
    try {
      await loginWithGoogle();
      onLogin();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
          setError('Inicio de sesión cancelado.');
      } else if (err.code === 'auth/configuration-not-found') {
          setError('Error de configuración. Revisa services/firebase.ts');
      } else if (err.code === 'auth/unauthorized-domain') {
          setError('Dominio no autorizado en Firebase (localhost/preview). ¡Usa el Modo Invitado para acceder!');
          setSuggestGuest(true);
      } else {
          setError(`Error: ${err.message || 'No se pudo conectar.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
        await loginAsDemo();
        onLogin();
    } catch (e) {
        setError('Error al iniciar modo demo.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 p-4 animate-fade-in transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-colors duration-200">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">PostFlow AI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Gestiona tus redes sociales con Inteligencia Artificial</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-3 ${suggestGuest ? 'opacity-50' : ''}`}
          >
            {loading && !suggestGuest ? (
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span>Continuar con Google</span>
                </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">O</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
                suggestGuest 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg ring-2 ring-indigo-300 dark:ring-indigo-700 scale-105' 
                : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
            }`}
          >
            <UserCircle2 size={20} />
            <span>Modo Invitado (Demo)</span>
            {suggestGuest && <ArrowRight size={18} className="animate-pulse" />}
          </button>
        </div>

        {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Configure firebase.ts con sus claves reales para producción.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;