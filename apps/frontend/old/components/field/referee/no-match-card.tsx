import Image from 'next/image';
import { Paper, Stack, Typography } from '@mui/material';

const NoMatchCard: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447',
        mt: 4,
        p: 4
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Image
          src="/assets/emojis/hourglass-done.png"
          alt="אימוג׳י של שעון חול"
          height={42}
          width={42}
        />
        <Typography variant="h4" sx={{ mb: 2 }}>
          אין לכם מקצה פועל כרגע!
        </Typography>
        <Typography fontSize="1.15rem" sx={{ color: '#666' }}>
          אנו מודים לכם שהתנדבתם איתנו היום ועל התמיכה במשימתנו. ביחד, אנו מעצימים את הדור הבא של
          מנהיגי המדע והטכנולוגיה ובונים עולם טוב יותר.
        </Typography>
        <Typography fontSize="1rem" sx={{ color: '#666' }}>
          זה זמן טוב לשתות מים ולהתכונן למקצה הבא.
        </Typography>
      </Stack>
    </Paper>
  );
};

export default NoMatchCard;
