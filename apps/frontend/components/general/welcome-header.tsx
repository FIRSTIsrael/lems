import { Paper, Typography } from '@mui/material';
import { Event, SafeUser } from '@lems/types';
import { localizedRoles } from '../../localization/roles';

interface Props {
  event: Event;
  user: SafeUser;
}

const WelcomeHeader = ({ event, user }: Props) => {
  return (
    <Paper
      elevation={0}
      sx={{
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447',
        my: 4,
        py: 3,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h1" fontSize="1.25rem" fontWeight={700} gutterBottom>
        ברוכים הבאים ל{event.name}
      </Typography>
      <Typography color="#666" fontSize="0.875rem">
        יחד, אנו מעצימים את הדור הבא של מנהיגי המדע והטכנולוגיה ובונים עולם טוב יותר.
      </Typography>
      <Typography color="#666" fontSize="0.875rem">
        תודה שבאת להתנדב איתנו בתור {user.role ? localizedRoles[user.role].name : ''}!
      </Typography>
    </Paper>
  );
};

export default WelcomeHeader;
