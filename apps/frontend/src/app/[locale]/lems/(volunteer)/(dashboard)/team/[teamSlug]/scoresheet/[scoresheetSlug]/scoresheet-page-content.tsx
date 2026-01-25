'use client';

import { Container } from '@mui/material';
import { useScoresheet } from './scoresheet-context';
import { ScoresheetForm } from './components/scoresheet-form';
import { GPSelector } from './components/gp-selector';

export const ScoresheetPageContent: React.FC = () => {
  const { viewMode, forceEdit, scoresheet } = useScoresheet();

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      {viewMode === 'score' && (
        <ScoresheetForm
          disabled={
            scoresheet.status === 'gp' || scoresheet.status === 'submitted' ? !forceEdit : false
          }
        />
      )}
      {viewMode === 'gp' && <GPSelector disabled={scoresheet.status !== 'gp' && !forceEdit} />}
    </Container>
  );
};
