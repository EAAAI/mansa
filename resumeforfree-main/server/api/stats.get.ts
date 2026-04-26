interface PublicStats {
    users: number;
    resumes: number;
    downloads: number;
}

const DEFAULT_STATS: PublicStats = { users: 0, resumes: 0, downloads: 0 };

export default defineEventHandler(async (event): Promise<PublicStats> => {
    setResponseHeader(
        event,
        'Cache-Control',
        'public, max-age=60, s-maxage=21600, stale-while-revalidate=21600',
    );

    return DEFAULT_STATS;
});
