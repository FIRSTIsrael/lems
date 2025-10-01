import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { Casino } from '@mui/icons-material';
import { TeamSchedule } from '@lems/types/api/admin';
import { RoomWithTeam } from './types';
import { JudgingSessionTime, formatTime } from './utils';

interface SwapConfirmDialogProps {
  open: boolean;
  isSwapping: boolean;
  selectedRoom: RoomWithTeam | null;
  teamSchedule: TeamSchedule | null | undefined;
  judgingSessionTimes: JudgingSessionTime[];
  onClose: () => void;
  onConfirm: () => void;
}

export const SwapConfirmDialog: React.FC<SwapConfirmDialogProps> = ({
  open,
  isSwapping,
  selectedRoom,
  teamSchedule,
  judgingSessionTimes,
  onClose,
  onConfirm
}) => {
  const t = useTranslations('pages.events.schedule.teamSwap');

  const getRoomName = () => {
    if (!teamSchedule?.judgingSession) return '?';
    return (
      judgingSessionTimes
        .flatMap(ts => ts.rooms)
        .find(r => r.session?.id === teamSchedule.judgingSession?.id)?.name || '?'
    );
  };

  return (
    <Dialog open={open} onClose={() => !isSwapping && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{t('confirmDialog.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {selectedRoom && teamSchedule && (
            <>
              {t('confirmDialog.message', {
                team1Number: teamSchedule.team.number,
                room1Name: getRoomName(),
                time1: teamSchedule.judgingSession
                  ? formatTime(teamSchedule.judgingSession.scheduledTime)
                  : '?',
                team2Number: selectedRoom.teamNumber || t('empty'),
                room2Name: selectedRoom.roomName,
                time2: formatTime(selectedRoom.time)
              })}
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSwapping}>
          {t('confirmDialog.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={isSwapping}
          startIcon={isSwapping ? <CircularProgress size={18} /> : <Casino />}
        >
          {isSwapping ? t('confirmDialog.swapping') : t('confirmDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
