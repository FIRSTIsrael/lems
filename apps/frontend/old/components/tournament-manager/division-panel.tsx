import { useState } from 'react';
import { WithId } from 'mongodb';
import { Division, DivisionState } from '@lems/types';
import ResultExportPaper from './result-export-paper';
import EventManagementPaper from './event-management-paper';

interface DivisionPanelProps {
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
}

const DivisionPanel: React.FC<DivisionPanelProps> = ({
  division,
  divisionState: initialDivisionState
}) => {
  const [divisionState, setDivisionState] = useState(initialDivisionState);

  return (
    <>
      <EventManagementPaper
        division={division}
        divisionState={divisionState}
        setDivisionState={setDivisionState}
      />
      <ResultExportPaper division={division} />
    </>
  );
};

export default DivisionPanel;
