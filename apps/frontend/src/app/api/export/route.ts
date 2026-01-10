import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventSlug = searchParams.get('eventSlug');
    const teamId = searchParams.get('teamId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    if (!eventSlug || !teamId || !type) {
      return NextResponse.json(
        { error: 'eventSlug, teamId, and type are required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

    if (type === 'scores') {
      const response = await fetch(
        `${baseUrl}/api/export/scores?eventSlug=${eventSlug}&teamId=${teamId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch scores from backend' },
          { status: response.status }
        );
      }

      const csv = await response.text();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="scores-${teamId}.csv"`
        }
      });
    } else if (type === 'rubrics') {
      if (!category) {
        return NextResponse.json(
          { error: 'Category is required for rubrics export' },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${baseUrl}/api/export/rubrics?eventSlug=${eventSlug}&teamId=${teamId}&category=${category}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch rubrics from backend' },
          { status: response.status }
        );
      }

      const pdf = await response.arrayBuffer();
      return new NextResponse(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="rubrics-${category}-${teamId}.pdf"`
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
