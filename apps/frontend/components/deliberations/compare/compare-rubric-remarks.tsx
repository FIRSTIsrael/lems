import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import {
  Typography,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Table,
  Box
} from '@mui/material';
import { JudgingCategoryTypes } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import { CompareContext } from './compare-view';

interface CompareRubricRemarksProps {
  teamId: ObjectId;
}

const CompareRubricRemarks: React.FC<CompareRubricRemarksProps> = ({ teamId }) => {
  const { category, rubrics } = useContext(CompareContext);
  const categories = category ? [category] : [...JudgingCategoryTypes];

  return (
    <Box px={1}>
      <Table>
        <TableContainer>
          <TableHead sx={{ width: '100%' }}>
            <TableRow>
              {!category && <TableCell width={50} />}
              <TableCell align="center" sx={{ width: category ? '50%' : 'calc(50% - 25px)' }}>
                לשימור
              </TableCell>
              <TableCell align="center" sx={{ width: category ? '50%' : 'calc(50% - 25px)' }}>
                לשיפור
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(c => {
              const rubric = rubrics.find(r => r.teamId === teamId && r.category === c);
              return (
                <TableRow>
                  {!category && (
                    <TableCell align="center" component="th" scope="row">
                      {localizedJudgingCategory[c].name}
                    </TableCell>
                  )}
                  <TableCell align="left">{rubric?.data?.feedback.greatJob}</TableCell>
                  <TableCell align="left">{rubric?.data?.feedback.thinkAbout}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      </Table>
    </Box>
  );
};

export default CompareRubricRemarks;
