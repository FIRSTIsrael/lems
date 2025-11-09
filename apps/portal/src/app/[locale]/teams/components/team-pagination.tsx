import { Grid, Pagination } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';

interface TeamPaginationProps {
  currentPage: number;
  totalPages: number;
}

export const TeamPagination: React.FC<TeamPaginationProps> = ({ currentPage, totalPages }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePaginationChange = (_event: ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', value.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Grid size={12}>
      <Pagination
        sx={{ display: 'flex', justifyContent: 'center' }}
        count={totalPages}
        page={currentPage}
        onChange={handlePaginationChange}
        color="primary"
      />
    </Grid>
  );
};
