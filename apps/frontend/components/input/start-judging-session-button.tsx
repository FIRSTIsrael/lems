import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { IconButton, IconButtonProps } from '@mui/material';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import { JudgingSession, Status } from '@lems/types';

const getButtonColor = (status: Status) => {
  switch (status) {
    case 'not-started':
      return '#4c78f5';
    case 'in-progress':
      return '#f58a4c';
    case 'completed':
      return '#138a17';
  }
};

const canStart = (session: JudgingSession) => {
  return session.status === 'not-started' && dayjs() > dayjs(session.time).subtract(5, 'minutes');
};

interface Props extends IconButtonProps {
  session: WithId<JudgingSession>;
}

const StartJudgingSessionButton: React.FC<Props> = ({ session, ...props }) => {
  return (
    <IconButton
      aria-label="Start session"
      onClick={() => console.log('starting session: ' + session._id)}
      disabled={!canStart(session)}
      sx={{ color: getButtonColor(session.status) }}
      {...props}
    >
      <PlayCircleFilledWhiteOutlinedIcon />
    </IconButton>
  );
};

export default StartJudgingSessionButton;
