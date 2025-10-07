'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Typography, Stack, Paper, Box, Divider } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NextLink from 'next/link';

interface Team {
  id: string;
  number: number;
  name: string;
}

interface Award {
  id: string;
  name: string;
  place: number;
  winner: Team | string;
  category: 'team' | 'personal' | 'advancement';
}

interface AwardsProps {
  awards: Award[];
  eventSlug: string;
}

const Awards: React.FC<AwardsProps> = ({ awards }) => {
  const t = useTranslations('pages.event');
  const locale = useLocale();
  const isHebrew = locale === 'he';

  const getColorByPlace = (place: number): string => {
    switch (place) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver  
      case 3: return '#CD7F32'; // Bronze
      default: return '#4CAF50'; // Green for other awards
    }
  };

  // Group awards by name, then sort by place
  const awardsByName = awards.reduce((acc, award) => {
    if (!acc[award.name]) {
      acc[award.name] = [];
    }
    acc[award.name].push(award);
    return acc;
  }, {} as Record<string, Award[]>);

  // Sort each award group by place
  Object.keys(awardsByName).forEach(awardName => {
    awardsByName[awardName].sort((a, b) => a.place - b.place);
  });

  const renderAwardSection = (awardName: string, awardList: Award[]) => {
    return (
      <Box key={awardName} sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'left', 
            mb: 2, 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {awardName}
        </Typography>
        
        <Stack spacing={1.5} sx={{ 
          alignItems: 'flex-start'
        }}>
          {awardList.map((award, index) => {
            const isTeamAward = typeof award.winner !== 'string';
            const winnerText = isTeamAward 
              ? `${(award.winner as Team).name} #${(award.winner as Team).number}`
              : award.winner as string;

            return (
              <Box 
                key={award.id}
                sx={{ 
                  minHeight: 40,
                  px: 2,
                  py: 1,
                  bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderRadius: 1,
                  border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: 'space-between',
                  flexDirection: isHebrew ? 'row-reverse' : 'row'
                }}
              >
                <EmojiEventsIcon 
                  sx={{ 
                    color: getColorByPlace(award.place),
                    fontSize: 20
                  }} 
                />
                
                {isTeamAward ? (
                  <Typography 
                    component={NextLink}
                    href={`/teams/${(award.winner as Team).number}`}
                    variant="body1"
                    sx={{ 
                      textDecoration: 'none',
                      color: 'text.primary',
                      fontWeight: index === 0 ? 600 : 400,
                      '&:hover': { 
                        textDecoration: 'underline',
                        color: 'primary.main'
                      }
                    }}
                  >
                    {winnerText}
                  </Typography>
                ) : (
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: index === 0 ? 600 : 400
                    }}
                  >
                    {winnerText}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
        
        {Object.keys(awardsByName).indexOf(awardName) < Object.keys(awardsByName).length - 1 && (
          <Divider sx={{ mt: 3, mb: 1 }} />
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          textAlign: 'center', 
          mb: 4, 
          fontWeight: 700,
          color: 'primary.main'
        }}
      >
        {t('quick-links.awards')}
      </Typography>

      {Object.keys(awardsByName).length > 0 ? (
        <Box>
          {Object.entries(awardsByName).map(([awardName, awardList]) => 
            renderAwardSection(awardName, awardList)
          )}
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            {t('awards.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default Awards;
