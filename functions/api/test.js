export async function onRequest(context) {
    return new Response(JSON.stringify({
        message: "Function is working!",
        env_keys: Object.keys(context.env)
    }), {
        headers: { "Content-Type": "application/json" }
    });
}
