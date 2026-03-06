export async function onRequestPost(context) {
    const { request, env } = context;

    // --- CONFIGURATION ---
    // The TOKEN must be a secret Cloudflare Environment Variable.
    // The Owner and Repo are hardcoded here for simplicity (they are public anyway).
    const GH_TOKEN = env.GH_TOKEN;
    const GH_OWNER = "yamsnams";            // [!] Your GitHub username
    const GH_REPO = "my-static-site";      // [!] Your Repository name
    const GH_BRANCH = "main";               // [!] Your branch
    const GH_PATH = "";                     // [!] Optional folder path

    if (!GH_TOKEN) {
        return new Response(JSON.stringify({
            error: "GH_TOKEN is missing in Cloudflare Environment Variables."
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const data = await request.json();
        const submission = {
            author: data.author || 'Anonymous',
            text: data.text,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            timestamp: Date.now()
        };

        if (!submission.text) {
            return new Response(JSON.stringify({ error: "Text is required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Determine path
        let fullPath = 'data/submissions.json';
        if (GH_PATH) fullPath = GH_PATH.replace(/\/+$/, '') + '/' + fullPath;

        const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${fullPath}`;

        // 1. Get current submissions.json
        let sha = null;
        let submissions = [];

        const getRes = await fetch(url + `?ref=${GH_BRANCH}&t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${GH_TOKEN}`,
                'User-Agent': 'Cloudflare-Pages-Function',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
            // Fix: GitHub returns base64 with newlines which atob() may reject in some environments.
            const content = Uint8Array.from(atob(fileData.content.replace(/\s/g, "")), c => c.charCodeAt(0));
            const decoded = new TextDecoder().decode(content);
            const json = JSON.parse(decoded);
            submissions = json.submissions || [];
        }

        // 2. Add new submission at the top
        submissions.unshift(submission);

        // 3. Push back to GitHub
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GH_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Cloudflare-Pages-Function'
            },
            body: JSON.stringify({
                message: `Add submission from ${submission.author}`,
                content: btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify({ submissions }, null, 2)))),
                branch: GH_BRANCH,
                sha: sha
            })
        });

        if (putRes.ok) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            const errDetail = await putRes.text();
            return new Response(JSON.stringify({ error: "GitHub Save Failed", detail: errDetail }), {
                status: 502,
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
