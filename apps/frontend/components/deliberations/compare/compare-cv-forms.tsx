import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Stack, Avatar, Typography } from '@mui/material';
import { cvFormSchema } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareCvFormsProps {
  teamId: ObjectId;
}

const CompareCvForms: React.FC<CompareCvFormsProps> = ({ teamId }) => {
  const { teams, cvForms } = useContext(CompareContext);
  const team = teams.find(t => t._id === teamId);
  const teamCvFormSeverities = cvForms
    .filter(cvform => cvform.demonstratorAffiliation === team?.number.toString())
    .map(cvForm => cvForm.severity);

  return (
    <Stack direction="row" alignItems="center" height="100%" spacing={1} px={2}>
      <Typography fontWeight={500}>טפסי CV:</Typography>
      {teamCvFormSeverities.map((severity, index) => (
        <Avatar
          key={index}
          sx={{ height: '30px', width: '30px' }}
          alt="חומרת הטופס"
          src={`https://emojicdn.elk.sh/${
            cvFormSchema.categories.find(c => c.id === severity)?.emoji
          }`}
        />
      ))}
    </Stack>
  );
};

export default CompareCvForms;
