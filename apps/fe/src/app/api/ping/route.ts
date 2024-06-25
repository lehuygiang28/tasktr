export async function GET(_req: Request) {
    return new Response('pong', {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
    });
}
