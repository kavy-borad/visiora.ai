import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/download
 * Proxies image download to bypass CORS restrictions
 * 
 * Query params:
 * - url: The image URL to download
 * - filename: Optional filename for the download
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');
        const filename = searchParams.get('filename') || 'ephotocart_image.jpg';

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Missing image URL' },
                { status: 400 }
            );
        }

        console.log('📥 Proxying download for:', imageUrl);

        // Fetch the image from the external URL
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'ephotocart-Download-Proxy/1.0',
            },
        });

        if (!imageResponse.ok) {
            console.error('❌ Failed to fetch image:', imageResponse.status);
            return NextResponse.json(
                { error: 'Failed to fetch image' },
                { status: imageResponse.status }
            );
        }

        // Get the image blob
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();

        // Determine content type
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

        // Create response with download headers
        const response = new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': arrayBuffer.byteLength.toString(),
                'Cache-Control': 'no-cache',
            },
        });

        console.log('✅ Download proxy successful:', filename);
        return response;

    } catch (error: any) {
        console.error('❌ Download proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Download failed' },
            { status: 500 }
        );
    }
}


