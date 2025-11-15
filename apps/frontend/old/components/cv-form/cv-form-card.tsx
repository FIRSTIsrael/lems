import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Card, CardHeader, CardContent, Typography, IconButton } from '@mui/material';
import { green } from '@mui/material/colors';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { cvFormSchema } from '@lems/season';
import { Division, CoreValuesForm } from '@lems/types';
import { localizedFormSubject } from '../../localization/cv-form';

interface CVFormCardProps {
  division: WithId<Division>;
  form: WithId<CoreValuesForm>;
}

const CVFormCard: React.FC<CVFormCardProps> = ({ division, form }) => {
  const router = useRouter();
  return (
    <Card sx={{ ...(form.actionTaken && { backgroundColor: green[100] }) }}>
      <CardHeader
        avatar={
          <Avatar
            alt="חומרת הטופס"
            src={`https://emojicdn.elk.sh/${
              cvFormSchema.categories.find(c => c.id === form.severity)?.emoji
            }`}
          />
        }
        action={
          <IconButton onClick={() => router.push(`/lems/cv-forms/${form._id}`)}>
            <OpenInFullIcon />
          </IconButton>
        }
        title={`דיווח על ${form.demonstrators
          .map(d =>
            d === 'team'
              ? `קבוצה #${form.demonstratorAffiliation?.number}`
              : localizedFormSubject[d]
          )
          .join(', ')}`}
        subheader={`האירוע נצפה על ידי ${form.observers
          .map(o =>
            o === 'team' ? `קבוצה #${form.observerAffiliation?.number}` : localizedFormSubject[o]
          )
          .join(', ')}`}
      />
      <CardContent>
        <Typography fontSize="0.875rem">
          הוגש על ידי {form.completedBy.name} ({form.completedBy.affiliation}) טל.{' '}
          {form.completedBy.phone}
        </Typography>
        <Typography fontSize="0.875rem" color="textSecondary">
          {form.details}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CVFormCard;
