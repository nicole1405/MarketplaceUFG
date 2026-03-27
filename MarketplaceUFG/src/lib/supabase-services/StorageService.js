/**
 * Storage Service for Supabase
 * Handles image uploads to Supabase Storage
 * Security: Only authenticated users can upload, RLS policies handle access
 */

import { supabase } from '../supabase.js';

const BUCKET_NAME = 'fotos_anuncios';

export class StorageService {
    constructor() {
        this.bucket = BUCKET_NAME;
    }

    async uploadImage(file, userId) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('El archivo debe ser una imagen');
        }

        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            throw new Error(`La imagen no puede exceder ${maxSizeMB}MB`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(this.bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (error) {
            throw new Error(`Error al subir imagen: ${error.message}`);
        }

        // Build public URL directly
        const publicUrl = `https://rdxbldkxokcltsayhnpl.supabase.co/storage/v1/object/public/${this.bucket}/${fileName}`;

        return {
            path: data.path,
            url: publicUrl
        };
    }

    async uploadImages(files, userId) {
        if (!files || files.length === 0) {
            return { urls: [], paths: [] };
        }

        const maxImages = 5;
        if (files.length > maxImages) {
            throw new Error(`Máximo ${maxImages} imágenes permitidas`);
        }

        const results = { urls: [], paths: [] };
        
        for (const file of files) {
            try {
                const result = await this.uploadImage(file, userId);
                results.urls.push(result.url);
                results.paths.push(result.path);
            } catch (error) {
                // Delete already uploaded images if one fails
                for (const path of results.paths) {
                    await this.deleteImage(path);
                }
                throw error;
            }
        }

        return results;
    }

    async deleteImage(path) {
        const { error } = await supabase.storage
            .from(this.bucket)
            .remove([path]);

        if (error) {
            console.error('Error deleting image:', error.message);
        }
    }

    getPublicUrl(path) {
        const { data: { publicUrl } } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(path);
        
        return publicUrl;
    }

    async listImages(userId) {
        const { data, error } = await supabase.storage
            .from(this.bucket)
            .list(userId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'desc' }
            });

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }
}

export default StorageService;
