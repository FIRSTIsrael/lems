import { Avatar, Stack, Typography } from '@mui/material';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import AdminLayout from "../../components/layouts/admin-layout";

export default function Index() {
  return (
    <AdminLayout>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        minHeight={500}
      >
        <Avatar sx={{ bgcolor: '#ffb24d', width: '3.5rem', height: '3.5rem' }}>
          <PriorityHighOutlinedIcon sx={{ fontSize: '2rem' }} />
        </Avatar>
        <Typography fontSize={'1.5rem'} align="center">
          יש לבחור אירוע
        </Typography>
      </Stack>
    </AdminLayout>
  );
}
