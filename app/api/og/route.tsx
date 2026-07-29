import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Optional params
    const title = searchParams.get('title') || '直前AI評価・期待値(EV)ガチ予想';
    const venue = searchParams.get('venue') || '本日の激アツレース';
    const isSecret = searchParams.get('secret') === 'true';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a', // slate-900
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background grid/glow effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 60%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(30, 41, 59, 0.8)', // slate-800
              border: '2px solid rgba(16, 185, 129, 0.5)', // emerald-500
              borderRadius: '24px',
              padding: '40px 60px',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
              zIndex: 10,
            }}
          >
            <h2
              style={{
                fontSize: 32,
                color: '#10b981', // emerald-500
                marginBottom: 10,
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              KYOTEI AI PRO
            </h2>
            <h1
              style={{
                fontSize: 64,
                color: 'white',
                fontWeight: '900',
                margin: '10px 0 20px 0',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {venue}
            </h1>
            
            <p
              style={{
                fontSize: 36,
                color: '#94a3b8', // slate-400
                marginBottom: 40,
              }}
            >
              {title}
            </p>

            {isSecret && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 32px',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)', // rose-500
                  border: '2px dashed #f43f5e',
                  borderRadius: '16px',
                  color: '#f43f5e',
                  fontSize: 28,
                  fontWeight: 'bold',
                }}
              >
                🔒 展示タイム加味の最終EV値はPRO限定公開
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
