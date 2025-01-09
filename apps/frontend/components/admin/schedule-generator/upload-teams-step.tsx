import { WithId } from 'mongodb';
import { Division, Team } from '@lems/types';
import UploadFileButton from '../../general/upload-file';

interface UploadTeamsStepProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  onSuccess: () => void;
  onError: () => void;
}

const UploadTeamsStep: React.FC<UploadTeamsStepProps> = ({
  division,
  teams,
  onSuccess,
  onError
}) => {
  return (
    <>
      <UploadFileButton
        urlPath={`/api/admin/divisions/${division?._id}/team-list`}
        displayName="רשימת קבוצות"
        extension=".csv"
        reload={false}
        onSuccess={onSuccess}
        onError={onError}
      />
      <p>{teams.length}</p>
      {/* TODO: render team list here if teams > 0, else text "no teams" */}
    </>
  );
};

export default UploadTeamsStep;
