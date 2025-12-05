import { CompanyProfile, SocialPost, User, PostStatus, Platform, SocialConnection } from "../types";
import { useState, useEffect } from 'react';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where 
} from 'firebase/firestore';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';

// Collections
const USERS_COL = 'users';
const POSTS_COL = 'posts';
const COMPANY_COL = 'companies';
const SETTINGS_COL = 'settings';

// LOCAL STORAGE KEYS FOR DEMO MODE
const DEMO_USER_KEY = 'postflow_demo_user';
const DEMO_POSTS_KEY = 'postflow_demo_posts';

// HELPER: Check if user is demo
const isDemoUser = (uid: string) => uid.startsWith('demo-user-');

// --- AUTHENTICATION ---

export const loginWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        
        const user: User = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Usuario',
            photoURL: fbUser.photoURL || undefined
        };

        // Create user doc if not exists
        const userRef = doc(db, USERS_COL, user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, user);
        }

        // Clear any demo user
        localStorage.removeItem(DEMO_USER_KEY);
        window.dispatchEvent(new Event('storage-auth-changed'));
        
        return user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const loginAsDemo = async (): Promise<User> => {
    const demoUser: User = {
        uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email: 'invitado@postflow.demo',
        displayName: 'Invitado Demo',
        photoURL: 'https://ui-avatars.com/api/?name=Invitado+Demo&background=random&color=fff&background=6366f1'
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    // Dispatch event so useAuth hooks update immediately
    window.dispatchEvent(new Event('storage-auth-changed'));
    return demoUser;
};

export const logout = async () => {
    try {
        if (auth.currentUser) {
            await signOut(auth);
        }
        localStorage.removeItem(DEMO_USER_KEY);
        localStorage.removeItem('postflow_user');
        window.dispatchEvent(new Event('storage-auth-changed'));
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

// Hook to track auth state
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncUser = (fbUser: FirebaseUser | null) => {
            if (fbUser) {
                setUser({
                    uid: fbUser.uid,
                    email: fbUser.email || '',
                    displayName: fbUser.displayName || 'Usuario',
                    photoURL: fbUser.photoURL || undefined
                });
            } else {
                // Check Demo User fallback
                const demoUserStr = localStorage.getItem(DEMO_USER_KEY);
                if (demoUserStr) {
                    setUser(JSON.parse(demoUserStr));
                } else {
                    setUser(null);
                }
            }
            setLoading(false);
        };

        // 1. Firebase Listener
        const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
            syncUser(fbUser);
        });

        // 2. Custom Event Listener (for Demo Mode updates)
        const handleLocalAuth = () => {
            // We pass auth.currentUser because we want to prioritize Firebase if it exists, 
            // but usually this event is fired when we explicitly set/unset demo user.
            syncUser(auth.currentUser);
        }

        window.addEventListener('storage-auth-changed', handleLocalAuth);

        return () => {
            unsubscribe();
            window.removeEventListener('storage-auth-changed', handleLocalAuth);
        };
    }, []);

    return { user, loading };
};

// Helper for non-hook usage
export const getCurrentUser = (): User | null => {
    const fbUser = auth.currentUser;
    if (fbUser) {
        return {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Usuario',
            photoURL: fbUser.photoURL || undefined
        };
    }
    const demoUserStr = localStorage.getItem(DEMO_USER_KEY);
    return demoUserStr ? JSON.parse(demoUserStr) : null;
};


// --- COMPANY PROFILE ---

export const saveCompanyProfile = async (profile: CompanyProfile) => {
    if (!profile.userId) return;
    
    // Cache locally always for speed
    localStorage.setItem(`postflow_company_${profile.userId}`, JSON.stringify(profile));

    if (isDemoUser(profile.userId)) {
        return; // Already saved to local storage
    }

    try {
        await setDoc(doc(db, COMPANY_COL, profile.userId), profile);
    } catch (e) {
        console.error("Error saving profile:", e);
    }
};

