import { WithId } from 'mongodb';
import { Button, ButtonProps } from '@mui/material';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import { Division } from '@lems/types';
import { useTranslations } from 'next-intl';

interface GenerateScheduleButtonProps extends ButtonProps {
  division: WithId<Division>;
}

const GenerateScheduleButton: React.FC<GenerateScheduleButtonProps> = ({ division, ...props }) => {
  const t = useTranslations('components:admin:generate-schedule');
  return (
    <>
      <Button variant="contained" startIcon={<NoteAddRoundedIcon />} disabled={true} {...props}>
        {t('generate-schedule')}
      </Button>
    </>
  );
};

export default GenerateScheduleButton;
