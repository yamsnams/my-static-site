export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Get Secret Token from Environment Variables
    const GITHUB_TOKEN = env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
        return new Response(JSON.stringify({ error: "GITHUB_TOKEN not configured in Cloudflare" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 2. Parse request body
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }

    const { owner, repo, branch, path, content, message } = body;
    if (!owner || !repo || !branch || !path || !content) {
        return new Response(JSON.stringify({ error: "Missing required fields (owner, repo, branch, path, content)" }), { status: 400 });
    }

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Cloudflare-Pages-Function"
    };

    try {
        // 3. Get current file SHA (for updates)
        let sha = null;
        const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        }

        // 4. Push to GitHub
        const putBody = {
            message: message || "[Admin] Auto-save update",
            content: content, // already base64 encoded from client
            branch: branch
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(apiBase, {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(putBody)
        });

        const result = await putRes.json();
        if (!putRes.ok) {
            return new Response(JSON.stringify({ error: result.message || "GitHub API Error" }), {
                status: putRes.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success: true, sha: result.content.sha }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
