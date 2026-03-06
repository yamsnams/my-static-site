export async function onRequestPost(context) {
    const { request, env } = context;

    // --- CONFIGURATION ---
    const GH_TOKEN = env.GH_TOKEN;
    const GH_OWNER = env.GH_OWNER || "yamsnams";
    const GH_REPO = env.GH_REPO || "my-static-site";
    const GH_BRANCH = env.GH_BRANCH || "main";
    const GH_PATH = env.GH_PATH || "";

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
            if (fileData.content) {
                try {
                    // Stripping and padding for strict atob
                    let cleaned = fileData.content.replace(/[^A-Za-z0-9+/=]/g, "");
                    while (cleaned.length % 4 !== 0) cleaned += "=";

                    const binaryString = atob(cleaned);
                    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
                    const decoded = new TextDecoder().decode(bytes);
                    const json = JSON.parse(decoded);
                    submissions = json.submissions || [];
                } catch (e) {
                    return new Response(JSON.stringify({
                        error: "[API] Decoding Error",
                        detail: e.message,
                        timestamp: new Date().toISOString()
                    }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }
        } else if (getRes.status !== 404) {
            // If it's not a 200 or 404, something's wrong with the GH API call
            const errText = await getRes.text();
            return new Response(JSON.stringify({ error: "GitHub API Error", status: getRes.status, detail: errText }), {
                status: 502,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Add new submission
        submissions.unshift(submission);

        // 3. Push back to GitHub
        let content;
        try {
            const bytes = new TextEncoder().encode(JSON.stringify({ submissions }, null, 2));
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            content = btoa(binary);
        } catch (e) {
            return new Response(JSON.stringify({ error: "Encoding Error", detail: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GH_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Cloudflare-Pages-Function'
            },
            body: JSON.stringify({
                message: `Add submission from ${submission.author}`,
                content: content,
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
        return new Response(JSON.stringify({ error: "Internal Server Error", detail: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
