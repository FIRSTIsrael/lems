import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventSlug = searchParams.get('eventSlug');
    const teamId = searchParams.get('teamId');

    if (!eventSlug || !teamId) {
      return NextResponse.json({ error: 'eventSlug and teamId are required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
    const response = await fetch(`${baseUrl}/api/export/scores?eventSlug=${eventSlug}&teamId=${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/csv'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch scores from backend' }, { status: response.status });
    }

    const csv = await response.text();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scores-${teamId}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
