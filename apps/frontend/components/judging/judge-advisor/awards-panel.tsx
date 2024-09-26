import { WithId } from 'mongodb';
import { Award, Division, JudgingDeliberation } from '@lems/types';
import ResultExportPaper from './result-export-paper';
import DeliberationsPaper from './deliberations-paper';

interface AwardsPanelProps {
  division: WithId<Division>;
  awards: Array<WithId<Award>>;
  deliberations: Array<WithId<JudgingDeliberation>>;
}

const AwardsPanel: React.FC<AwardsPanelProps> = ({ division, deliberations }) => {
  return (
    <>
      <DeliberationsPaper division={division} deliberations={deliberations} />
      <ResultExportPaper division={division} />
    </>
  );
};

export default AwardsPanel;
