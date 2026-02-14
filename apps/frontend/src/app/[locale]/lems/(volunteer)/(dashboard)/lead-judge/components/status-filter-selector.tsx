import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Checkbox, Button, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface StatusFilterSelectorProps {
  statuses: string[];
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  filterLabel?: string;
  isStatusFilter?: boolean;
  filterType?: 'status' | 'room' | 'session';
}

export const StatusFilterSelector: React.FC<StatusFilterSelectorProps> = ({
  statuses,
  statusFilter,
  setStatusFilter,
  filterLabel,
  isStatusFilter = true,
  filterType = 'status'
}) => {
  const t = useTranslations('pages.lead-judge.list');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const defaultLabel = filterLabel || t('filter.status');

  const getDisplayLabel = () => {
    if (statusFilter.length === 0) return defaultLabel;

    switch (filterType) {
      case 'status':
        return `${t('filter.status')}: ${statusFilter.map(s => t(`session-status.${s}`)).join(', ')}`;
      case 'room':
        return `${t('filter.rooms')}: ${statusFilter.join(', ')}`;
      case 'session':
        return `${t('filter.sessions')}: ${statusFilter.join(', ')}`;
      default:
        return statusFilter.join(', ');
    }
  };

  const displayLabel = getDisplayLabel();

  const getItemLabel = (status: string) => {
    if (isStatusFilter) {
      return t(`session-status.${status}`);
    }
    return status;
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        sx={{
          flex: 1,
          minWidth: 200,
          justifyContent: 'space-between',
          borderColor: 'rgba(0, 0, 0, 0.25)'
        }}
      >
        <Typography color="text.secondary">{displayLabel}</Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: 48 * 4.5 + 8,
              width: 250
            }
          }
        }}
      >
        {statuses.map(status => (
          <MenuItem key={status} onClick={() => handleStatusChange(status)}>
            <Checkbox checked={statusFilter.includes(status)} />
            <ListItemText primary={getItemLabel(status)} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
