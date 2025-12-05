import React, { useState, useRef, useEffect } from 'react';
import { generateSocialPosts, generateAIImage } from '../services/geminiService';
import { savePost, getCompanyProfile, getCurrentUser } from '../services/storageService';
import { GeneratedContent, Platform, PostStatus, User } from '../types';
import { 
  Calendar, 
  Save, 
  RefreshCw, 
  Wand2, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Rocket,
  Heart,
  MessageCircle,
  Repeat,
  Share2,
  MoreHorizontal,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Globe,
  Send as SendIcon,
  Edit3,
  WifiOff,
  Loader2
} from 'lucide-react';

type ImageSource = 'none' | 'local' | 'ai';

// --- SUB-COMPONENT: REALISTIC PREVIEW ---
const SocialPostPreview: React.FC<{
    platform: Platform;
    content: string;
    image: string | null;
    user: User | null;
    companyName: string;
}> = ({ platform, content, image, user, companyName }) => {
    
    const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${companyName}&background=random`;
    const displayName = companyName || user?.displayName || "Mi Empresa";
    const handle = "@" + displayName.toLowerCase().replace(/\s/g, '');
    const dateStr = "2h"; // Mock time

    // Helper to highlight hashtags/mentions
    const renderContent = (text: string) => {
        if (!text) return <span className="text-gray-400 italic">Escribe para previsualizar...</span>;
        
        return text.split(/(\s+)/).map((word, i) => {
            if (word.startsWith('#') || word.startsWith('@')) {
                return <span key={i} className="text-blue-500 cursor-pointer hover:underline">{word}</span>;
            }
            return word;
        });
    };

    if (platform === Platform.Twitter) {
        return (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 max-w-md mx-auto font-sans text-sm shadow-sm transition-colors">
                <div className="flex gap-3">
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100">
                            <span className="font-bold truncate">{displayName}</span>
                            <span className="text-gray-500 dark:text-gray-500 truncate">{handle}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500 hover:underline">{dateStr}</span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-line leading-normal">
                            {renderContent(content)}
                        </p>
                        {image && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                                <img src={image} alt="Post content" className="w-full object-cover max-h-80" />
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-3 text-gray-500 max-w-xs">
                            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle size={16} /> <span className="text-xs">12</span></button>
                            <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><Repeat size={16} /> <span className="text-xs">4</span></button>
                            <button className="flex items-center gap-1 hover:text-pink-500 transition-colors"><Heart size={16} /> <span className="text-xs">32</span></button>
                            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><Share2 size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (platform === Platform.LinkedIn) {
        return (
            <div className="bg-white dark:bg-[#1b1f23] border border-gray-300 dark:border-gray-700 rounded-lg max-w-md mx-auto font-sans text-sm shadow-sm overflow-hidden transition-colors">
                {/* Header */}
                <div className="p-3 flex gap-2 mb-1">
                    <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-sm object-cover" />
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white leading-tight">{displayName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate w-48">Innovative Solutions • {companyName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            {dateStr} • <Globe size={10} />
                        </div>
                    </div>
                    <button className="ml-auto text-gray-500"><MoreHorizontal size={20} /></button>
                </div>
                {/* Content */}
                <div className="px-3 pb-2 text-gray-900 dark:text-gray-200 whitespace-pre-line leading-relaxed text-sm">
                    {renderContent(content)}
                </div>
                {/* Image */}
                {image && (
                    <img src={image} alt="Post content" className="w-full object-cover border-t border-b border-gray-100 dark:border-gray-700" />
                )}
                {/* Stats */}
                <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                            <div className="bg-blue-500 rounded-full p-0.5"><ThumbsUp size={8} className="text-white" fill="white"/></div>
                            <div className="bg-red-500 rounded-full p-0.5"><Heart size={8} className="text-white" fill="white"/></div>
                        </div>
                        <span className="hover:underline hover:text-blue-600 cursor-pointer">45</span>
                    </div>
                    <span className="hover:underline hover:text-blue-600 cursor-pointer">5 comments • 2 reposts</span>
                </div>
                {/* Actions */}
                <div className="flex justify-between px-4 py-1">
                    <button className="flex items-center gap-1.5 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-semibold">
                        <ThumbsUp size={18} /> <span className="hidden sm:inline">Like</span>
                    </button>
                    <button className="flex items-center gap-1.5 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-semibold">
                        <MessageSquare size={18} /> <span className="hidden sm:inline">Comment</span>
                    </button>
                    <button className="flex items-center gap-1.5 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-semibold">
                        <Repeat size={18} /> <span className="hidden sm:inline">Repost</span>
                    </button>
                    <button className="flex items-center gap-1.5 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-semibold">
                        <SendIcon size={18} /> <span className="hidden sm:inline">Send</span>
                    </button>
                </div>
            </div>
        );
    }

    if (platform === Platform.Instagram) {
        return (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl max-w-md mx-auto font-sans text-sm shadow-sm overflow-hidden transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                         <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] rounded-full">
                            <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-black object-cover" />
                         </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{displayName.toLowerCase().replace(/\s/g, '')}</span>
                    </div>
                    <MoreHorizontal className="text-gray-900 dark:text-white" size={20} />
                </div>
                {/* Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                     {image ? (
                        <img src={image} alt="Post content" className="w-full h-full object-cover" />
                     ) : (
                        <div className="text-gray-400 text-xs">Sin Imagen (Instagram requiere imagen)</div>
                     )}
                </div>
                {/* Actions */}
                <div className="p-3">
                    <div className="flex justify-between mb-2">
                        <div className="flex gap-4">
                            <Heart size={24} className="text-gray-900 dark:text-white hover:text-gray-600 cursor-pointer" />
                            <MessageCircle size={24} className="text-gray-900 dark:text-white hover:text-gray-600 cursor-pointer transform -rotate-90" />
                            <SendIcon size={24} className="text-gray-900 dark:text-white hover:text-gray-600 cursor-pointer" />
                        </div>
                        <Bookmark size={24} className="text-gray-900 dark:text-white hover:text-gray-600 cursor-pointer" />
                    </div>
                    <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">1,234 likes</div>
                    <div className="text-sm text-gray-900 dark:text-white leading-tight">
                        <span className="font-semibold mr-2">{displayName.toLowerCase().replace(/\s/g, '')}</span>
                        <span className="whitespace-pre-line">{renderContent(content)}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-2 uppercase">2 HOURS AGO</div>
                </div>
            </div>
        );
    }

    if (platform === Platform.Facebook) {
        return (
            <div className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg max-w-md mx-auto font-sans text-sm shadow-sm overflow-hidden transition-colors">
                {/* Header */}
                <div className="p-3 flex gap-2">
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{displayName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            {dateStr} • <Globe size={10} />
                        </div>
                    </div>
                    <button className="ml-auto text-gray-500"><MoreHorizontal size={20} /></button>
                </div>
                {/* Content */}
                <div className="px-3 pb-2 text-gray-900 dark:text-gray-100 whitespace-pre-line text-sm leading-normal">
                    {renderContent(content)}
                </div>
                {/* Image */}
                {image && (
                    <img src={image} alt="Post content" className="w-full object-cover max-h-96" />
                )}
                {/* Stats */}
                <div className="px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <div className="bg-blue-500 rounded-full p-1"><ThumbsUp size={8} fill="white" className="text-white"/></div>
                        <span>24</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                        3 comments • 1 share
                    </div>
                </div>
                {/* Actions */}
                <div className="flex px-2 py-1">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                        <ThumbsUp size={18} /> Like
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                        <MessageSquare size={18} /> Comment
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                        <Share2 size={18} /> Share
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

// --- MAIN COMPONENT ---

const PostGenerator: React.FC = () => {
  // Config State
  const [topic, setTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Instagram, Platform.Facebook]);
  const [imageSource, setImageSource] = useState<ImageSource>('none');
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageStyle, setImageStyle] = useState('Fotorealista');
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  // Editor State
  const [activeTab, setActiveTab] = useState<Platform | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // User/Company Data
  const [companyName, setCompanyName] = useState('Mi Empresa');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const profile = getCompanyProfile();
    const user = getCurrentUser();
    if (profile) setCompanyName(profile.name);
    if (user) setCurrentUser(user);
  }, []);

  // REORDERED PLATFORMS: Defaults (Instagram, Facebook) on top
  const PLATFORMS_CONFIG = [
    { id: Platform.Instagram, icon: Instagram, color: 'text-pink-600', limit: 2200 },
    { id: Platform.Facebook, icon: Facebook, color: 'text-blue-600', limit: 63206 },
    { id: Platform.LinkedIn, icon: Linkedin, color: 'text-blue-700', limit: 3000 },
    { id: Platform.Twitter, icon: Twitter, color: 'text-sky-500', limit: 280 },
  ];

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // Check Offline Status for PWA
    if (!navigator.onLine) {
        setMessage({ type: 'error', text: 'Estás sin conexión. La IA necesita internet para funcionar.' });
        return;
    }

    const profile = getCompanyProfile();
    if (!profile) {
      setMessage({ type: 'error', text: 'Configura tu perfil de empresa en la sección de Configuración primero.' });
      return;
    }
    if (!topic.trim()) return;
    if (selectedPlatforms.length === 0) {
      setMessage({ type: 'error', text: 'Selecciona al menos una red social.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setGeneratedContent(null);
    setEditedContent({});

    try {
      // 1. Generate Text
      const textResult = await generateSocialPosts(topic, profile, selectedPlatforms);
      
      if (textResult) {
        setGeneratedContent(textResult);
        // Initialize edited content with generated result
        const initialEdits: Record<string, string> = {};
        selectedPlatforms.forEach(p => {
          const key = p.toLowerCase() as keyof GeneratedContent;
          if (textResult[key]) initialEdits[p] = textResult[key];
        });
        setEditedContent(initialEdits);
        setActiveTab(selectedPlatforms[0]);
      }

      // 2. Generate Image if selected
      if (imageSource === 'ai') {
        setGeneratingImage(true);
        // Pass optional custom prompt
        const imgResult = await generateAIImage(topic, imageStyle, customImagePrompt);
        if (imgResult) {
            setGeneratedImage(imgResult);
        }
        setGeneratingImage(false);
      }

    } catch (error) {
      console.error(error);
      const err = error as Error;
      setMessage({ type: 'error', text: `Error: ${err.message || 'Intenta de nuevo.'}` });
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    const user = getCurrentUser();
    const profile = getCompanyProfile();
    
    // Validations
    if (!user) {
         setMessage({ type: 'error', text: 'Debes iniciar sesión para realizar esta acción.' });
         return;
    }

    if (!activeTab) {
         setMessage({ type: 'error', text: 'No hay contenido seleccionado para guardar.' });
         return;
    }

    const content = editedContent[activeTab];
    if (!content || !content.trim()) {
         setMessage({ type: 'error', text: 'El contenido del post no puede estar vacío.' });
         return;
    }

    if (status === PostStatus.Scheduled && !scheduledDate) {
        setMessage({ type: 'error', text: 'Por favor selecciona una fecha y hora para programar.' });
        return;
    }

    setSaving(true);
    setMessage(null);

    try {
        const finalImage = imageSource === 'local' ? localImage : imageSource === 'ai' ? generatedImage : undefined;
        const finalDate = status === PostStatus.Scheduled ? scheduledDate : undefined;

        // Use profile userId if available, otherwise fallback to current user uid
        const targetUserId = profile?.userId || user.uid;

        await savePost({
            userId: targetUserId,
            content: content,
            platform: activeTab,
            status: status,
            scheduledDate: finalDate,
            mediaUrl: finalImage || undefined
        });

        setMessage({ 
            type: 'success', 
            text: status === PostStatus.Published ? '¡Publicado exitosamente!' : 'Guardado correctamente.' 
        });

    } catch (error) {
        console.error("Error saving post:", error);
        setMessage({ type: 'error', text: 'Ocurrió un error al guardar. Intenta nuevamente.' });
    } finally {
        setSaving(false);
    }
  };

  const getCharCountColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 1) return 'text-red-600 font-bold';
    if (ratio > 0.9) return 'text-orange-500';
    return 'text-gray-400';
  };

  const currentImage = imageSource === 'local' ? localImage : imageSource === 'ai' ? generatedImage : null;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <Wand2 className="text-white" size={24} />
          </div>
          Generador Inteligente
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
        
        {/* LEFT COLUMN: CONFIGURATION (Sticky on LG+) */}
        <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-4">
                {/* Topic Input */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Tema o Idea Principal
                    </label>
                    <textarea
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all placeholder-gray-400 text-sm"
                        rows={3}
                        placeholder="Ej: Lanzamiento de nueva colección..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                {/* Platform Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Canales de Destino
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS_CONFIG.map((p) => {
                            const Icon = p.icon;
                            const isSelected = selectedPlatforms.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => togglePlatform(p.id)}
                                    className={`flex items-center space-x-2 p-2.5 rounded-lg border transition-all ${
                                        isSelected 
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <Icon size={16} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                                    <span className="text-xs font-medium">{p.id}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Media Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Multimedia
                    </label>
                    
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-3">
                        {(['none', 'local', 'ai'] as ImageSource[]).map((type) => (
                             <button
                                key={type}
                                onClick={() => setImageSource(type)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                                    imageSource === type 
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                             >
                                {type === 'none' ? 'Sin Imagen' : type === 'local' ? 'Subir' : 'Generar IA'}
                             </button>
                        ))}
                    </div>

                    {imageSource === 'local' && (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            {localImage ? (
                                <div className="relative group">
                                    <img src={localImage} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white text-xs">Cambiar</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="mx-auto text-gray-400" size={20} />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Click para subir</p>
                                </div>
                            )}
                        </div>
                    )}

                    {imageSource === 'ai' && (
                        <div className="space-y-3 animate-fade-in">
                            <div>
                                 <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estilo Visual</label>
                                 <select 
                                    value={imageStyle}
                                    onChange={(e) => setImageStyle(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                 >
                                    <option>Fotorealista</option>
                                    <option>Ilustración 3D</option>
                                    <option>Minimalista</option>
                                    <option>Cyberpunk</option>
                                    <option>Pop Art</option>
                                 </select>
                            </div>
                            <div>
                                 <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Prompt Personalizado (Opcional)</label>
                                 <input 
                                    type="text"
                                    value={customImagePrompt}
                                    onChange={(e) => setCustomImagePrompt(e.target.value)}
                                    placeholder="Ej: Un gato futurista..."
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                 />
                            </div>
                            {generatedImage && (
                                 <img src={generatedImage} alt="AI Generated" className="w-full h-24 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" />
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !topic}
                    className={`w-full py-3 px-4 rounded-xl text-white font-bold text-base flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                    loading || !topic 
                        ? 'bg-indigo-300 dark:bg-indigo-900/50 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                    }`}
                >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    <span>{loading ? 'Trabajando...' : 'Generar Campaña'}</span>
                </button>

                {message && (
                    <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5" /> : message.text.includes('conexión') ? <WifiOff size={16} className="mt-0.5"/> : <AlertCircle size={16} className="mt-0.5" />}
                        {message.text}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW & EDITOR & ACTIONS */}
        <div className="lg:col-span-2 xl:col-span-3 lg:h-[calc(100vh-140px)] flex flex-col">
            {!generatedContent && !loading ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                        <Wand2 size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Listo para crear</h3>
                    <p className="max-w-xs mx-auto mt-2 text-sm">Configura tu campaña a la izquierda y presiona Generar para ver la magia.</p>
                </div>
            ) : (
                <>
                    {/* Main Workspace Card (Editor + Preview) */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col xl:flex-row min-h-0 transition-colors relative">
                        {activeTab && (
                            <>
                                {/* 1. Editor Area (Left/Top) - Scrollable */}
                                <div className="flex-1 flex flex-col overflow-y-auto p-6 border-b xl:border-b-0 xl:border-r border-gray-100 dark:border-gray-700 custom-scrollbar">
                                    
                                    {/* Editor Header */}
                                    <div className="flex-none flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${PLATFORMS_CONFIG.find(c => c.id === activeTab)?.color || ''}`}>
                                                {React.createElement(PLATFORMS_CONFIG.find(c => c.id === activeTab)?.icon || Edit3, { size: 20 })}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Editando {activeTab}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Personaliza el contenido para esta red</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                                            getCharCountColor(editedContent[activeTab]?.length || 0, PLATFORMS_CONFIG.find(c => c.id === activeTab)?.limit || 1000)
                                        } bg-gray-100 dark:bg-gray-700`}>
                                            {editedContent[activeTab]?.length || 0} / {PLATFORMS_CONFIG.find(c => c.id === activeTab)?.limit}
                                        </div>
                                    </div>
                                    
                                    <textarea
                                        value={editedContent[activeTab] || ''}
                                        onChange={(e) => setEditedContent(prev => ({...prev, [activeTab]: e.target.value}))}
                                        className="w-full flex-1 min-h-[300px] p-4 text-base border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-colors font-mono text-sm shadow-inner"
                                        placeholder="El contenido generado aparecerá aquí..."
                                    />
                                </div>

                                {/* 2. Live Preview Area (Right/Bottom) - Scrollable */}
                                <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-900/30">
                                    {/* Sticky Tabs for Preview */}
                                    <div className="flex-none sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm p-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar flex gap-2 justify-center xl:justify-start">
                                        {selectedPlatforms.map(p => {
                                            const config = PLATFORMS_CONFIG.find(c => c.id === p);
                                            const Icon = config?.icon || AlertCircle;
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setActiveTab(p)}
                                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                                        activeTab === p 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    <span>{p}</span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                        <div className="min-h-[400px] flex items-start justify-center">
                                            <div className="w-full max-w-sm">
                                                <SocialPostPreview 
                                                    platform={activeTab}
                                                    content={editedContent[activeTab] || ''}
                                                    image={generatingImage ? null : currentImage} // Hide image if generating
                                                    user={currentUser}
                                                    companyName={companyName}
                                                />
                                                {generatingImage && (
                                                    <div className="mt-4 text-center text-sm text-gray-500 animate-pulse">
                                                        Generando imagen visual...
                                                    </div>
                                                )}
                                                <p className="text-xs text-center text-gray-400 mt-6 pb-6">
                                                    * La vista previa es aproximada.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* DEDICATED ACTION BAR CONTAINER (Separated) */}
                    <div className="mt-4 flex-none bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 transition-colors z-10">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                                <Calendar size={18} className="text-gray-500 dark:text-gray-400 ml-2" />
                                <input 
                                    type="datetime-local"
                                    className="bg-transparent text-sm text-gray-700 dark:text-white outline-none flex-1"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto flex-1 justify-end">
                                <button 
                                    onClick={() => handleSave(PostStatus.Draft)}
                                    disabled={saving}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                                    <span className="inline">{saving ? 'Guardando...' : 'Borrador'}</span>
                                </button>
                                
                                {scheduledDate && (
                                    <button 
                                        onClick={() => handleSave(PostStatus.Scheduled)}
                                        disabled={saving}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Calendar size={16} />}
                                        <span className="inline">{saving ? 'Guardando...' : 'Programar'}</span>
                                    </button>
                                )}

                                <button 
                                    onClick={() => handleSave(PostStatus.Published)}
                                    disabled={saving}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md hover:shadow-indigo-500/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
                                    <span className="inline">{saving ? 'Publicando...' : 'Publicar'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;