import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventSlug = searchParams.get('eventSlug');
    const teamId = searchParams.get('teamId');

    if (!eventSlug || !teamId) {
      return NextResponse.json(
        { error: 'eventSlug and teamId are required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
    const response = await fetch(
      `${baseUrl}/api/export/rubrics?eventSlug=${eventSlug}&teamId=${teamId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch rubrics from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error exporting rubrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
