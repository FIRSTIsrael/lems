'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip, Avatar } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { useCompareContext } from '../compare-context';
import type { Team, RubricFieldValue } from '../graphql/types';

interface TeamHeaderProps {
  team: Team;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const { category } = useCompareContext();
  const t = useTranslations('layouts.deliberation.compare');

  // Calculate average score
  const averageScore = useMemo(() => {
    const rubrics = Object.values(team.rubrics).filter(Boolean);
    if (rubrics.length === 0) return 0;

    let totalScore = 0;
    let totalFields = 0;

    rubrics.forEach(rubric => {
      if (rubric?.data?.fields) {
        Object.values(rubric.data.fields).forEach((fieldValue: unknown) => {
          const typedField = fieldValue as RubricFieldValue;
          if (typedField && typedField.value) {
            totalScore += typedField.value;
            totalFields++;
          }
        });
      }
    });

    return totalFields > 0 ? totalScore / totalFields : 0;
  }, [team.rubrics]);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          direction: 'ltr'
        }}
      >
        <Box sx={{ flexShrink: 0, textAlign: 'left', order: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {team.name} - #{team.number}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {team.affiliation}
          </Typography>
          {/*
          {team.judgingSession?.room && (
            <Typography variant="body2" color="text.secondary">
              {team.judgingSession.room.name}
            </Typography>
          )} */}
          <Chip
            label={`${t('average')}: ${averageScore.toFixed(2)}`}
            size="small"
            color={team.arrived ? 'success' : 'default'}
            sx={{ mt: 1 }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, order: 2 }}>
          {category ? (
            <CategoryRadarChart team={team} category={category} />
          ) : (
            <AllCategoriesRadarChart team={team} />
          )}
        </Box>

        <Avatar
          src={team.logoUrl ?? '/assets/default-avatar.svg'}
          alt={`${team.name} logo`}
          sx={{
            width: 75,
            height: 75,
            objectFit: 'cover',
            flexShrink: 0,
            order: 3
          }}
        />
      </Box>
    </Stack>
  );
}

interface CategoryRadarChartProps {
  team: Team;
  category: string;
}

function CategoryRadarChart({ team, category }: CategoryRadarChartProps) {
  const rubricKey = category.replace('-', '_') as keyof typeof team.rubrics;
  const rubric = team.rubrics[rubricKey];
  const tSections = useTranslations(`pages.judge.schedule.rubric-sections.${category}`);

  // For core-values, use IP section translations
  const tIpSections = useTranslations('pages.judge.schedule.rubric-sections.innovation-project');

  const data = useMemo(() => {
    // For core-values, get coreValues fields from IP and RD rubrics grouped by section
    if (category === 'core-values') {
      const ipRubric = team.rubrics.innovation_project;
      const rdRubric = team.rubrics.robot_design;

      if (!ipRubric?.data?.fields && !rdRubric?.data?.fields) return [];

      const ipFields =
        (ipRubric?.data?.fields as Record<string, { value: number | null; notes?: string }>) || {};
      const rdFields =
        (rdRubric?.data?.fields as Record<string, { value: number | null; notes?: string }>) || {};

      // Get coreValues fields from IP and RD schemas, grouped by section
      const ipSchema = rubrics['innovation-project'];
      const rdSchema = rubrics['robot-design'];

      // Use the same sections as IP/RD (identify, design, create, iterate, communicate)
      // and collect coreValues fields from both IP and RD for each section
      return ipSchema.sections.map(section => {
        const sectionValues: number[] = [];

        // Get coreValues fields from IP for this section
        section.fields.forEach(field => {
          if (field.coreValues && ipFields[field.id]?.value != null) {
            sectionValues.push(ipFields[field.id].value as number);
          }
        });

        // Get coreValues fields from RD for the matching section
        const rdSection = rdSchema.sections.find(s => s.id === section.id);
        rdSection?.fields.forEach(field => {
          if (field.coreValues && rdFields[field.id]?.value != null) {
            sectionValues.push(rdFields[field.id].value as number);
          }
        });

        const avgScore =
          sectionValues.length > 0
            ? sectionValues.reduce((sum, val) => sum + val, 0) / sectionValues.length
            : 0;

        return {
          field: tIpSections(section.id),
          score: avgScore
        };
      });
    }

    // For IP/RD, use the rubric schema sections
    if (!rubric?.data?.fields) return [];

    const categoryKey = category as 'innovation-project' | 'robot-design';
    const schema = rubrics[categoryKey];
    if (!schema || !schema.sections || schema.sections.length === 0) return [];

    const fields = rubric.data.fields as Record<string, { value: number | null; notes?: string }>;

    // Group fields by section and calculate averages using the schema
    return schema.sections.map(
      (section: { id: string; fields: { id: string; coreValues?: boolean }[] }) => {
        const sectionFieldIds = section.fields.map((f: { id: string }) => f.id);
        const sectionValues = sectionFieldIds
          .map((fieldId: string) => fields[fieldId]?.value)
          .filter(
            (value: number | null | undefined) => value !== null && value !== undefined
          ) as number[];

        const avgScore =
          sectionValues.length > 0
            ? sectionValues.reduce((sum, val) => sum + val, 0) / sectionValues.length
            : 0;

        return {
          field: tSections(section.id),
          score: avgScore
        };
      }
    );
  }, [rubric, category, tSections, tIpSections, team.rubrics]);

  const color = useMemo(() => {
    const colors = {
      innovation_project: blue[300],
      robot_design: green[300],
      core_values: red[300]
    };
    return colors[rubricKey as keyof typeof colors] || blue[300];
  }, [rubricKey]);

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No rubric data
      </Typography>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="field" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 12 }} />
        <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

