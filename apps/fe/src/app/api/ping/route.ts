export async function GET(request: Request) {
    return new Response('pong', {
        headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
    });
}
