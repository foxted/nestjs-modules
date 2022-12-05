export const fetchRepository = async (owner, repo) => {
    const url = `https://ungh.cc/repos/${owner}/${repo}`;

    try {
        const response = await fetch(url);
        const { repo } = await response.json();

        return repo;
    } catch(error) {
        return {
            stars: 0,
        };
    }
}
