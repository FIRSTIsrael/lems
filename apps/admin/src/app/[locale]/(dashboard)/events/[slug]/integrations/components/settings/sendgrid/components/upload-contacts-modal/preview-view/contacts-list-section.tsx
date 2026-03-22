'use client';

import { Box, Stack, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Flag } from '@lems/shared';
import { Contact } from '../../../types';

interface ContactsListSectionProps {
  title: string;
  contacts: Contact[];
  moreLabel: string;
}

export const ContactsListSection: React.FC<ContactsListSectionProps> = ({
  title,
  contacts,
  moreLabel
}) => {
  return (
    <Box width="100%">
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <List dense>
        {contacts.slice(0, 3).map(contact => (
          <ListItem key={contact.team_number} disablePadding>
            <Stack direction="row" spacing={1}>
              <Flag region={contact.region} size={20} />
              <Typography variant="body2">{`#${contact.team_number} - ${contact.recipient_email}`}</Typography>
            </Stack>
          </ListItem>
        ))}
        {contacts.length > 3 && (
          <ListItem disablePadding>
            <ListItemText
              primary={moreLabel}
              slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};