interface AllCategoriesRadarChartProps {
  team: Team;
}

function AllCategoriesRadarChart({ team }: AllCategoriesRadarChartProps) {
  const { getCategory } = useJudgingCategoryTranslations();

  const data = useMemo(() => {
    const result: { category: string; score: number }[] = [];

    // Innovation Project average
    const ipRubric = team.rubrics.innovation_project;
    if (ipRubric?.data?.fields) {
      const ipFields = ipRubric.data.fields as Record<
        string,
        { value: number | null; notes?: string }
      >;
      const ipValues = Object.values(ipFields)
        .filter(field => field.value !== null)
        .map(field => field.value || 0);
      const ipAvg =
        ipValues.length > 0 ? ipValues.reduce((sum, val) => sum + val, 0) / ipValues.length : 0;
      result.push({ category: getCategory('innovation-project'), score: ipAvg });
    } else {
      result.push({ category: getCategory('innovation-project'), score: 0 });
    }

    // Robot Design average
    const rdRubric = team.rubrics.robot_design;
    if (rdRubric?.data?.fields) {
      const rdFields = rdRubric.data.fields as Record<
        string,
        { value: number | null; notes?: string }
      >;
      const rdValues = Object.values(rdFields)
        .filter(field => field.value !== null)
        .map(field => field.value || 0);
      const rdAvg =
        rdValues.length > 0 ? rdValues.reduce((sum, val) => sum + val, 0) / rdValues.length : 0;
      result.push({ category: getCategory('robot-design'), score: rdAvg });
    } else {
      result.push({ category: getCategory('robot-design'), score: 0 });
    }

    // Core Values average - uses coreValues fields from IP and RD
    const ipSchema = rubrics['innovation-project'];
    const rdSchema = rubrics['robot-design'];
    const cvFieldValues: number[] = [];

    if (ipRubric?.data?.fields) {
      const ipFields = ipRubric.data.fields as Record<
        string,
        { value: number | null; notes?: string }
      >;
      ipSchema.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.coreValues && ipFields[field.id]?.value != null) {
            cvFieldValues.push(ipFields[field.id].value as number);
          }
        });
      });
    }

    if (rdRubric?.data?.fields) {
      const rdFields = rdRubric.data.fields as Record<
        string,
        { value: number | null; notes?: string }
      >;
      rdSchema.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.coreValues && rdFields[field.id]?.value != null) {
            cvFieldValues.push(rdFields[field.id].value as number);
          }
        });
      });
    }

    const cvAvg =
      cvFieldValues.length > 0
        ? cvFieldValues.reduce((sum, val) => sum + val, 0) / cvFieldValues.length
        : 0;
    result.push({ category: getCategory('core-values'), score: cvAvg });

    return result;
  }, [team, getCategory]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 14 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 12 }} />
        <Radar dataKey="score" stroke={blue[300]} fill={blue[300]} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