export const getCompanyProfile = (): CompanyProfile | null => {
    const user = getCurrentUser();
    if (!user) return null;
    const stored = localStorage.getItem(`postflow_company_${user.uid}`);
    return stored ? JSON.parse(stored) : null;
};

export const fetchCompanyProfile = async (userId: string): Promise<CompanyProfile | null> => {
    // If demo, rely on local storage
    if (isDemoUser(userId)) {
        return getCompanyProfile();
    }

    try {
        const snap = await getDoc(doc(db, COMPANY_COL, userId));
        if (snap.exists()) {
            const data = snap.data() as CompanyProfile;
            localStorage.setItem(`postflow_company_${userId}`, JSON.stringify(data));
            return data;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}


// --- POSTS ---

export const savePost = async (post: Omit<SocialPost, 'id' | 'createdAt'>) => {
    const newPostData = {
        ...post,
        createdAt: new Date().toISOString(),
        analytics: post.status === PostStatus.Published ? {
            postId: 'generated',
            likes: Math.floor(Math.random() * 500),
            shares: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            impressions: Math.floor(Math.random() * 5000),
            engagementRate: parseFloat((Math.random() * 5).toFixed(2))
        } : null
    };

    // DEMO MODE
    if (isDemoUser(post.userId)) {
        const stored = localStorage.getItem(DEMO_POSTS_KEY);
        const posts: SocialPost[] = stored ? JSON.parse(stored) : [];
        const newPost = { ...newPostData, id: 'demo-' + Date.now() };
        posts.push(newPost);
        localStorage.setItem(DEMO_POSTS_KEY, JSON.stringify(posts));
        
        // Dispatch event for local updates
        window.dispatchEvent(new Event('local-storage-posts-update'));
        return newPost;
    }

    // FIREBASE MODE
    try {
        const docRef = await addDoc(collection(db, POSTS_COL), newPostData);
        return { ...newPostData, id: docRef.id };
    } catch (e) {
        console.error("Error saving post:", e);
        throw e;
    }
};

export const updatePost = async (post: SocialPost) => {
    if (isDemoUser(post.userId)) {
        const stored = localStorage.getItem(DEMO_POSTS_KEY);
        let posts: SocialPost[] = stored ? JSON.parse(stored) : [];
        posts = posts.map(p => p.id === post.id ? post : p);
        localStorage.setItem(DEMO_POSTS_KEY, JSON.stringify(posts));
        window.dispatchEvent(new Event('local-storage-posts-update'));
        return;
    }

    try {
        const postRef = doc(db, POSTS_COL, post.id);
        const { id, ...data } = post;
        await updateDoc(postRef, data as any);
    } catch (e) {
        console.error("Error updating post:", e);
    }
};

export const deletePost = async (id: string) => {
    const user = getCurrentUser();
    if (user && isDemoUser(user.uid)) {
        const stored = localStorage.getItem(DEMO_POSTS_KEY);
        let posts: SocialPost[] = stored ? JSON.parse(stored) : [];
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem(DEMO_POSTS_KEY, JSON.stringify(posts));
        window.dispatchEvent(new Event('local-storage-posts-update'));
        return;
    }

    try {
        await deleteDoc(doc(db, POSTS_COL, id));
    } catch (e) {
        console.error("Error deleting post:", e);
    }
};

// React Hook for Real-time Posts (Hybrid)
export const usePosts = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        setPosts([]);
        return;
    }

    // DEMO MODE LISTENER
    if (isDemoUser(user.uid)) {
        const loadLocal = () => {
            const stored = localStorage.getItem(DEMO_POSTS_KEY);
            if (stored) setPosts(JSON.parse(stored));
            else setPosts([]);
        };
        
        loadLocal();
        window.addEventListener('local-storage-posts-update', loadLocal);
        
        // Populate demo data if empty
        const stored = localStorage.getItem(DEMO_POSTS_KEY);
        if (!stored) seedData(user.uid);

        return () => window.removeEventListener('local-storage-posts-update', loadLocal);
    }

    // FIREBASE LISTENER
    const q = query(collection(db, POSTS_COL), where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsData: SocialPost[] = [];
        querySnapshot.forEach((doc) => {
            postsData.push({ id: doc.id, ...doc.data() } as SocialPost);
        });
        setPosts(postsData);
    });

    fetchCompanyProfile(user.uid);

    return () => unsubscribe();
  }, [user]);

  return posts;
};


