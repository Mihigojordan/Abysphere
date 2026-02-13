import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { en } from '../locales/en.ts';
import { fr } from '../locales/fr.ts';
import { rw } from '../locales/rw.ts';

type Language = 'en' | 'fr' | 'rw';
type Translations = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
    en,
    fr,
    rw,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('app_language');
        return (saved === 'en' || saved === 'fr' || saved === 'rw') ? saved : 'en';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const t = (key: string, variables?: Record<string, string>): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        if (typeof value === 'string') {
            if (variables) {
                Object.entries(variables).forEach(([k, v]) => {
                    value = (value as string).replace(`{{${k}}}`, v);
                });
            }
            return value;
        }

        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
