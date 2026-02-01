import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from 'next-intl';
import type { SlotInfo } from '../types';

interface SelectedSlotHeaderProps {
  selectedSlot: SlotInfo | null;
  onClose: () => void;
}

export function SelectedSlotHeader({ selectedSlot, onClose }: SelectedSlotHeaderProps) {
  const t = useTranslations('pages.tournament-manager');

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {selectedSlot?.type === 'match'
            ? `${t('match')} - ${selectedSlot.tableName}`
            : `${t('session')} - ${selectedSlot?.roomName}`}
        </Typography>
        <Typography variant="h6" fontWeight={700} color="primary" noWrap>
          #{selectedSlot?.team?.number} {selectedSlot?.team?.name}
        </Typography>
        {(selectedSlot?.team?.affiliation || selectedSlot?.team?.city) && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {[selectedSlot.team.affiliation, selectedSlot.team.city].filter(Boolean).join(' • ')}
          </Typography>
        )}
      </Box>
      <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', ml: 1 }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
