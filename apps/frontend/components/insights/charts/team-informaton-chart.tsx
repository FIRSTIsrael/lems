import { WithId } from 'mongodb';
import { Avatar, Stack, Table, TableBody, TableRow, TableCell, Skeleton } from '@mui/material';
import { apiFetch } from '../../../lib/utils/fetch';
import { useEffect, useState } from 'react';
import { AwardNames, CVFormCategoryNames, Division, Team } from '@lems/types';
import { cvFormSchema, localizedAward } from '@lems/season';

interface TeamInformationChartProps {
  division: WithId<Division>;
  team: WithId<Team> | null;
}

interface RobotPerformanceInfo {
  stdDev: number;
  maxScore: number;
  averageScore: number;
  relStdDev: number;
}

interface TeamInformationChartData {
  robotPerformance: RobotPerformanceInfo;
  awards: Array<{ name: AwardNames; place: number }>;
  cvForms: Array<{ severity: CVFormCategoryNames }>;
}

const TeamInformationChart: React.FC<TeamInformationChartProps> = ({ division, team }) => {
  const [data, setData] = useState<TeamInformationChartData | null>(null);

  useEffect(() => {
    if (team)
      apiFetch(`/api/divisions/${division._id}/insights/team/${team._id}/team-stats-summary`).then(
        res => res.json().then(data => setData(data))
      );
  }, [division._id, team]);

  return (
    <>
      {team && data ? (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>ניקוד גבוה ביותר (רובוט)</TableCell>
              <TableCell>{Number(data.robotPerformance.maxScore?.toFixed(2))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>סטיית תקן יחסית (רובוט)</TableCell>
              <TableCell>{Number(data.robotPerformance.relStdDev?.toFixed(2)) + '%'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>פרסים</TableCell>
              <TableCell>
                {data.awards.length > 0
                  ? data.awards
                      .map(award => `${localizedAward[award.name].name}, מקום ${award.place}`)
                      .join(', ')
                  : 'אין'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>טפסי CV</TableCell>
              <TableCell>
                {data.cvForms.length > 0 ? (
                  <Stack direction="row" spacing={1}>
                    {' '}
                    {data.cvForms.map((cvForm, index) => (
                      <Avatar
                        key={index}
                        sx={{ height: '30px', width: '30px' }}
                        alt="חומרת הטופס"
                        src={`https://emojicdn.elk.sh/${
                          cvFormSchema.categories.find(c => c.id === cvForm.severity)?.emoji
                        }`}
                      />
                    ))}
                  </Stack>
                ) : (
                  'אין'
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <Skeleton width="100%" height={320} />
      )}
    </>
  );
};

export default TeamInformationChart;
