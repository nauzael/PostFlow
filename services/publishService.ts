import { Platform, SocialConnection } from "../types";

interface PublishResult {
    success: boolean;
    id?: string;
    error?: string;
}

export interface VerificationResult {
    success: boolean;
    message: string;
}

/**
 * Publishes content to the real social media platforms via their APIs.
 * Note: Browser-based API calls to Meta often face CORS issues in localhost.
 * In a production app, these calls should be routed through a backend (Cloud Functions).
 */
export const publishToSocialNetwork = async (
    platform: Platform,
    content: string,
    imageUrl: string | null | undefined,
    connection: SocialConnection
): Promise<PublishResult> => {
    
    if (!connection || !connection.isConnected) {
        return { success: false, error: `No estás conectado a ${platform}. Ve a Configuración.` };
    }

    const { credentials } = connection;

    try {
        switch (platform) {
            case Platform.Facebook:
                return await publishToFacebook(content, imageUrl, credentials);
            case Platform.Instagram:
                return await publishToInstagram(content, imageUrl, credentials);
            default:
                return { success: false, error: `La publicación automática en ${platform} aún no está soportada (requiere API Enterprise).` };
        }
    } catch (error: any) {
        console.error(`Error publishing to ${platform}:`, error);
        return { success: false, error: error.message || 'Error de conexión con la API.' };
    }
};

/**
 * Verifies if the provided credentials are valid by making a lightweight read request.
 */
export const verifyConnection = async (
    platform: Platform,
    credentials: Record<string, string>
): Promise<VerificationResult> => {
    try {
        switch (platform) {
            case Platform.Facebook:
                return await verifyFacebook(credentials);
            case Platform.Instagram:
                return await verifyInstagram(credentials);
            case Platform.LinkedIn:
                return { success: true, message: "Verificación simulada (LinkedIn requiere Backend proxy para CORS)." }; 
            case Platform.Twitter:
                return { success: true, message: "Verificación simulada (Twitter requiere OAuth 1.0 backend)." };
            default:
                return { success: false, message: "Plataforma no soportada." };
        }
    } catch (error: any) {
        console.error(`Error verifying ${platform}:`, error);
        return { success: false, message: error.message || "Error desconocido al conectar." };
    }
};

// --- API IMPLEMENTATIONS ---

const verifyFacebook = async (creds: Record<string, string>): Promise<VerificationResult> => {
    if (!creds.accessToken || !creds.pageId) return { success: false, message: "Faltan datos." };
    
    // Validar formato numérico
    if (!/^\d+$/.test(creds.pageId)) {
        return { success: false, message: "El ID de Página debe contener solo números." };
    }

    // Simple GET request to check page name
    const url = `https://graph.facebook.com/v18.0/${creds.pageId}?fields=name,id&access_token=${creds.accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        return { success: false, message: `Facebook API: ${data.error.message}` };
    }

    return { success: true, message: `Conectado correctamente con la página: ${data.name}` };
};

const verifyInstagram = async (creds: Record<string, string>): Promise<VerificationResult> => {
    if (!creds.accessToken || !creds.pageId) return { success: false, message: "Faltan datos." };

    // Validar formato numérico estricto para evitar errores de objetos no encontrados por IDs basura
    if (!/^\d+$/.test(creds.pageId)) {
        return { success: false, message: "El ID debe ser numérico. Parece que has copiado un Token o Secret en lugar del ID (ej: 1784...)." };
    }

    // Intento 1: Verificar si es un ID de Instagram Business válido
    const url = `https://graph.facebook.com/v18.0/${creds.pageId}?fields=username&access_token=${creds.accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.error) {
        return { success: true, message: `Conectado correctamente como: @${data.username}` };
    }

    // Intento 2: DIAGNÓSTICO INTELIGENTE
    // Si falla, verificamos si el usuario puso el ID de la Página de Facebook por error
    if (data.error.code === 100 || data.error.type === 'OAuthException') {
         const pageUrl = `https://graph.facebook.com/v18.0/${creds.pageId}?fields=instagram_business_account&access_token=${creds.accessToken}`;
         try {
             const pageRes = await fetch(pageUrl);
             const pageData = await pageRes.json();
             
             if (pageData.instagram_business_account && pageData.instagram_business_account.id) {
                 return { 
                     success: false, 
                     message: `¡Error de ID! Has puesto el ID de Facebook. Tu ID de Instagram es: ${pageData.instagram_business_account.id} (Cópialo y pégalo).` 
                 };
             } else if (pageData.id) {
                 return {
                     success: false,
                     message: "Este ID es de Facebook y NO tiene un Instagram Business conectado. Vincula tu cuenta en la configuración de Facebook."
                 };
             }
         } catch(e) {}
    }

    return { success: false, message: `Instagram API: ${data.error.message}` };
};

const publishToFacebook = async (message: string, imageUrl: string | undefined, creds: Record<string, string>): Promise<PublishResult> => {
    const pageId = creds.pageId;
    const accessToken = creds.accessToken;

    if (!pageId || !accessToken) throw new Error("Faltan Page ID o Access Token.");

    // Facebook Graph API Endpoint
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    // Construct URL parameters
    const params = new URLSearchParams();
    params.append('message', message);
    params.append('access_token', accessToken);
    
    // If there is an image URL (must be public, not base64), add it.
    // Facebook API works best with public URLs. Base64 often fails without upload first.
    if (imageUrl && imageUrl.startsWith('http')) {
        params.append('link', imageUrl);
    }

    const response = await fetch(url, {
        method: 'POST',
        body: params
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return { success: true, id: data.id };
};

const publishToInstagram = async (caption: string, imageUrl: string | undefined, creds: Record<string, string>): Promise<PublishResult> => {
    const accountId = creds.pageId; // In Instagram context, this is the Instagram Business Account ID
    const accessToken = creds.accessToken;

    if (!accountId || !accessToken) throw new Error("Faltan Instagram Business ID o Access Token.");

    if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error("Instagram requiere una URL de imagen pública (Generada por IA o Unsplash). Las imágenes locales no se pueden enviar directamente desde el navegador.");
    }

    // STEP 1: Create Media Container
    const createMediaUrl = `https://graph.facebook.com/v18.0/${accountId}/media`;
    const containerParams = new URLSearchParams();
    containerParams.append('image_url', imageUrl);
    containerParams.append('caption', caption);
    containerParams.append('access_token', accessToken);

    const containerResponse = await fetch(createMediaUrl, {
        method: 'POST',
        body: containerParams
    });

    const containerData = await containerResponse.json();

    if (containerData.error) {
        throw new Error("Error creando contenedor IG: " + containerData.error.message);
    }

    const creationId = containerData.id;

    // STEP 2: Publish Media
    const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish`;
    const publishParams = new URLSearchParams();
    publishParams.append('creation_id', creationId);
    publishParams.append('access_token', accessToken);

    const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        body: publishParams
    });

    const publishData = await publishResponse.json();

    if (publishData.error) {
        throw new Error("Error publicando en IG: " + publishData.error.message);
    }

    return { success: true, id: publishData.id };
};