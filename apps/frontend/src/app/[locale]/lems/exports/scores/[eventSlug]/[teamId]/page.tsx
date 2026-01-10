'use client';

import { useEffect, useState, use } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

interface ScoresExportPageProps {
  params: Promise<{
    locale: string;
    eventSlug: string;
    teamId: string;
  }>;
}

interface ScoresData {
  teamNumber: number;
  teamName: string;
  scores: Record<string, number>;
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

        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const values = lines[1].split(',');

        const scoresData: ScoresData = {
          teamNumber: parseInt(values[0]),
          teamName: values[1],
          scores: {}
        };

        for (let i = 2; i < headers.length; i++) {
          const header = headers[i].replace(/"/g, '');
          scoresData.scores[header] = parseFloat(values[i]);
        }

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

  const roundKeys = Object.keys(data.scores).filter(key => key.startsWith('Round'));

  return (
    <Box sx={{ p: 2, '@media print': { margin: 0, padding: 0 } }}>
      <Box sx={{ mb: 3 }}>
        <h1>Team Scores</h1>
        <p>
          Team #{data.teamNumber} - {data.teamName}
        </p>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Round</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Score
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roundKeys.map(round => (
              <TableRow key={round}>
                <TableCell>{round}</TableCell>
                <TableCell align="right">{data.scores[round]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
