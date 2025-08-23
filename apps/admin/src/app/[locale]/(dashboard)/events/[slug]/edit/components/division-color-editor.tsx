'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Box, Stack, IconButton } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Division } from '@lems/types/api/admin';
import { ColorPicker } from '@lems/shared';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/react-color';
import { apiFetch } from '../../../../../../../lib/fetch';
import { defaultColor } from '../../../../../../../theme';

interface DivisionColorEditorProps {
  division: Division;
  onChange: () => Promise<void>;
}

export const DivisionColorEditor: React.FC<DivisionColorEditorProps> = ({ division, onChange }) => {
  const t = useTranslations('pages.events.edit');

  const [isEditingColor, setIsEditingColor] = useState(false);
  const [editColor, setEditColor] = useState<HsvaColor>(hexToHsva(defaultColor));

  const handleColorEditStart = () => {
    setIsEditingColor(true);
    setEditColor(hexToHsva(division.color));
  };

  const handleColorEditCancel = () => {
    setIsEditingColor(false);
    setEditColor(hexToHsva(division.color));
  };

  const handleColorEditSave = async () => {
    const result = await apiFetch(`/admin/events/${division.eventId}/divisions/${division.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: division.name,
        color: hsvaToHex(editColor)
      })
    });

    if (result.ok) {
      setIsEditingColor(false);
      await onChange();
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <PaletteIcon color="primary" />
      <Stack>
        <Typography variant="body2" color="text.secondary">
          {t('color')}
        </Typography>
        {isEditingColor ? (
          <Stack direction="row" alignItems="center" gap={1}>
            <ColorPicker value={editColor} onChange={color => setEditColor(color)} defaultOpen>
              <IconButton
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: hsvaToHex(editColor),
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: hsvaToHex(editColor),
                    opacity: 0.8,
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </ColorPicker>
            <Typography variant="body1" dir="ltr" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
              {hsvaToHex(editColor)}
            </Typography>
            <IconButton onClick={handleColorEditSave} color="primary" size="small">
              <CheckIcon />
            </IconButton>
            <IconButton onClick={handleColorEditCancel} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundColor: division.color,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)'
                },
                transition: 'transform 0.2s ease-in-out'
              }}
              onClick={handleColorEditStart}
            />
            <Typography variant="body1" dir="ltr" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
              {division.color}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
