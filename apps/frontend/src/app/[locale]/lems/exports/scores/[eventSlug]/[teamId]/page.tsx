'use client';

import { useEffect, useState, use } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

interface ScoresExportPageProps {
  params: Promise<{
    locale: string;
    eventSlug: string;
    teamId: string;
  }>;
}

interface Mission {
  id: string;
  score: number;
}

interface ScoresData {
  teamNumber: number;
  teamName: string;
  missions: Mission[];
  totalScore: number;
}

export default function ScoresExportPage({ params: paramsPromise }: ScoresExportPageProps) {
  const params = use(paramsPromise);
  const [data, setData] = useState<ScoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { eventSlug, teamId } = params;
        const response = await fetch(`/api/export/scores?eventSlug=${eventSlug}&teamId=${teamId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch scores');
        }

        const scoresData: ScoresData = await response.json();
        setData(scoresData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scores');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [params]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">No scores found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, '@media print': { margin: 0, padding: 0 } }}>
      <Box sx={{ mb: 3 }}>
        <h1>Team Scores</h1>
        <p>
          Team #{data.teamNumber} - {data.teamName}
        </p>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.missions.map(mission => (
          <Box
            key={mission.id}
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#fff'
            }}
          >
            {/* Score on the left */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '60px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2e7d32',
                backgroundColor: '#f0f0f0',
                borderRadius: 1,
                p: 2
              }}
            >
              {mission.score}
            </Box>

            {/* Mission details */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 0.5 }}>{mission.id}</Box>
            </Box>
          </Box>
        ))}

        {/* Total Score */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          <Box sx={{ flex: 1 }}>Total Score</Box>
          <Box sx={{ color: '#1976d2' }}>{data.totalScore}</Box>
        </Box>
      </Box>
    </Box>
  );
}
