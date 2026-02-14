'use client';

import { Typography, List, ListItem, ListItemText, IconButton, Stack, Chip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Division } from '@lems/types/api/admin';

interface PitMapAreaListProps {
  division: Division;
  pitMapData: any;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onUpdate: () => void;
}

export const PitMapAreaList: React.FC<PitMapAreaListProps> = ({
  division,
  pitMapData,
  onError,
  onSuccess,
  onUpdate
}) => {
  const t = useTranslations('pages.events.pit-map');

  const handleEditArea = (areaId: string) => {
    // TODO: Implement area editing
    onError('Area editing functionality coming soon');
  };

  const handleDeleteArea = async (areaId: string) => {
    // TODO: Implement area deletion
    onError('Area deletion functionality coming soon');
  };

  const areas = pitMapData?.areas || [];

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('areas.title')}</Typography>

      {areas.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('areas.no-areas')}
        </Typography>
      ) : (
        <List>
          {areas.map((area: any) => (
            <ListItem
              key={area.id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditArea(area.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteArea(area.id)}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={area.name}
                secondary={
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip label={`${t('areas.capacity')}: ${area.maxTeams}`} size="small" />
                    {area.divisionId && <Chip label={division.name} size="small" color="primary" />}
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
};