// --- SOCIAL CONNECTIONS (SETTINGS) ---

export const saveSocialConnection = async (connection: SocialConnection) => {
    const user = getCurrentUser();
    if (!user) return;

    // Local update
    const stored = localStorage.getItem(`postflow_social_${user.uid}`);
    const connections: SocialConnection[] = stored ? JSON.parse(stored) : [];
    
    const index = connections.findIndex(c => c.platform === connection.platform);
    if (index !== -1) connections[index] = connection;
    else connections.push(connection);
    
    localStorage.setItem(`postflow_social_${user.uid}`, JSON.stringify(connections));

    if (isDemoUser(user.uid)) return;

    // Firebase update
    const settingsRef = doc(db, SETTINGS_COL, user.uid);
    try {
        await setDoc(settingsRef, { socialConnections: connections }, { merge: true });
    } catch (e) {
        console.error("Error saving connections", e);
    }
};

export const getSocialConnection = (platform: Platform): SocialConnection | undefined => {
    const user = getCurrentUser();
    if (!user) return undefined;
    
    const stored = localStorage.getItem(`postflow_social_${user.uid}`);
    const connections: SocialConnection[] = stored ? JSON.parse(stored) : [];
    return connections.find(c => c.platform === platform);
};


// --- SEED DATA (For Demo) ---

export const seedData = async (userId: string) => {
    try {
        // If demo, check local storage key
        if (isDemoUser(userId)) {
            const stored = localStorage.getItem(DEMO_POSTS_KEY);
            if (stored && JSON.parse(stored).length > 0) return;
            
            await saveCompanyProfile({
                userId,
                name: "Demo Corp",
                industry: "Innovación",
                tone: "Profesional",
                description: "Empresa de demostración para PostFlow.",
                keywords: ["Demo", "Test"]
            });

            await savePost({
                userId,
                content: `🚀 ¡Bienvenido al Modo Demo de PostFlow!
                
                Aquí puedes probar todas las funcionalidades:
                1. Generar contenido con IA
                2. Crear imágenes personalizadas
                3. Programar publicaciones
                4. Ver analíticas simuladas
                
                ¡Disfruta explorando! #Demo #PostFlow #AI`,
                platform: Platform.LinkedIn,
                status: PostStatus.Published,
                scheduledDate: new Date().toISOString(),
                mediaUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60"
            });
            return;
        }

        // Firebase check
        const q = query(collection(db, POSTS_COL), where("userId", "==", userId));
        const snap = await getDocs(q);
        
        if (!snap.empty) return;

        await saveCompanyProfile({
            userId,
            name: "TechNova",
            industry: "Tecnología",
            tone: "Innovador y Profesional",
            description: "Líderes en soluciones SaaS para el futuro del trabajo.",
            keywords: ["SaaS", "AI", "Futuro"]
        });

        await savePost({
            userId,
            content: `🚀 Transformando el futuro digital.

¿Sabías que el 80% de las empresas que adoptan IA duplican su productividad en 6 meses? No se trata solo de tecnología, se trata de *visión*.

En TechNova, estamos liderando este cambio con herramientas que se adaptan a ti.

💡 ¿Estás listo para el siguiente nivel?

#Innovation #FutureOfWork #AI #TechTrends #BusinessGrowth`,
            platform: Platform.LinkedIn,
            status: PostStatus.Published,
            scheduledDate: new Date().toISOString(),
            mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60"
        });
    } catch (e) {
        console.error("Error seeding data:", e);
    }
};