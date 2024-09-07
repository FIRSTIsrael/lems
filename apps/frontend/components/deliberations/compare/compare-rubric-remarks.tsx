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
  Box,
  Divider
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
    <TableContainer sx={{ px: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {!category && <TableCell width={50} />}
            <TableCell align="center">לשימור</TableCell>
            <TableCell align="center">לשיפור</TableCell>
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
      </Table>
    </TableContainer>
  );
};

export default CompareRubricRemarks;
