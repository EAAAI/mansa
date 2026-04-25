import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    modules: [
        'shadcn-nuxt',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        '@nuxt/eslint',
        '@vite-pwa/nuxt',
        '@nuxtjs/i18n',
        'nitro-cloudflare-dev',
        '@nuxtjs/turnstile',
        '@nuxtjs/sitemap',
        '@nuxtjs/robots',
    ],

    imports: {
        dirs: ['stores'],
    },
    devtools: { enabled: false },

    app: {
        baseURL: '/cv/',
        head: {
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/cv/favicon.svg' },
            ],
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'format-detection', content: 'telephone=no' },
                { name: 'robots', content: 'index, follow' },
                { name: 'author', content: 'NewCv' },
                { name: 'theme-color', content: '#3b82f6' },
            ],
        },
    },

    css: ['~/assets/css/tailwind.css', '~/assets/css/app.css'],

    site: {
        url: 'https://newcv.com',
        name: 'NewCv',
        description: 'Build professional resumes for free. No servers, no registration, no payments. Unlimited downloads and resumes with complete privacy.',
        defaultLocale: 'en',
    },

    runtimeConfig: {
        public: {
            pocketbaseUrl: process.env.NODE_ENV === 'production'
                ? 'https://api.newcv.com'
                : 'http://localhost:8010',
            turnstile: {
                siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
                invisibleSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_INVISIBLE_SITE_KEY || '1x00000000000000000000BB',
            },
        },
        turnstile: {
            secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA',
            invisibleSecretKey: process.env.NUXT_TURNSTILE_INVISIBLE_SECRET_KEY || '1x0000000000000000000000000000000BB',
        },
    },
    future: {
        compatibilityVersion: 4,
    },
    compatibilityDate: '2025-07-15',
    nitro: {
        preset: 'cloudflare-module',
    },

    vite: {
        plugins: [
            tailwindcss(),
        ],
        optimizeDeps: {
            exclude: [
                '@myriaddreamin/typst-ts-web-compiler',
                '@myriaddreamin/typst-ts-renderer',
                '@myriaddreamin/typst.ts',
            ],
        },
        build: {
            target: 'esnext',
        },
    },

    eslint: {
        config: {
            stylistic: {
                indent: 4,
                semi: true,
                quotes: 'single',
            },
        },
    },

    i18n: {
        defaultLocale: 'en',
        locales: [
            { code: 'en', name: 'English', file: 'en.json', language: 'en-US', dir: 'ltr' },
            { code: 'ar', name: 'العربية', file: 'ar.json', language: 'ar-SA', dir: 'rtl' },
        ],
        lazy: true,
        langDir: 'locales',
        strategy: 'prefix_except_default',
        baseUrl: 'https://newcv.com',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root',
        },
    },

    piniaPluginPersistedstate: {
        storage: 'localStorage',
    },

    pwa: {
        registerType: 'prompt',
        manifest: {
            name: 'NewCv',
            short_name: 'NewCv',
            description: 'Build professional resumes for free',
            theme_color: '#3b82f6',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
                {
                    src: '/icon.svg',
                    sizes: 'any',
                    type: 'image/svg+xml',
                    purpose: 'any maskable',
                },
            ],
        },
        workbox: {
            navigateFallback: '/',
            cleanupOutdatedCaches: true,
        },
        client: {
            periodicSyncForUpdates: 60,
        },
        devOptions: {
            enabled: false,
        },
    },

    robots: {
        robotsTxt: false,
        allow: '/',
        disallow: ['/api/', '/_nuxt/'],
    },

    seo: {
        redirectToCanonicalSiteUrl: true,
    },

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui',
    },

    sitemap: {
        exclude: [],
        defaults: {
            changefreq: 'weekly',
            priority: 0.7,
        },
        urls: [
            { loc: '/', priority: 1.0, changefreq: 'weekly' },
            { loc: '/resumes', priority: 0.9, changefreq: 'monthly' },
            { loc: '/builder', priority: 0.8, changefreq: 'monthly' },
            { loc: '/terms', priority: 0.3, changefreq: 'yearly' },
        ],
    },
});
