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
        '@nuxtjs/sitemap',
        '@nuxtjs/robots',
    ],

    imports: {
        dirs: ['stores'],
    },
    devtools: { enabled: false },
    alias: {
        'vue': 'vue/dist/vue.esm-bundler.js',
    },
    build: {
        transpile: ['vue-sonner'],
    },

    app: {
        baseURL: '/',
        head: {
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            ],
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'format-detection', content: 'telephone=no' },
                { name: 'robots', content: 'index, follow' },
                { name: 'author', content: 'Layli CV' },
                { name: 'theme-color', content: '#3b82f6' },
            ],
        },
    },

    css: ['~/assets/css/tailwind.css', '~/assets/css/app.css'],

    site: {
        url: 'https://cv.layli.page',
        name: 'Layli CV',
        description: 'Build professional resumes for free. No servers, no registration, no payments. Unlimited downloads and resumes with complete privacy.',
        defaultLocale: 'en',
    },

    runtimeConfig: {
        public: {
            pocketbaseUrl: process.env.NODE_ENV === 'production'
                ? 'https://api.layli.page'
                : 'http://localhost:8010',
        },
    },
    compatibilityDate: '2025-07-15',
    nitro: {
        preset: 'vercel',
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
        baseUrl: 'https://cv.layli.page',
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
            name: 'Layli CV',
            short_name: 'Layli CV',
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
        allow: '/',
        disallow: ['/api/', '/_nuxt/'],
    },

    seo: {
        redirectToCanonicalSiteUrl: false,
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
