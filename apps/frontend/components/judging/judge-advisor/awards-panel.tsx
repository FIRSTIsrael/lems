import { WithId } from 'mongodb';
import { Division, JudgingDeliberation } from '@lems/types';
import ResultExportPaper from './result-export-paper';
import DeliberationsPaper from './deliberations-paper';

interface AwardsPanelProps {
  division: WithId<Division>;
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
