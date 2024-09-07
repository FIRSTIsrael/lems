import { useContext, useMemo } from 'react';
import { WithId, ObjectId } from 'mongodb';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { red, blue, green } from '@mui/material/colors';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Text
} from 'recharts';
import { localizedJudgingCategory, RubricSchemaSection, rubricsSchemas } from '@lems/season';
import { JudgingCategory, Rubric } from '@lems/types';
import { average } from '@lems/utils/arrays';
import { CompareContext } from './compare-view';
import { localizeTeam } from 'apps/frontend/localization/teams';

interface CompareTeamInfoProps {
  teamId: ObjectId;
}

const CompareTeamInfo: React.FC<CompareTeamInfoProps> = ({ teamId }) => {
  const { teams, rubrics, category } = useContext(CompareContext);
  const team = teams.find(t => t._id === teamId);
  const teamRubrics = rubrics.filter(rubric => rubric.teamId === teamId);

  if (!team) return;

  const scoreAvg = average(
    teamRubrics.map(rubric =>
      average(Object.values(rubric.data?.values ?? {}).flatMap(value => value.value))
    )
  );

  return (
    <Grid container alignItems="center" px={2}>
      <Grid xs={6}>
        <Typography fontSize="1.5rem" fontWeight={700}>
          {localizeTeam(team, true)}
        </Typography>
        <Typography fontSize="1.25rem" fontWeight={500}>
          ניקוד ממוצע: {scoreAvg}
        </Typography>
      </Grid>
      <Grid xs={6}>
        {category ? (
          <CategoryAlignmentChart
            category={category}
            rubric={teamRubrics.find(r => r.category === category)}
          />
        ) : (
          <RubricAlignmentChart rubrics={teamRubrics} />
        )}
      </Grid>
    </Grid>
  );
};

interface CategoryAlignmentChartProps {
  category: JudgingCategory;
  rubric?: WithId<Rubric<JudgingCategory>>;
}

type CategoryAlignmentChartData = Array<{
  section: string;
  average: number;
}>;

const CategoryAlignmentChart: React.FC<CategoryAlignmentChartProps> = ({ category, rubric }) => {
  const sections = rubricsSchemas[category].sections;

  const getSectionAverage = (section: RubricSchemaSection): number => {
    const fields = section.fields.flatMap(f => f.id);
    const scores = fields.map(f => rubric?.data?.values?.[f]?.value).filter(s => s !== undefined);
    return average(scores);
  };

  const data: CategoryAlignmentChartData = sections.map(section => ({
    section: section.title,
    average: getSectionAverage(section)
  }));

  const color: string = useMemo(() => {
    const colors = {
      'innovation-project': blue[200],
      'core-values': red[200],
      'robot-design': green[200]
    };
    return colors[category];
  }, [category]);

  const renderPolarAngleAxis = (props: any) => {
    const { payload, x, y, cx, cy, ...rest } = props;
    const section: string = payload.value;
    return (
      <Text
        {...rest}
        fontSize="0.7rem"
        verticalAnchor="middle"
        y={y + (y - cy) / 6}
        x={x + (x - cx) / 6}
      >
        {section}
      </Text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={170}>
      <RadarChart outerRadius={60} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="section" tick={props => renderPolarAngleAxis(props)} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} type="number" fontSize="0.8rem" />
        <Radar name="team" dataKey="average" stroke={color} fill={color} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

interface RubricAlignmentChartProps {
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

type RubricAlignmentChartData = Array<{
  category: JudgingCategory;
  average: number;
}>;

const RubricAlignmentChart: React.FC<RubricAlignmentChartProps> = ({ rubrics }) => {
  const data: RubricAlignmentChartData = rubrics.map(rubric => {
    const avg = average(Object.values(rubric.data?.values ?? {}).flatMap(value => value.value));
    return { category: rubric.category, average: avg };
  });

  const color: string = useMemo(() => {
    const colors = {
      'innovation-project': blue[200],
      'core-values': red[200],
      'robot-design': green[200]
    };
    const sorted = structuredClone(data).sort((a, b) => b.average - a.average);
    if (sorted[0] === sorted[1]) return '#aaa';
    return colors[sorted[0].category];
  }, [data]);

  const renderPolarAngleAxis = (props: any) => {
    const { payload, x, y, cx, cy, ...rest } = props;
    const category: JudgingCategory = payload.value;
    return (
      <Text
        {...rest}
        fontSize="0.7rem"
        verticalAnchor="middle"
        y={y + (y - cy) / 6}
        x={x + (x - cx) / 6}
      >
        {localizedJudgingCategory[category].name}
      </Text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={170}>
      <RadarChart outerRadius={60} data={data} cy={110}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={props => renderPolarAngleAxis(props)} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} type="number" fontSize="0.8rem" />
        <Radar name="team" dataKey="average" stroke={color} fill={color} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default CompareTeamInfo;
