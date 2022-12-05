export const fetchPackage = async (name) => {
    const url = `https://registry.npmjs.org/${name}`;

    try {
        const response = await fetch(url);
        const { readme, versions, time, 'dist-tags': tags } = await response.json();

        return {
            readme,
            versions: simplifyVersions(versions, time),
            createdAt: time.created,
            updatedAt: time.modified,
            tags
        }
    } catch(error) {
        console.error(error);
        return {
            readme: 'README was not found.',
            versions: {},
            tags: {}
        };
    }
}

export const fetchDownloads = async (name) => {
    const url = `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`;

    try {
        const response = await fetch(url);
        return await response.json();
    } catch(error) {
        return { downloads: 0 };
    }
}

export const simplifyVersions = (versions, time) => {
    let simplifiedVersions = Object.entries(versions);

    return Object.fromEntries(simplifiedVersions.map(([version, { name }]) => {
        return [version, {
            name,
            version,
            createdAt: time[version],
        }];
    }));
}
