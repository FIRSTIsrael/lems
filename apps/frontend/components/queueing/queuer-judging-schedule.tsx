import { useState } from 'react';
import { WithId } from 'mongodb';
import { Event, Team, JudgingSession, JudgingRoom } from '@lems/types';
import ReportJudgingSchedule from '../judging/report-judging-schedule';

interface QueuerJudgingScheduleProps {
  division: WithId<Event>;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
}

const QueuerJudgingSchedule: React.FC<QueuerJudgingScheduleProps> = ({
  division,
  teams,
  rooms,
  sessions
}) => {
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);

  return (
    <ReportJudgingSchedule
      division={division}
      rooms={rooms}
      sessions={sessions}
      teams={teams}
      showGeneralSchedule={showGeneralSchedule}
    />
  );
};

export default QueuerJudgingSchedule;
