'use client';

import { useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Container, Box, CircularProgress, Stack } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { PageHeader } from '../../../../components/page-header';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import { useTeam } from '../../components/team-context';
import { useEvent } from '../../../../../components/event-context';
import { useUser } from '../../../../../../components/user-context';
import { usePageData } from '../../../../../hooks/use-page-data';
import { ScoresheetProvider } from './scoresheet-context';
import { ScoresheetForm } from './components/scoresheet-form';
import { GPSelector } from './components/gp-selector';
import { ScoresheetSwitcher } from './components/scoresheet-switcher';
import { EditButton } from './components/edit-button';
import { HeadRefViewToggle, type ScoresheetView } from './components/view-toggle';
import {
  GET_SCORESHEET_QUERY,
  parseScoresheetData,
  createScoresheetUpdatedSubscription
} from './graphql';

export default function ScoresheetPage() {
  const t = useTranslations('pages.scoresheet');
  const { getStage } = useMatchTranslations();

  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const team = useTeam();
  const { currentDivision } = useEvent();
  const { scoresheetSlug } = useParams();

  const subscriptions = useMemo(
    () => [createScoresheetUpdatedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data: scoresheet, loading } = usePageData(
    GET_SCORESHEET_QUERY,
    {
      divisionId: currentDivision.id,
      teamId: team.id,
      slug: scoresheetSlug as string
    },
    parseScoresheetData,
    subscriptions
  );

  // If we are a referee and this scoresheet is submitted (or escalated)
  // We need to redirect back to the homepage since we are not supposed to be here
  useEffect(() => {
    if (user.role !== 'referee') return;
    if (!scoresheet || loading) return;

    if (scoresheet.status === 'submitted' || scoresheet.escalated) {
      router.push(`/lems/${user.role}`);
    }
  }, [router, scoresheet, loading, user.role]);

  // Compute desired view mode based on status and URL override
  const viewMode: ScoresheetView = useMemo(() => {
    if (!scoresheet) return 'score';
    const override = searchParams.get('view');

    if (user.role === 'head-referee' && (override === 'gp' || override === 'score')) {
      return override;
    }

    return scoresheet.status === 'gp' ? 'gp' : 'score';
  }, [scoresheet, searchParams, user.role]);

  const forceEdit = user.role === 'head-referee' && searchParams.get('editMode') === 'true';

  const handleSetViewMode = (newView: ScoresheetView) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (loading || !scoresheet) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container disableGutters maxWidth="md">
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'background.paper' }}>
        <PageHeader
          title={t('title', {
            teamNumber: team.number,
            stage: getStage(scoresheet.stage),
            round: scoresheet.round
          })}
        >
          <RoleAuthorizer user={user} allowedRoles="head-referee">
            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="top">
              <EditButton scoresheet={scoresheet} isEditMode={forceEdit} />
              <HeadRefViewToggle view={viewMode} setView={handleSetViewMode} />
              <ScoresheetSwitcher />
            </Stack>
          </RoleAuthorizer>
        </PageHeader>
      </Box>

      <ScoresheetProvider scoresheet={scoresheet} forceEdit={forceEdit}>
        <Container maxWidth="md" sx={{ mt: 2 }}>
          {viewMode === 'score' && (
            <ScoresheetForm
              disabled={
                scoresheet.status === 'gp' || scoresheet.status === 'submitted' ? !forceEdit : false
              }
            />
          )}
          {viewMode === 'gp' && <GPSelector disabled={scoresheet.status !== 'gp' && !forceEdit} />}
        </Container>
      </ScoresheetProvider>
    </Container>
  );
}
