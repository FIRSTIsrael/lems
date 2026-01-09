import { Stack, Typography, Chip } from '@mui/material';
import { useRubricsTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';

interface SectionScoreRowProps {
  category: JudgingCategory;
  sectionId: string;
  scores: Array<{ fieldId: string; value: number | null; color: 'success' | 'error' | 'default' }>;
  showSectionName?: boolean;
  showAllScores?: boolean;
}

export function SectionScoreRow({
  category,
  sectionId,
  scores,
  showSectionName = true,
  showAllScores = false
}: SectionScoreRowProps) {
  const { getSectionTitle } = useRubricsTranslations(category);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
      {showSectionName && (
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontSize: '0.9rem',
            color: 'text.primary',
            fontWeight: 500
          }}
        >
          {getSectionTitle(sectionId)}
        </Typography>
      )}

      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          flexWrap: 'wrap',
          gap: showAllScores ? 0.75 : 0.5,
          justifyContent: showAllScores ? 'center' : 'flex-end',
          alignItems: 'center'
        }}
      >
        {(showAllScores ? scores : scores.slice(0, 2)).map((score, index) => (
          <Chip
            key={index}
            label={score.value ?? 'N/A'}
            size={showAllScores ? 'medium' : 'small'}
            color={score.color}
            sx={{
              minWidth: showAllScores ? 48 : 40,
              height: showAllScores ? 32 : 24,
              fontSize: showAllScores ? '0.9rem' : '0.8rem',
              fontWeight: 600,
              margin: showAllScores ? '2px' : '0px',
              '& .MuiChip-label': {
                px: showAllScores ? 1 : 0.75,
                fontSize: showAllScores ? '0.9rem' : '0.8rem'
              }
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
