import React, { useState, useEffect } from 'react';
import { CompanyProfile, Platform, SocialConnection } from '../types';
import { 
    getCompanyProfile, 
    getCurrentUser, 
    saveCompanyProfile,
    getSocialConnection,
    saveSocialConnection
} from '../services/storageService';
import { 
    Building2, 
    Link, 
    Save, 
    Twitter, 
    Linkedin, 
    Instagram, 
    Facebook,
    CheckCircle2,
    XCircle,
    Key,
    Lock,
    Eye,
    EyeOff,
    HelpCircle,
    ExternalLink
} from 'lucide-react';

const CompanySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile');
  
  // Profile State
  const [profile, setProfile] = useState<CompanyProfile>({
    userId: '', name: '', industry: '', tone: '', description: '', keywords: []
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const existing = getCompanyProfile();
    if (existing) setProfile(existing);
    else {
      const user = getCurrentUser();
      if(user) setProfile(p => ({...p, userId: user.uid}));
    }
  }, []);

  const handleSaveProfile = () => {
    saveCompanyProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Building2 className="text-indigo-600" />
            Configuración
        </h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-6 font-medium text-sm transition-colors relative ${
                    activeTab === 'profile' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
            >
                Perfil de Empresa
                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button
                onClick={() => setActiveTab('integrations')}
                className={`pb-4 px-6 font-medium text-sm transition-colors relative ${
                    activeTab === 'integrations' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
            >
                Integraciones API
                {activeTab === 'integrations' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
        </div>

        {/* CONTENT */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
                <div className="space-y-6 max-w-2xl">
                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Empresa</label>
                        <input 
                            type="text" 
                            value={profile.name} 
                            onChange={e => setProfile({...profile, name: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industria</label>
                            <input 
                            type="text" 
                            value={profile.industry} 
                            onChange={e => setProfile({...profile, industry: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Ej. Tecnología, Moda..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tono de Voz</label>
                            <select 
                            value={profile.tone}
                            onChange={e => setProfile({...profile, tone: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            >
                            <option value="">Selecciona...</option>
                            <option value="Profesional">Profesional</option>
                            <option value="Amigable">Amigable</option>
                            <option value="Humorístico">Humorístico</option>
                            <option value="Inspirador">Inspirador</option>
                            <option value="Autoritario">Autoritario</option>
                            </select>
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción corta</label>
                        <textarea 
                            value={profile.description} 
                            onChange={e => setProfile({...profile, description: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            rows={4}
                            placeholder="Describe qué hace tu empresa y cuál es su misión..."
                        />
                        </div>
                        <button 
                        onClick={handleSaveProfile}
                        className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all transform active:scale-95 ${
                            profileSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                        >
                        <Save size={18} />
                        {profileSaved ? 'Guardado' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <IntegrationCard 
                        platform={Platform.Twitter}
                        icon={Twitter}
                        color="text-sky-500"
                        fields={[
                            { key: 'apiKey', label: 'API Key (Consumer Key)' },
                            { key: 'apiSecret', label: 'API Secret (Consumer Secret)' },
                            { key: 'accessToken', label: 'Access Token' },
                            { key: 'accessSecret', label: 'Access Token Secret' },
                        ]}
                        guide={{
                            steps: [
                                "Ve al Developer Portal > Dashboard > Project App.",
                                "En 'Keys and Tokens' > 'Consumer Keys', regenera para obtener API Key y Secret.",
                                "En 'Authentication Tokens', genera Access Token y Secret.",
                                "Asegúrate de configurar los permisos de la App como 'Read and Write'."
                            ],
                            url: "https://developer.twitter.com/en/portal/dashboard"
                        }}
                    />
                    <IntegrationCard 
                        platform={Platform.LinkedIn}
                        icon={Linkedin}
                        color="text-blue-700"
                        fields={[
                            { key: 'clientId', label: 'Client ID' },
                            { key: 'clientSecret', label: 'Client Secret' },
                        ]}
                        guide={{
                            steps: [
                                "Ve a LinkedIn Developers > My Apps > Create App.",
                                "En la pestaña 'Auth', copia el Client ID y Client Secret.",
                                "En 'Products', solicita acceso a 'Share on LinkedIn' y 'Sign In with LinkedIn'.",
                                "Verifica tu página de empresa en la configuración de la App."
                            ],
                            url: "https://www.linkedin.com/developers/apps"
                        }}
                    />
                    <IntegrationCard 
                        platform={Platform.Instagram}
                        icon={Instagram}
                        color="text-pink-600"
                        fields={[
                            { key: 'accessToken', label: 'Access Token' },
                            { key: 'pageId', label: 'Instagram Business ID' },
                        ]}
                        guide={{
                            steps: [
                                "Ve a Meta for Developers > Tools > Graph API Explorer.",
                                "Selecciona tu App. En 'User or Page', selecciona 'Get Page Access Token'.",
                                "Autoriza los permisos (pages_show_list, instagram_basic, instagram_content_publish).",
                                "Copia el Token generado.",
                                "Para obtener el ID: En el Explorer, haz GET a 'me?fields=instagram_business_account'."
                            ],
                            url: "https://developers.facebook.com/tools/explorer/"
                        }}
                    />
                    <IntegrationCard 
                        platform={Platform.Facebook}
                        icon={Facebook}
                        color="text-blue-600"
                        fields={[
                            { key: 'accessToken', label: 'Page Access Token' },
                            { key: 'pageId', label: 'Page ID' },
                        ]}
                        guide={{
                            steps: [
                                "Ve a Meta for Developers > Tools > Graph API Explorer.",
                                "Selecciona tu App. En 'User or Page', selecciona tu Página de Facebook.",
                                "Copia el 'Page Access Token' que se genera automáticamente.",
                                "Para el Page ID: Ve a tu Página de Facebook > Configuración > Información de la página, o haz GET a 'me?fields=id' en el Explorer."
                            ],
                            url: "https://developers.facebook.com/tools/explorer/"
                        }}
                    />
                </div>
            )}
        </div>
    </div>
  );
};

// --- SUB-COMPONENT: INTEGRATION CARD ---

const IntegrationCard: React.FC<{
    platform: Platform,
    icon: any,
    color: string,
    fields: {key: string, label: string}[],
    guide?: { steps: string[], url: string }
}> = ({ platform, icon: Icon, color, fields, guide }) => {
    const [connection, setConnection] = useState<SocialConnection>({
        platform,
        isConnected: false,
        credentials: {}
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showKeys, setShowKeys] = useState(false);

    useEffect(() => {
        const stored = getSocialConnection(platform);
        if (stored) {
            setConnection(stored);
        } else {
            // Initialize empty credentials based on fields
            const initialCreds: Record<string, string> = {};
            fields.forEach(f => initialCreds[f.key] = '');
            setConnection(prev => ({...prev, credentials: initialCreds}));
        }
    }, [platform, fields]);

    const handleSave = () => {
        // Simple mock validation: check if all fields have some value
        const allFilled = fields.every(f => connection.credentials[f.key]?.trim().length > 0);
        
        const newConnection = {
            ...connection,
            isConnected: allFilled
        };
        
        setConnection(newConnection);
        saveSocialConnection(newConnection);
        setIsEditing(false);
        setShowHelp(false);
    };

    const handleDisconnect = () => {
        const resetConnection = {
            platform,
            isConnected: false,
            credentials: {}
        };
        // Reset fields
        const emptyCreds: Record<string, string> = {};
        fields.forEach(f => emptyCreds[f.key] = '');
        resetConnection.credentials = emptyCreds;

        setConnection(resetConnection);
        saveSocialConnection(resetConnection);
        setIsEditing(false);
    }

    return (
        <div className={`border rounded-xl p-5 transition-all ${
            connection.isConnected 
            ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900/30 shadow-sm' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-90'
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${color}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{platform}</h3>
                        <p className={`text-xs font-medium flex items-center gap-1 ${
                            connection.isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                        }`}>
                            {connection.isConnected ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {connection.isConnected ? 'Conectado' : 'Desconectado'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing && guide && (
                        <button 
                            onClick={() => setShowHelp(!showHelp)}
                            className={`p-1.5 rounded-md transition-colors ${
                                showHelp 
                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' 
                                : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            title="¿Cómo obtener credenciales?"
                        >
                            <HelpCircle size={16} />
                        </button>
                    )}
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                    >
                        {isEditing ? 'Cancelar' : 'Configurar'}
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="mt-4 animate-fade-in border-t border-gray-100 dark:border-gray-700 pt-4">
                    
                    {/* HELP SECTION */}
                    {showHelp && guide && (
                        <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 text-sm">
                            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                                <HelpCircle size={14} /> Cómo obtener las Keys:
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 text-xs mb-3">
                                {guide.steps.map((step, idx) => (
                                    <li key={idx} className="leading-relaxed">{step}</li>
                                ))}
                            </ol>
                            <a 
                                href={guide.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                            >
                                Ir al portal de desarrolladores <ExternalLink size={10} />
                            </a>
                        </div>
                    )}

                    {/* FIELDS */}
                    <div className="space-y-3">
                        {fields.map(field => (
                            <div key={field.key}>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showKeys ? "text" : "password"}
                                        value={connection.credentials[field.key] || ''}
                                        onChange={(e) => setConnection(prev => ({
                                            ...prev,
                                            credentials: { ...prev.credentials, [field.key]: e.target.value }
                                        }))}
                                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                        placeholder={`Ingrese ${field.label}`}
                                    />
                                    <div className="absolute right-3 top-2.5 text-gray-400">
                                        <Key size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex items-center justify-between pt-2">
                            <button 
                                type="button" 
                                onClick={() => setShowKeys(!showKeys)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                            >
                                {showKeys ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showKeys ? 'Ocultar Keys' : 'Mostrar Keys'}
                            </button>
                            <div className="flex gap-2">
                                {connection.isConnected && (
                                    <button 
                                        onClick={handleDisconnect}
                                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        Desconectar
                                    </button>
                                )}
                                <button 
                                    onClick={handleSave}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                >
                                    Guardar API
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanySettings;