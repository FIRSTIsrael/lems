import Image from 'next/image';
import { Paper, Stack, Typography } from '@mui/material';

const DoneCard: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        transform: 'translateY(100%)',
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447',
        mt: 4,
        p: 4
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Image
          src="/assets/emojis/party-popper.png"
          alt="אימוג׳י של קונפטי"
          height={42}
          width={42}
        />
        <Typography variant="h4" sx={{ mb: 2 }}>
          סיימתם את המקצים של השולחן שלכם!
        </Typography>
        <Typography fontSize="1.15rem" color="#666">
          אנו מודים לכם שהתנדבתם איתנו היום ועל התמיכה במשימתנו. ביחד, אנו מעצימים את הדור הבא של
          מנהיגי המדע והטכנולוגיה ובונים עולם טוב יותר.
        </Typography>
        <Typography fontSize="1rem" color="#666">
          זה זמן טוב להחזיר את הטאבלט לטעינה ולחזור לחדר המתנדבים.
        </Typography>
      </Stack>
    </Paper>
  );
};

export default DoneCard;
