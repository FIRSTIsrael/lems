# Graph Report - lems  (2026-08-17)

## Corpus Check
- Large corpus: 1730 files · ~731,927 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 6771 nodes · 16529 edges · 309 communities (281 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 240 edges (avg confidence: 0.71)
- Token cost: 37,989 input · 14,738 output

## Community Hubs (Navigation)
- Division GraphQL Resolvers
- Audience Display System
- GraphQL Server Core
- Tournament Manager UI
- Scorekeeper System
- Head Referee Dashboard
- Judge Advisor Interface
- Admin Event Management
- Scheduler Models
- Admin Localization
- Judging Status Reports
- Field Head Queuer
- Package Dependencies
- Tournament Manager GraphQL
- Field Status Reports
- Deliberation Comparison
- Lead Judge Interface
- Referee GraphQL
- Backend Mutations
- Admin Layout
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 195
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 202
- Community 203
- Community 204
- Community 205
- Community 206
- Community 207
- Community 208
- Community 209
- Community 210
- Community 211
- Community 212
- Community 213
- Community 214
- Community 215
- Community 216
- Community 217
- Community 218
- Community 219
- Community 220
- Community 221
- Community 222
- Community 223
- Community 224
- Community 225
- Community 226
- Community 228
- Community 229
- Community 230
- Community 231
- Community 232
- Community 233
- Community 234
- Community 235
- Community 236
- Community 237
- Community 238
- Community 239
- Community 240
- Community 241
- Community 242
- Community 243
- Community 244
- Community 245
- Community 246
- Community 247
- Community 248
- Community 249
- Community 250
- Community 251
- Community 281
- Community 282
- Community 289
- Community 290
- Community 294
- Community 297
- Community 298
- Community 302
- Community 303
- Community 304
- Community 305
- Community 306
- Community 308

## God Nodes (most connected - your core abstractions)
1. `merge()` - 225 edges
2. `database` - 142 edges
3. `apiFetch()` - 122 edges
4. `useEvent()` - 121 edges
5. `getRedisPubSub()` - 119 edges
6. `KyselyDatabaseSchema` - 88 edges
7. `SubscriptionConfig` - 87 edges
8. `JudgingCategory` - 82 edges
9. `RedisEventTypes` - 73 edges
10. `useTime()` - 71 edges

## Surprising Connections (you probably didn't know these)
- `Development Docker Compose` --semantically_similar_to--> `Production Docker Compose`  [INFERRED] [semantically similar]
  compose.dev.yml → compose.yml
- `ScheduleManagerProps` --references--> `Division`  [EXTRACTED]
  apps/admin/src/app/[locale]/(dashboard)/events/[slug]/schedule/components/schedule-manager.tsx → libs/types/src/lib/api/admin/divisions.ts
- `TeamSelectorProps` --references--> `Team`  [EXTRACTED]
  apps/admin/src/app/[locale]/(dashboard)/events/[slug]/schedule/components/team-swapper/team-selector.tsx → libs/types/src/lib/api/admin/teams.ts
- `TeamSwapperProps` --references--> `Division`  [EXTRACTED]
  apps/admin/src/app/[locale]/(dashboard)/events/[slug]/schedule/components/team-swapper/team-swapper.tsx → libs/types/src/lib/api/admin/divisions.ts
- `RegisterForm()` --calls--> `apiFetch()`  [EXTRACTED]
  apps/admin/src/app/[locale]/(dashboard)/events/[slug]/teams/components/register-teams-from-csv-dialog.tsx → libs/shared/src/lib/fetch.ts

## Import Cycles
- 3-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts`
- 3-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/query.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/scoresheet-utils.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/index.ts`
- 3-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/cache-updates.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/rubric-utils.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/cache-updates.ts`
- 3-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/query.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/rubric-utils.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/index.ts`
- 3-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/judging/rubric.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 3-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/divisions/judging/award-winner.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 3-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/divisions/judging/judging-final-deliberation.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 4-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/query.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts`
- 4-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/mutations/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/mutations/update-manual-eligibility.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts`
- 4-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/subscriptions/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/subscriptions/scoresheet-updated.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/scoresheet-utils.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/scoresheet/[scoresheetSlug]/graphql/index.ts`
- 4-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/subscriptions/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/subscriptions/rubric-updated.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/rubric-utils.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/(dashboard)/team/[teamSlug]/rubric/[category]/graphql/index.ts`
- 4-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/assign-personal-award.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 4-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/audience-display/update-presentation.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 4-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/disqualify-team.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 4-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/team-arrived.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 5-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/subscriptions/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/subscriptions/final-deliberation-status-changed.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts`
- 5-file cycle: `apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/subscriptions/index.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/subscriptions/final-deliberation-updated.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/types.ts -> apps/frontend/src/app/[locale]/lems/(volunteer)/deliberation/final/graphql/index.ts`
- 5-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/schedule/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/schedule/swap-session-teams.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 5-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/deliberations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/deliberations/complete-final-deliberation.ts -> apps/backend/src/lib/graphql/apollo-server.ts`
- 5-file cycle: `apps/backend/src/lib/graphql/apollo-server.ts -> apps/backend/src/lib/graphql/resolvers/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/deliberations/index.ts -> apps/backend/src/lib/graphql/resolvers/mutations/deliberations/update-manual-eligibility.ts -> apps/backend/src/lib/graphql/apollo-server.ts`

## Hyperedges (group relationships)
- **Multi-Service Deployment Orchestration** — workflow_deploy_production, workflow_deploy_admin, workflow_deploy_backend, workflow_deploy_lems, workflow_deploy_portal, workflow_deploy_scheduler, workflow_cleanup_registry [EXTRACTED 1.00]
- **Next.js Applications Build Pattern** — workflow_deploy_admin, workflow_deploy_lems, workflow_deploy_portal [EXTRACTED 1.00]
- **GitHub Issue Management System** — github_issue_template_bug_report_template, github_issue_template_task_template, github_issue_template_config, workflow_assign [EXTRACTED 1.00]
- **Database Migration Infrastructure** — github_workflows_run_production_migrations, github_workflows_run_staging_migrations, workflows_migration_script, lib_database [EXTRACTED 1.00]
- **Data Persistence Layer** — tech_postgresql, tech_mongodb, tech_redis, lib_database [EXTRACTED 1.00]
- **Next.js Frontend Applications** — app_frontend, app_portal, app_admin, tech_nextjs, tech_material_ui [EXTRACTED 1.00]
- **GraphQL API Infrastructure** — tech_apollo_server, lib_types [EXTRACTED 1.00]

## Communities (309 total, 28 thin omitted)

### Community 0 - "Division GraphQL Resolvers"
Cohesion: 0.02
Nodes (115): AgendaArgs, AgendaEventGraphQL, divisionAgendaResolver(), DivisionWithId, divisionRoomsResolver(), DivisionWithId, RoomGraphQL, divisionTablesResolver() (+107 more)

### Community 1 - "Audience Display System"
Cohesion: 0.02
Nodes (101): SwitchActiveDisplayArgs, SwitchAudienceDisplayEvent, UpdateAudienceDisplaySettingArgs, UpdateAudienceDisplaySettingEvent, AudienceDisplaySettingUpdatedEvent, audienceDisplaySettingUpdatedResolver, audienceDisplaySettingUpdatedSubscribe(), AudienceDisplaySettingUpdatedSubscribeArgs (+93 more)

### Community 2 - "GraphQL Server Core"
Cohesion: 0.06
Nodes (67): database, createApolloServer(), GraphQLContext, typeDefs, VolunteerUser, resolvers, AssignPersonalAwardArgs, AwardEvent (+59 more)

### Community 3 - "Tournament Manager UI"
Cohesion: 0.05
Nodes (81): DRAWER_WIDTH_PX, MATCH_DURATION_SECONDS, MOBILE_DRAWER_HEIGHT_VH, MissingTeamsAlert(), MissingTeamsAlertProps, FieldScheduleTable, FieldScheduleTableComponent(), FieldScheduleTableProps (+73 more)

### Community 4 - "Scorekeeper System"
Cohesion: 0.03
Nodes (75): UpdatePresentationResult, PresentationUpdatedEvent, ScorekeeperContextType, ScorekeeperProviderProps, ABORT_MATCH_MUTATION, AbortMatchMutationData, AbortMatchMutationVars, MatchAbortedEvent (+67 more)

### Community 5 - "Head Referee Dashboard"
Cohesion: 0.05
Nodes (71): DesktopScheduleTable(), DesktopScheduleTableProps, MatchRow(), MatchRowProps, EscalatedScoresheetItem(), EscalatedScoresheetItemProps, EscalatedScoresheetsPanel(), ALL_STATUSES (+63 more)

### Community 6 - "Judge Advisor Interface"
Cohesion: 0.05
Nodes (73): FiltersContext, FiltersContextType, FiltersProvider(), FiltersProviderProps, JudgeAdvisorContext, JudgeAdvisorContextType, JudgeAdvisorProvider(), JudgeAdvisorProviderProps (+65 more)

### Community 7 - "Admin Event Management"
Cohesion: 0.06
Nodes (50): EventAwardsPage(), DivisionSelector(), DivisionSelectorProps, EventContext, useEvent(), EventPageTitle(), EventPageTitleProps, DeleteDivisionDialog() (+42 more)

### Community 8 - "Scheduler Models"
Cohesion: 0.07
Nodes (32): SchedulerError, ValidatorError, Location, Team, Break, CreateScheduleResponse, SchedulerRequest, ValidateScheduleResponse (+24 more)

### Community 9 - "Admin Localization"
Cohesion: 0.05
Nodes (47): useLocalePermissionName(), LanguageSwitcher(), NoPermissionsAlert(), PermissionGuard(), PermissionGuardProps, SessionContext, SessionProvider(), SessionValue (+39 more)

### Community 10 - "Judging Status Reports"
Cohesion: 0.05
Nodes (58): JudgingStatusMobile(), JudgingStatusTable(), NextSessionRow(), NextSessionRowProps, SessionCard(), SessionCardProps, SessionRow(), SessionRowProps (+50 more)

### Community 11 - "Field Head Queuer"
Cohesion: 0.06
Nodes (53): ActiveMatchDisplay(), getStatusChipProps(), getStatusKey(), FieldHeadQueuerContext, FieldHeadQueuerContextType, FieldHeadQueuerProvider(), FieldHeadQueuerProviderProps, useFieldHeadQueuer() (+45 more)

### Community 12 - "Package Dependencies"
Cohesion: 0.03
Nodes (73): dependencies, @apollo/client, @apollo/client-integration-nextjs, @apollo/server, archiver, @as-integrations/express5, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner (+65 more)

### Community 13 - "Tournament Manager GraphQL"
Cohesion: 0.07
Nodes (57): SET_JUDGING_SESSION_TEAM, SET_MATCH_PARTICIPANT_TEAM, SetJudgingSessionTeamVars, SetMatchParticipantTeamVars, SWAP_MATCH_TEAMS, SWAP_SESSION_TEAMS, GET_TOURNAMENT_MANAGER_DATA, createMatchAbortedSubscription() (+49 more)

### Community 14 - "Field Status Reports"
Cohesion: 0.06
Nodes (55): FieldStatusContext, FieldStatusContextType, FieldStatusProvider(), FieldStatusProviderProps, useFieldStatusData(), TeamsCellProps, UpcomingMatchesTable(), UpcomingMatchesTableProps (+47 more)

### Community 15 - "Deliberation Comparison"
Cohesion: 0.07
Nodes (48): CompareContext, CompareContextType, CompareProvider(), CompareProviderProps, TeamComparison, useCompareContext(), CategoryFilter(), EmptyState() (+40 more)

### Community 16 - "Lead Judge Interface"
Cohesion: 0.07
Nodes (50): LeadJudgeContext, LeadJudgeContextType, LeadJudgeProvider(), LeadJudgeProviderProps, TeamInfoCell(), TeamInfoCellProps, getDesiredPicklistLength(), GET_LEAD_JUDGE_DATA (+42 more)

### Community 17 - "Referee GraphQL"
Cohesion: 0.07
Nodes (49): GET_REFEREE_DATA, parseRefereeData(), createMatchAbortedSubscription(), MATCH_ABORTED_SUBSCRIPTION, MatchAbortedSubscriptionData, SubscriptionVars, createMatchCompletedSubscription(), MATCH_COMPLETED_SUBSCRIPTION (+41 more)

### Community 18 - "Backend Mutations"
Cohesion: 0.07
Nodes (50): assignPersonalAwardResolver(), updatePresentationResolver(), completeFinalDeliberationResolver(), validateFinalAwards(), startFinalDeliberationResolver(), updateFinalDeliberationAwardsResolver(), updateManualEligibilityResolver(), disqualifyTeamResolver() (+42 more)

### Community 19 - "Admin Layout"
Cohesion: 0.07
Nodes (36): LanguageSubmenuProps, LanguageSwitcherProps, heebo, metadata, roboto, RootLayout(), RootLayoutProps, viewport (+28 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (35): schema, authenticateHttp(), authenticateWebsocket(), extractTokenFromRequest(), extractTokenFromWebsocketConnection(), fetchUserWithDivisions(), verifyToken(), consoleTransport (+27 more)

### Community 21 - "Community 21"
Cohesion: 0.04
Nodes (57): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, eslint-config-prettier, @eslint/js, eslint-plugin-import, eslint-plugin-jsx-a11y (+49 more)

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (42): AddAwardDialog(), AddAwardDialogProps, AwardItem(), AwardItemProps, AwardContext, AwardsProvider(), AwardsProviderProps, useAwards() (+34 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (32): HashedPassword, hashPassword(), validatePassword(), validateUsername(), verifyPassword(), router, makeAdminAwardResponse(), router (+24 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (34): ActiveMatchDisplay(), ActiveMatchTeams(), AudienceDisplayControl(), AudienceDisplaySettingsModal(), AudienceDisplaySettingsModalProps, AwardsPresentationWrapper(), ControlButtons(), StartStopMatchButton() (+26 more)

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (39): DivisionContext, DivisionProvider(), DivisionProviderProps, useDivision(), DivisionTabBarProps, AgendaTab(), AwardRow(), AwardRowProps (+31 more)

### Community 26 - "Community 26"
Cohesion: 0.07
Nodes (16): makePortalEventDetailsResponse(), makePortalEventSummaryResponse(), attachEvent(), EventSelector, EventsRepository, EventsSelector, EventSettings, EventSettingsTable (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.08
Nodes (32): SendGridSettingsContent(), SendGridSettingsPanel(), SendGridSettingsProps, ContactsListSection(), ContactsListSectionProps, ErrorsSection(), ErrorsSectionProps, PreviewView() (+24 more)

### Community 28 - "Community 28"
Cohesion: 0.07
Nodes (34): DialogComponent, DialogComponentProps, DialogContext, DialogContextType, DialogProvider(), DialogProviderProps, useDialog(), RegisterTeamsFromCSVButton() (+26 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (35): categoryColors, ExportRubricTable(), ExportRubricTableProps, sectionColors, RubricData, RubricsExportPage(), RubricsPageData, TeamSessionCardProps (+27 more)

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (30): UpdateRubricStatusArgs, useFilters(), RubricStatusButton(), RubricStatusButtonProps, RubricStatusGlossary(), STATUS_ITEMS, RubricStatusGrid(), RubricStatusSummary() (+22 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (34): FieldQueuerBottomNav(), FieldQueuerBottomNavProps, CalledTeam, FieldQueuerContext, FieldQueuerContextType, FieldQueuerProvider(), FieldQueuerProviderProps, useFieldQueuer() (+26 more)

### Community 32 - "Community 32"
Cohesion: 0.10
Nodes (29): CompareTeamsPicker(), CompareTeamsPickerProps, RoomScoresDistribution(), TeamComparisonDialog(), ChampionsDataGrid(), ChampionsPodium(), ChampionsStage(), AwardListItemProps (+21 more)

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (19): DEFAULT_DIVISION_STATE, DivisionAgendaSelector, DivisionSelector, DivisionsRepository, DivisionsSelector, AgendaEvent, AgendaEventsTable, InsertableAgendaEvent (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.10
Nodes (37): AdvanceFinalDeliberationStageArgs, advanceFinalDeliberationStageResolver(), STAGE_PROGRESSION, assignChampionsToTeams(), assignRobotPerformanceAwards(), createAdvancementAwards(), getAdvancementConfig(), getTeamEligibility() (+29 more)

### Community 35 - "Community 35"
Cohesion: 0.08
Nodes (29): cache(), router, makePortalAgendaResponse(), makePortalAwardsResponse(), makePortalDivisionResponse(), makePortalJudgingSessionResponse(), makePortalMatchResponse(), router (+21 more)

### Community 36 - "Community 36"
Cohesion: 0.10
Nodes (30): EventContext, EventContextType, useEvent(), DivisionSwitcher(), UserInfoSection(), DivisionSwitcher(), UserInfoSection(), PitMapView() (+22 more)

### Community 37 - "Community 37"
Cohesion: 0.09
Nodes (30): CurrentSeason(), CurrentSeasonProps, EventCard(), EventGrid(), EventGridProps, EventsLayout(), EventsLayoutProps, PreviousSeason() (+22 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (29): initialValues, LoginFormProps, NextStepButton(), NextStepButtonProps, StepIndicator(), StepIndicatorProps, stepOrder, CompletedDivisionStepSummary() (+21 more)

### Community 39 - "Community 39"
Cohesion: 0.07
Nodes (35): GET_SCOREBOARD_DATA, parseScoreboardData(), createMatchAbortedSubscription(), MATCH_ABORTED_SUBSCRIPTION, MatchAbortedEvent, MatchAbortedSubscriptionData, SubscriptionVars, updateQueryWithCallback() (+27 more)

### Community 40 - "Community 40"
Cohesion: 0.07
Nodes (32): AwardsSection(), EventSummary(), MatchResults(), MatchResultsProps, PerformanceMetrics(), PerformanceMetricsProps, LoadingSkeleton(), TeamAtEventDataContext (+24 more)

### Community 41 - "Community 41"
Cohesion: 0.13
Nodes (25): AllowedRoles, authorizeUserRole(), AudienceDisplayLayout(), UserContext, useUser(), HeadRefereeLayout(), JudgeAdvisorLayout(), JudgeLayout() (+17 more)

### Community 42 - "Community 42"
Cohesion: 0.12
Nodes (27): SectionName(), colors, feedbackFields, FeedbackRow(), FieldNotesRow(), FieldNotesRowProps, FieldRatingRow(), RubricRadioIcon() (+19 more)

### Community 43 - "Community 43"
Cohesion: 0.07
Nodes (24): AwardsRepository, AwardsSelector, AdminEvent, AdminEventsTable, InsertableAdminEvent, UpdateableAdminEvent, Award, AwardsTable (+16 more)

### Community 44 - "Community 44"
Cohesion: 0.10
Nodes (34): CategoryDeliberationProvider(), AnomalyAlert(), AnomalyAlertProps, CATEGORY_BG_COLORS, CATEGORY_COLORS, Anomaly, computeAnomalies(), computeCoreAwardsEligibility() (+26 more)

### Community 45 - "Community 45"
Cohesion: 0.10
Nodes (32): GET_CATEGORY_DELIBERATION, parseCategoryDeliberationData(), createDeliberationUpdatedSubscription(), DELIBERATION_UPDATED_SUBSCRIPTION, DeliberationUpdatedEvent, deliberationUpdatedReconciler(), createRubricUpdatedSubscription(), getEmptyRubric() (+24 more)

### Community 46 - "Community 46"
Cohesion: 0.08
Nodes (12): Database, DatabaseRawAccess, PG_PORT, ObjectStorage, ObjectStorageConfig, streamToBuffer(), SeasonSelector, SeasonsRepository (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.07
Nodes (30): CreateEventLayout(), Division, EventFormValues, initialValues, DivisionItem(), DivisionItemProps, CreateEventPage(), CreateDivisionButton() (+22 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (32): ManagedRolesSection(), MandatoryRolesSection(), OptionalRolesSection(), RoleAssignmentSection(), RoleAssignmentSectionProps, transformVolunteerSlotsToUsers(), transformVolunteerUsersToSlots(), generateInitialSlots() (+24 more)

### Community 49 - "Community 49"
Cohesion: 0.11
Nodes (24): CurrentSeasonWidget(), EventParticipationWidget(), NumberWidget(), NumberWidgetProps, RegisteredTeamsWidget(), TotalAdminsWidget(), TotalEventsWidget(), UpcomingEventsWidget() (+16 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (25): ActiveMatch(), InspectionTimer(), InspectionTimerProps, MatchCountdown(), MatchCountdownProps, Match, NextMatchPanel(), NextMatchPanelProps (+17 more)

### Community 51 - "Community 51"
Cohesion: 0.09
Nodes (26): RegisterTeamsButton(), RegisterTeamsButtonProps, RegisterTeamsDialogContent(), RegisterTeamsDialogContentProps, RegisterTeamsDialog(), RegisterTeamsDialogProps, DeleteTeamButton(), DeleteTeamButtonProps (+18 more)

### Community 52 - "Community 52"
Cohesion: 0.11
Nodes (26): AgendaEventRow(), AgendaEventRowProps, VISIBILITY_COLORS, EmptyState(), ErrorState(), LoadingState(), MatchRow(), MatchRowProps (+18 more)

### Community 53 - "Community 53"
Cohesion: 0.09
Nodes (28): ErrorState(), LoadingState(), MobileScoreboard(), MobileScoreboardProps, ScoreboardTable(), ScoreboardTableProps, GET_SCOREBOARD, parseScoreboard() (+20 more)

### Community 54 - "Community 54"
Cohesion: 0.06
Nodes (17): ColorPickerProps, PRESET_COLORS, FileUploadProps, FormikCheckboxProps, FormikConditionalTextFieldProps, FormikDatePicker(), FormikDatePickerProps, FormikNumberInputProps (+9 more)

### Community 55 - "Community 55"
Cohesion: 0.09
Nodes (28): JudgingDeliberationGraphQL, JudgingDeliberation, SmallScreenBlock(), GET_FINAL_DELIBERATION, parseFinalDeliberationData(), createFinalDeliberationStatusChangedSubscription(), FINAL_DELIBERATION_STATUS_CHANGED_SUBSCRIPTION, FinalDeliberationStatusChangedEvent (+20 more)

### Community 56 - "Community 56"
Cohesion: 0.11
Nodes (25): ErrorState(), FullscreenButton(), FullscreenButtonProps, LoadingState(), TimerContent(), GET_FIELD_TIMER_DATA, parseFieldTimerData(), createMatchAbortedSubscription() (+17 more)

### Community 57 - "Community 57"
Cohesion: 0.12
Nodes (25): ArrivalStats(), ArrivalStatsProps, DesktopTeamListTable(), DesktopTeamListTableProps, MobileTeamListTable(), MobileTeamListTableProps, GET_DIVISION_TEAMS, parseDivisionTeams() (+17 more)

### Community 58 - "Community 58"
Cohesion: 0.10
Nodes (9): TeamSelector, TeamSelectorType, TeamsRepository, TeamsSelector, InsertableTeam, Team, TeamsTable, TeamWithDivision (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.10
Nodes (24): buildNavigationItems(), ConnectionIndicator(), ConnectionIndicatorProps, rippleAnimation, statusConfig, DesktopAppBar(), DRAWER_WIDTH, LanguageSwitcher() (+16 more)

### Community 60 - "Community 60"
Cohesion: 0.11
Nodes (23): JudgingQueuerBottomNav(), JudgingQueuerBottomNavProps, JudgingScheduleView(), JudgingScheduleViewProps, PitMapView(), TeamQueueCard(), TeamQueueCardProps, UPDATE_JUDGING_SESSION_MUTATION (+15 more)

### Community 61 - "Community 61"
Cohesion: 0.06
Nodes (34): analytics, babel, linter, style, cache, dependsOn, inputs, cache (+26 more)

### Community 62 - "Community 62"
Cohesion: 0.06
Nodes (33): configurations, defaultConfiguration, executor, options, outputs, development, production, buildTarget (+25 more)

### Community 63 - "Community 63"
Cohesion: 0.12
Nodes (21): EventCard(), EventCardProps, EventsSection(), EventsSectionProps, LiveIcon(), EventListItem(), EventListItemProps, EventsListSection() (+13 more)

### Community 64 - "Community 64"
Cohesion: 0.11
Nodes (25): DragState, FieldTimer(), formatTime(), MissionContext, MissionContextType, MissionProvider(), useScoresheetValidator(), ScoreFloater() (+17 more)

### Community 65 - "Community 65"
Cohesion: 0.13
Nodes (26): RefereeMatchTimer(), RefereeNoMatch(), getTeamBackgroundColor(), getTeamBorderColor(), getTeamStatusChipColor(), getTeamStatusIcon(), getTeamStatusLabel(), RefereePrestart() (+18 more)

### Community 66 - "Community 66"
Cohesion: 0.11
Nodes (26): createUpdateRubricFeedbackCacheUpdate(), createUpdateRubricValueCacheUpdate(), GET_RUBRIC_QUERY, GET_TEAM_SESSION_QUERY, parseRubricData(), RUBRIC_UPDATED_SUBSCRIPTION, RubricAwardsUpdatedEvent, RubricFeedbackUpdatedEvent (+18 more)

### Community 67 - "Community 67"
Cohesion: 0.07
Nodes (30): configurations, defaultConfiguration, executor, options, outputs, development, production, buildTarget (+22 more)

### Community 68 - "Community 68"
Cohesion: 0.11
Nodes (19): extractToken(), getRecaptchaResponse(), loginRateLimiter, LoginRequest, router, router, router, authMiddleware() (+11 more)

### Community 69 - "Community 69"
Cohesion: 0.07
Nodes (30): configurations, defaultConfiguration, executor, options, outputs, development, production, buildTarget (+22 more)

### Community 70 - "Community 70"
Cohesion: 0.14
Nodes (21): EmptyState(), ErrorState(), LoadingState(), ScheduleTable(), ScheduleTableProps, VISIBILITY_COLORS, GET_JUDGING_SCHEDULE, parseJudgingSchedule() (+13 more)

### Community 71 - "Community 71"
Cohesion: 0.07
Nodes (30): configurations, defaultConfiguration, executor, options, outputs, development, production, buildTarget (+22 more)

### Community 72 - "Community 72"
Cohesion: 0.12
Nodes (12): RobotGameMatchesRepository, RobotGameMatchesSelector, RobotGameMatchSelector, InsertableRobotGameMatchParticipant, RobotGameMatchParticipant, RobotGameMatchParticipantsTable, UpdateableRobotGameMatchParticipant, InsertableRobotGameMatch (+4 more)

### Community 73 - "Community 73"
Cohesion: 0.09
Nodes (22): TimeSyncContext, TimeSyncContextType, TimeSyncProvider(), TimeSyncProviderProps, LemsToaster(), LemsToasterProps, heebo, metadata (+14 more)

### Community 74 - "Community 74"
Cohesion: 0.13
Nodes (20): FiltersContext, FiltersContextType, FiltersProvider(), FiltersProviderProps, useFilters(), useLeadJudge(), LeadJudgeDeliberationButton(), LeadJudgeDeliberationButtonProps (+12 more)

### Community 75 - "Community 75"
Cohesion: 0.11
Nodes (24): GET_SCORESHEET_QUERY, GET_TEAM_MATCH_QUERY, GET_TEAM_SCORESHEETS_QUERY, SCORESHEET_UPDATED_SUBSCRIPTION, scoresheetUpdatedReconciler(), GetTeamMatchQueryData, GetTeamMatchQueryVars, GetTeamScoresheetsItem (+16 more)

### Community 76 - "Community 76"
Cohesion: 0.12
Nodes (20): AgendaBlockProps, BlockContent(), BlockContentProps, formatTime(), DialogActionsBar(), DialogActionsBarProps, EditAgendaDialog(), EditAgendaDialogProps (+12 more)

### Community 77 - "Community 77"
Cohesion: 0.12
Nodes (16): CategoryDeliberationButton(), CategoryDeliberationButtonProps, CategoryDeliberationCard(), CategoryDeliberationCardProps, Deliberation, getDeliberationStatusColor(), DeliberationStatusSection(), FinalDeliberationButton() (+8 more)

### Community 78 - "Community 78"
Cohesion: 0.14
Nodes (20): ArrivalsStats(), ArrivalsStatsProps, TeamArrivalInput(), TeamArrivalInputProps, createTeamArrivedCacheUpdate(), TEAM_ARRIVED_MUTATION, TeamArrivedMutationData, TeamArrivedMutationVars (+12 more)

### Community 79 - "Community 79"
Cohesion: 0.14
Nodes (21): colors, feedbackFields, FeedbackRow(), FeedbackRowProps, FieldNotesRow(), FieldNotesRowProps, FieldRatingRow(), FieldRatingRowProps (+13 more)

### Community 80 - "Community 80"
Cohesion: 0.09
Nodes (19): DeliberationStatusChangedEvent, deliberationStatusChangedResolver, deliberationStatusChangedSubscribe(), DeliberationStatusChangedSubscribeArgs, DeliberationUpdatedEvent, DeliberationUpdatedEventResolver, deliberationUpdatedResolver, deliberationUpdatedSubscribe() (+11 more)

### Community 81 - "Community 81"
Cohesion: 0.13
Nodes (21): ControlsPanel(), ControlsPanelProps, AwardsPresentationDisplay(), AwardsPresentationDisplayProps, NavigationButtons(), NavigationButtonsProps, SlideDisplay(), SlideDisplayProps (+13 more)

### Community 82 - "Community 82"
Cohesion: 0.12
Nodes (7): ScoresheetSelector, ScoresheetsRepository, ScoresheetsSelector, ScoresheetsSelectorType, Scoresheet, ScoresheetClauseValue, ScoresheetStatus

### Community 83 - "Community 83"
Cohesion: 0.13
Nodes (18): DownloadResults, generateEventResultsZip(), generateSinglePdf(), getTeamResults(), getZippedResults(), TeamBatchInfo, BrowserManager, createAuthToken() (+10 more)

### Community 84 - "Community 84"
Cohesion: 0.13
Nodes (22): createJudgingSessionAbortedSubscription(), JUDGING_SESSION_ABORTED_SUBSCRIPTION, SubscriptionData, updateJudgingSessions(), updateQueryWithCallback(), createJudgingSessionStartedSubscription(), JUDGING_SESSION_STARTED_SUBSCRIPTION, SubscriptionData (+14 more)

### Community 85 - "Community 85"
Cohesion: 0.15
Nodes (19): ActiveMatchState(), ActiveMatchStateProps, FieldTimerContext, FieldTimerContextType, FieldTimerProviderProps, useFieldTimer(), MatchInfo(), MatchInfoProps (+11 more)

### Community 86 - "Community 86"
Cohesion: 0.11
Nodes (19): DeliberationProviderProps, Division, DeliberationContextValue, EnrichedTeam, RoomScoresDistributionProps, CategorizedRubrics, FieldMetadata, GPValue (+11 more)

### Community 87 - "Community 87"
Cohesion: 0.11
Nodes (9): EventIntegrationSelector, EventIntegrationsRepository, EventIntegrationsSelector, EventIntegrationsSettingsSelector, json(), EventIntegration, EventIntegrationsTable, InsertableEventIntegration (+1 more)

### Community 88 - "Community 88"
Cohesion: 0.13
Nodes (19): DisplayModeTransition(), DisplayModeTransitionProps, GET_AUDIENCE_DISPLAY_DATA, parseAudienceDisplayData(), AUDIENCE_DISPLAY_SETTING_UPDATED_SUBSCRIPTION, AudienceDisplaySettingUpdatedEvent, audienceDisplaySettingUpdatedReconciler(), AudienceDisplaySettingUpdatedSubscriptionData (+11 more)

### Community 89 - "Community 89"
Cohesion: 0.17
Nodes (18): CurrentSessionsDisplay(), CurrentSessionsDisplayProps, getStatus(), getStatusKey(), SessionStatusKey, StatusChip, JudgingSchedule(), JudgingScheduleProps (+10 more)

### Community 90 - "Community 90"
Cohesion: 0.20
Nodes (15): CompleteDeliberationModal(), CompleteDeliberationModalProps, ControlsPanel(), getProgressColor(), DeliberationGrid(), DeliberationTable(), Metrics(), PicklistPanel() (+7 more)

### Community 91 - "Community 91"
Cohesion: 0.10
Nodes (17): pages, PortalAppBar(), PortalAppBarProps, LanguageSwitcher(), heebo, metadata, roboto, RootLayout() (+9 more)

### Community 92 - "Community 92"
Cohesion: 0.15
Nodes (15): ActiveEventsSection(), Hero(), HeroProps, ACTIONS, QuickActionsSection(), ResourceLinksSection(), SearchResultAvatar(), SearchResultAvatarProps (+7 more)

### Community 93 - "Community 93"
Cohesion: 0.13
Nodes (20): Appear(), AppearProps, SteppedComponent(), SteppedComponentProps, Stepper(), StepperProps, Slide(), SlideContext (+12 more)

### Community 94 - "Community 94"
Cohesion: 0.19
Nodes (20): AgendaBlockComponent(), AgendaColumn(), AgendaColumnProps, AgendaDragState, DEFAULT_EVENT_DURATION, DragMode, MIN_CREATE_DURATION, useDragHandlers() (+12 more)

### Community 95 - "Community 95"
Cohesion: 0.12
Nodes (18): UpdateScoresheetMissionClauseArgs, ExportScoresheetHeader(), ExportScoresheetHeaderProps, ExportScoresheetMissionProps, MissionData, ScoresData, ScoresheetData, ScoresheetMissionProps (+10 more)

### Community 96 - "Community 96"
Cohesion: 0.11
Nodes (14): createSseEmitter(), SseEmitter, consumeTempFile(), purgeTtl(), store, storeTempFile(), TempFileEntry, downloadFileRateLimiter (+6 more)

### Community 97 - "Community 97"
Cohesion: 0.11
Nodes (17): createPresentationUpdatedSubscription(), PRESENTATION_UPDATED_SUBSCRIPTION, PresentationUpdatedEvent, presentationUpdatedReconciler(), PresentationUpdatedSubscriptionData, SubscriptionVars, LogoDisplay(), SettingsLanguageSwitcher() (+9 more)

### Community 98 - "Community 98"
Cohesion: 0.14
Nodes (5): RubricSelector, RubricsRepository, RubricsSelector, RubricsSelectorType, Rubric

### Community 99 - "Community 99"
Cohesion: 0.12
Nodes (19): makeAdminIntegrationResponse(), validateAndUpdateIntegration(), FirstIsraelDashboardSettings, FirstIsraelDashboardSettingsSchema, getIntegrationConfig(), INTEGRATION_LOGOS, INTEGRATIONS_REGISTRY, IntegrationSettings (+11 more)

### Community 100 - "Community 100"
Cohesion: 0.18
Nodes (12): EventCard(), EventCardProps, GET_EVENTS_QUERY, GetEventsQuery, GetEventsQueryVariables, HomepageEvent, Hero(), LiveEventsSection() (+4 more)

### Community 101 - "Community 101"
Cohesion: 0.11
Nodes (17): ResetRubricButton(), ResetRubricButtonProps, AwardsMutationResult, AwardsMutationVariables, UPDATE_RUBRIC_AWARDS_MUTATION, FeedbackMutationResult, FeedbackMutationVariables, UPDATE_RUBRIC_FEEDBACK_MUTATION (+9 more)

### Community 102 - "Community 102"
Cohesion: 0.15
Nodes (19): FieldComparison, CategoryScoreCard(), CategoryScoreCardProps, FieldsByCategories, processFieldsBySections(), RubricScores(), SectionFields, categoryColors (+11 more)

### Community 103 - "Community 103"
Cohesion: 0.22
Nodes (14): SeasonSelector(), SeasonSelectorProps, TeamContents(), TeamContext, TeamProvider(), useTeam(), TeamEventResultCard(), TeamEventResultCardProps (+6 more)

### Community 104 - "Community 104"
Cohesion: 0.12
Nodes (7): EventUserSelector, EventUsersRepository, EventUsersSelector, EventUser, EventUsersTable, InsertableEventUser, UpdateableEventUser

### Community 105 - "Community 105"
Cohesion: 0.14
Nodes (8): JudgingDeliberationSelector, JudgingDeliberationsRepository, JudgingDeliberationsSelector, KyselyDatabaseSchema, JudgingDeliberation, JudgingDeliberationsTable, JudgingDeliberationUpdate, NewJudgingDeliberation

### Community 106 - "Community 106"
Cohesion: 0.14
Nodes (7): JudgingSessionSelector, JudgingSessionsRepository, JudgingSessionsSelector, InsertableJudgingSession, JudgingSession, JudgingSessionsTable, UpdateableJudgingSession

### Community 107 - "Community 107"
Cohesion: 0.20
Nodes (17): LogoStack(), LogoStackProps, AdvancingTeamsAward, AdvancingTeamsSlide(), AwardWinnerChromaSlide(), AwardWinnerSlide(), AwardWinnerSlideAward, AwardWinnerSlideProps (+9 more)

### Community 108 - "Community 108"
Cohesion: 0.08
Nodes (23): compileOnSave, compilerOptions, declaration, emitDecoratorMetadata, experimentalDecorators, importHelpers, lib, module (+15 more)

### Community 109 - "Community 109"
Cohesion: 0.14
Nodes (19): getDuration(), LinkCard(), LinkCardProps, DEFAULT_JUDGING_SESSION_CYCLE_TIME, DEFAULT_JUDGING_SESSION_LENGTH, DEFAULT_MATCH_LENGTH, DEFAULT_PRACTICE_CYCLE_TIME, DEFAULT_RANKING_CYCLE_TIME (+11 more)

### Community 110 - "Community 110"
Cohesion: 0.18
Nodes (16): JudgingSessionSelector(), JudgingSessionSelectorProps, SwapConfirmDialog(), SwapConfirmDialogProps, TeamScheduleView(), TeamScheduleViewProps, TeamSelector(), TeamSelectorProps (+8 more)

### Community 111 - "Community 111"
Cohesion: 0.12
Nodes (15): CompleteEventDialog(), CompleteEventDialogProps, DownloadResultsDialog(), DownloadResultsDialogProps, EventActionsSection(), EventActionsSectionProps, EventSettingsSectionProps, PublishEventDialog() (+7 more)

### Community 112 - "Community 112"
Cohesion: 0.11
Nodes (14): s3Client, uploadFile(), router, ALLOWED_DOCUMENT_FILE_TYPES, ALLOWED_EXTENSIONS, ALLOWED_IMAGE_FILE_TYPES, teamDocumentFileValidator, teamLogoFileValidator (+6 more)

### Community 113 - "Community 113"
Cohesion: 0.15
Nodes (19): ExportScoresheetMission(), BooleanClause(), ClausePickerProps, EnumClause(), EnumClauseProps, MissionClause(), MissionClauseProps, NumericClauseProps (+11 more)

### Community 114 - "Community 114"
Cohesion: 0.16
Nodes (16): GET_MATCH_PREVIEW_DATA, parseMatchPreviewData(), createMatchLoadedSubscription(), MATCH_LOADED_SUBSCRIPTION, MatchLoadedSubscriptionData, SubscriptionVars, Match, MatchEvent (+8 more)

### Community 115 - "Community 115"
Cohesion: 0.22
Nodes (16): CalendarGrid(), CalendarGridProps, generateTimeSlots(), BLOCK_COLORS, HEADER_HEIGHT, INTERVAL_MINUTES, ScheduleBlock, ScheduleColumn (+8 more)

### Community 116 - "Community 116"
Cohesion: 0.12
Nodes (19): router, router, DbMatchWithParticipants, makeAdminJudgingRoomResponse(), makeAdminJudgingSessionResponse(), makeAdminRobotGameMatchResponse(), AdminJudgingSessionResponseSchema, AdminJudgingSessionsWithRoomsResponseSchema (+11 more)

### Community 117 - "Community 117"
Cohesion: 0.12
Nodes (14): MatchRequest, router, makeSchedulerLocationResponse(), makeSchedulerTeamResponse(), router, attachDivision(), Location, SchedulerLocationResponseSchema (+6 more)

### Community 118 - "Community 118"
Cohesion: 0.16
Nodes (15): Team, TeamInfo(), TeamInfoProps, DisqualifiedTeamsList(), DisqualifiedTeamsListProps, DisqualifyConfirmationDialog(), DisqualifyConfirmationDialogProps, SearchTeamSection() (+7 more)

### Community 119 - "Community 119"
Cohesion: 0.25
Nodes (17): AbortSessionDialog(), AbortSessionDialogProps, FIXED_JUDGING_STAGES, FIXED_SESSION_LENGTH, formatTime(), getStageColor(), JudgingSessionTimerState, useJudgingSessionTimer() (+9 more)

### Community 120 - "Community 120"
Cohesion: 0.19
Nodes (13): AwardCard(), AwardCardProps, AwardsList(), AwardsListProps, EmptyState(), ErrorState(), LoadingState(), GET_DIVISION_AWARDS (+5 more)

### Community 121 - "Community 121"
Cohesion: 0.19
Nodes (13): AgendaEventCard(), AgendaEventCardProps, VISIBILITY_COLORS, AgendaEventsList(), AgendaEventsListProps, EmptyState(), ErrorState(), LoadingState() (+5 more)

### Community 122 - "Community 122"
Cohesion: 0.11
Nodes (16): EscalatedMutationResult, EscalatedMutationVariables, UPDATE_SCORESHEET_ESCALATED_MUTATION, GPMutationResult, GPMutationVariables, UPDATE_SCORESHEET_GP_MUTATION, UPDATE_SCORESHEET_MISSION_CLAUSE_MUTATION, RESET_SCORESHEET_MUTATION (+8 more)

### Community 123 - "Community 123"
Cohesion: 0.19
Nodes (21): Admin Application, Backend Application, Frontend Application, Portal Application, Scheduler Application, Development Docker Compose, Production Docker Compose, Run Production Migrations Workflow (+13 more)

### Community 124 - "Community 124"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, allowSyntheticDefaultImports, emitDeclarationOnly, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules (+12 more)

### Community 125 - "Community 125"
Cohesion: 0.11
Nodes (11): LoginErrorBoundary, LoginErrorBoundaryProps, LoginErrorBoundaryState, LoginErrorFallbackProps, LoginPageContent(), LoginPageContentProps, StepLoading(), StepLoadingProps (+3 more)

### Community 126 - "Community 126"
Cohesion: 0.17
Nodes (14): Match, Scoresheet, useInfiniteScroll(), ScoreboardRound, useScoreboardRounds(), TeamScoreData, useTeamScores(), ScoreCell() (+6 more)

### Community 127 - "Community 127"
Cohesion: 0.10
Nodes (15): ADVANCE_FINAL_DELIBERATION_STAGE_MUTATION, AdvanceFinalDeliberationStageData, AdvanceFinalDeliberationStageVariables, CompleteFinalDeliberationData, CompleteFinalDeliberationVariables, START_FINAL_DELIBERATION_MUTATION, StartFinalDeliberationData, StartFinalDeliberationVariables (+7 more)

### Community 128 - "Community 128"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, allowSyntheticDefaultImports, emitDeclarationOnly, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules (+12 more)

### Community 129 - "Community 129"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, allowSyntheticDefaultImports, emitDeclarationOnly, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules (+12 more)

### Community 130 - "Community 130"
Cohesion: 0.13
Nodes (10): AdminsRepository, AdminsSelector, AdminPermission, AdminPermissionTable, InsertableAdminPermission, UpdateableAdminPermission, Admin, AdminsTable (+2 more)

### Community 131 - "Community 131"
Cohesion: 0.14
Nodes (7): RoomSelector, RoomsRepository, RoomsSelector, InsertableJudgingRoom, JudgingRoom, JudgingRoomsTable, UpdateableJudgingRoom

### Community 132 - "Community 132"
Cohesion: 0.14
Nodes (7): TableSelector, TablesRepository, TablesSelector, InsertableRobotGameTable, RobotGameTable, RobotGameTablesTable, UpdateableRobotGameTable

### Community 133 - "Community 133"
Cohesion: 0.23
Nodes (13): DeliberationArgs, judgingDeliberationResolver(), JudgingWithDivisionId, CompleteDeliberationArgs, completeDeliberationResolver(), StartDeliberationArgs, startDeliberationResolver(), UpdateDeliberationPicklistArgs (+5 more)

### Community 134 - "Community 134"
Cohesion: 0.13
Nodes (15): DivisionSelector(), DivisionSelectorProps, DivisionTabBar(), EventHeader(), EventHeaderProps, Event, EventDetails, EventDetailsDivision (+7 more)

### Community 135 - "Community 135"
Cohesion: 0.16
Nodes (16): Deck, DeckContext, DeckContextType, SlideId, SlideProps, deckReducer(), DeckState, DeckStateAndActions (+8 more)

### Community 136 - "Community 136"
Cohesion: 0.17
Nodes (9): _example, _example, _example, _example, scoresheet, MissionClauseType, ScoresheetError, ScoresheetSchema (+1 more)

### Community 137 - "Community 137"
Cohesion: 0.13
Nodes (13): InspectionBonusChart(), InspectionBonusChartData, InspectionBonusChartProps, MissionSuccessRateChart(), MissionSuccessRateChartProps, PrecisionTokensChart(), PrecisionTokensChartProps, ScoresPerTableChart() (+5 more)

### Community 138 - "Community 138"
Cohesion: 0.15
Nodes (13): EventListItem(), EventListItemProps, EventCardProps, EventMissingInfo(), EventMissingInfoProps, MissingInfoAlert(), MissingInfoAlertProps, MissingInfoDialog() (+5 more)

### Community 139 - "Community 139"
Cohesion: 0.17
Nodes (14): LoginForm(), LoginFormProps, LoginFormValues, LoginForm(), buildLoginPayload(), inferUserId(), LoginPayload, submitLogin() (+6 more)

### Community 140 - "Community 140"
Cohesion: 0.17
Nodes (15): EditButton(), EditButtonProps, ScoresheetIncompleteAlert(), ScoresheetIncompleteAlertProps, ScoresheetItem, ScoresheetContext, ScoresheetContextValue, ScoresheetProvider() (+7 more)

### Community 141 - "Community 141"
Cohesion: 0.15
Nodes (9): FinalDeliberationSelector, FinalDeliberationsRepository, FinalDeliberation, FinalDeliberationsTable, FinalDeliberationStageData, FinalDeliberationStatus, FinalDeliberationUpdate, MandatoryAwards (+1 more)

### Community 142 - "Community 142"
Cohesion: 0.14
Nodes (15): SWITCH_AUDIENCE_DISPLAY_MUTATION, SwitchAudienceDisplayEvent, SwitchAudienceDisplayMutationData, SwitchAudienceDisplayMutationVars, UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION, UpdateAudienceDisplaySettingEvent, UpdateAudienceDisplaySettingMutationData, UpdateAudienceDisplaySettingMutationVars (+7 more)

### Community 143 - "Community 143"
Cohesion: 0.20
Nodes (12): columns, GPSelector(), GPSelectorProps, ScoreFloater(), ScoreFloaterProps, ScoresheetForm(), ScoresheetFormProps, ScoresheetMission() (+4 more)

### Community 144 - "Community 144"
Cohesion: 0.11
Nodes (17): executor, options, outputs, executor, outputs, name, assets, main (+9 more)

### Community 145 - "Community 145"
Cohesion: 0.11
Nodes (17): executor, options, outputs, executor, outputs, name, assets, main (+9 more)

### Community 146 - "Community 146"
Cohesion: 0.14
Nodes (11): CVFormCard(), CVFormCardProps, CVFormCategoryRow(), CVFormCategoryRowProps, CVForm(), CVFormProps, CVFormHeader(), CVFormHeaderProps (+3 more)

### Community 147 - "Community 147"
Cohesion: 0.24
Nodes (12): IntegrationDetailPanel(), IntegrationDetailPanelProps, IntegrationSettings, FirstIsraelDashboardSettings(), FirstIsraelDashboardSettingsFormValues, getSettingsComponent(), hasSettingsComponent(), IntegrationSettingsComponent (+4 more)

### Community 148 - "Community 148"
Cohesion: 0.15
Nodes (11): AssetCell(), AssetCellProps, AssetManager(), AssetManagerProps, AssetType, AdminJudgingRoomResponseSchema, AdminJudgingRoomsResponseSchema, JudgingRoom (+3 more)

### Community 149 - "Community 149"
Cohesion: 0.20
Nodes (12): TeamInfoCell(), TeamInfoCellProps, JudgingCategory, RubricButtonProps, GET_ROOM_JUDGING_SESSIONS, parseRoomJudgingSessions(), CategorizedRubrics, Judging (+4 more)

### Community 150 - "Community 150"
Cohesion: 0.21
Nodes (13): AwardGroup, AwardPage(), AwardPageProps, AwardGroup, AwardsView(), McContext, McContextType, McProviderProps (+5 more)

### Community 151 - "Community 151"
Cohesion: 0.37
Nodes (16): takanome-dev/assign-issue-action Action, actions/checkout Action, digitalocean/action-doctl Action, actions/setup-node Action, appleboy/ssh-action Action, Dependabot Configuration, GitHub Actions Best Practices, Assign Issue Workflow (+8 more)

### Community 152 - "Community 152"
Cohesion: 0.12
Nodes (12): { composePlugins, withNx }, createNextIntlPlugin, nextConfig, plugins, { composePlugins, withNx }, createNextIntlPlugin, nextConfig, plugins (+4 more)

### Community 153 - "Community 153"
Cohesion: 0.19
Nodes (13): CalendarHeader(), NotificationBanner(), NotificationBannerProps, Agenda, calculateBreaks(), NotificationState, prepareAgendaRequest(), prepareSchedulerRequest() (+5 more)

### Community 154 - "Community 154"
Cohesion: 0.18
Nodes (13): createMatchCompletedSubscription(), MATCH_COMPLETED_SUBSCRIPTION, MatchCompletedEvent, MatchCompletedSubscriptionData, SubscriptionVars, updateQueryWithCallback(), createMatchLoadedSubscription(), createMatchStageAdvancedSubscription() (+5 more)

### Community 155 - "Community 155"
Cohesion: 0.19
Nodes (11): createMatchLoadedSubscription(), MATCH_LOADED_SUBSCRIPTION, MatchLoadedSubscriptionData, SubscriptionVars, AwardWinner, MatchEvent, MatchParticipant, McData (+3 more)

### Community 156 - "Community 156"
Cohesion: 0.18
Nodes (8): router, router, router, router, router, router, router, router

### Community 157 - "Community 157"
Cohesion: 0.22
Nodes (5): config, config, config, config, config

### Community 158 - "Community 158"
Cohesion: 0.24
Nodes (10): ChangeDivisionMenu(), ChangeDivisionMenuProps, EventTeamsUnifiedViewProps, RemoveTeamButton(), RemoveTeamButtonProps, RemoveTeamDialog(), RemoveTeamDialogProps, UnifiedTeamsSearch() (+2 more)

### Community 159 - "Community 159"
Cohesion: 0.23
Nodes (11): judgingRubricsResolver(), JudgingWithDivisionId, RubricsArgs, teamRubricsResolver(), TeamWithDivisionId, sessionRubricsResolver(), SessionWithTeamAndDivision, buildCategorizedRubrics() (+3 more)

### Community 160 - "Community 160"
Cohesion: 0.33
Nodes (11): GET_VOLUNTEER_BY_ROLE_QUERY, GET_VOLUNTEER_ROLES_QUERY, CategoryRoleInfo, GetVolunteerByRoleQuery, GetVolunteerByRoleQueryVariables, GetVolunteerRolesQuery, GetVolunteerRolesQueryVariables, RoleInfo (+3 more)

### Community 161 - "Community 161"
Cohesion: 0.21
Nodes (11): AwardsDisplay, AwardsDisplayProps, Award, AssignAwardConfirmationDialog(), AssignAwardConfirmationDialogProps, PersonalAwardsSection(), ASSIGN_PERSONAL_AWARD, AssignPersonalAwardData (+3 more)

### Community 162 - "Community 162"
Cohesion: 0.17
Nodes (8): PageHeader(), PageHeaderProps, ReportItem, ReportMenuGrid(), ReportMenuGridProps, ReportMenuItem(), ReportMenuItemProps, TournamentManagerLayoutProps

### Community 163 - "Community 163"
Cohesion: 0.28
Nodes (12): calculateAverage(), calculateRubricAverage(), CategoryDataPoint, extractCoreValuesBySection(), extractCoreValuesFields(), getCategoryRadarColor(), processAllCategoriesRadarData(), processCoreValuesRadarData() (+4 more)

### Community 164 - "Community 164"
Cohesion: 0.20
Nodes (11): checkDatabasePermissions(), ESMFileMigrationProvider, migrateToLatest(), PG_PORT, checkTableExists(), getSequenceStatus(), syncAllSequences(), syncSequenceForTable() (+3 more)

### Community 165 - "Community 165"
Cohesion: 0.13
Nodes (14): compilerOptions, forceConsistentCasingInFileNames, jsx, jsxImportSource, module, noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns (+6 more)

### Community 166 - "Community 166"
Cohesion: 0.16
Nodes (9): AverageMedianCard(), AverageMedianCardProps, AverageMedianStats, CustomTooltipProps, RobotCorrelationChart(), RobotCorrelationChartProps, ScoresPerRoomChart(), ScoresPerRoomChartProps (+1 more)

### Community 168 - "Community 168"
Cohesion: 0.21
Nodes (10): ProfileDocumentButton(), ProfileDocumentButtonProps, RoomScheduleTable(), RoomScheduleTableProps, StartSessionButton(), StartSessionButtonProps, JudgingSessionContext, JudgingSessionContextType (+2 more)

### Community 169 - "Community 169"
Cohesion: 0.20
Nodes (9): ResetScoresheetDialog(), ResetScoresheetDialogProps, ScoresheetActionButtons(), ScoresheetActionButtonsProps, SignatureActions(), SignatureActionsProps, SignatureCanvas, SignatureCanvasHandle (+1 more)

### Community 170 - "Community 170"
Cohesion: 0.24
Nodes (8): router, router, isTeamsRegistration(), parseTeamCSVRegistration(), DbTeamWithData, makeAdminTeamResponse(), makeAdminTeamWithDivisionResponse(), parseTeamList()

### Community 171 - "Community 171"
Cohesion: 0.31
Nodes (9): Contact, ContactError, decodeContacts(), encodeContacts(), mergeContacts(), validateContact(), UploadSummary, generatePlaceholderPDF() (+1 more)

### Community 172 - "Community 172"
Cohesion: 0.21
Nodes (9): RoleAuthorizer(), RoleAuthorizerProps, LockUnlockRubricButton(), LockUnlockRubricButtonProps, SaveButton(), SaveButtonProps, partialMatch(), LemsUser (+1 more)

### Community 173 - "Community 173"
Cohesion: 0.23
Nodes (10): McProvider(), McLoadingSkeleton(), McMode, McModeToggle(), McModeToggleProps, GET_MC_DATA, parseMcData(), createMatchStageAdvancedSubscription() (+2 more)

### Community 174 - "Community 174"
Cohesion: 0.15
Nodes (9): COMPLETE_DELIBERATION_MUTATION, CompleteDeliberationData, CompleteDeliberationVariables, START_DELIBERATION_MUTATION, StartDeliberationData, StartDeliberationVariables, UPDATE_DELIBERATION_PICKLIST_MUTATION, UpdateDeliberationPicklistData (+1 more)

### Community 175 - "Community 175"
Cohesion: 0.24
Nodes (9): ApprovalModal(), ApprovalModalProps, AwardSection(), AwardSectionProps, AwardWinnerCard(), AwardWinnerCardProps, COMPLETE_FINAL_DELIBERATION_MUTATION, GET_DIVISION_AWARDS (+1 more)

### Community 176 - "Community 176"
Cohesion: 0.15
Nodes (12): compilerOptions, forceConsistentCasingInFileNames, module, noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns, noPropertyAccessFromIndexSignature, strict (+4 more)

### Community 177 - "Community 177"
Cohesion: 0.21
Nodes (11): AdminDivisionRequest, AdminEventRequest, AdminRequest, ExportRequest, FirstIsraelDashboardEventRequest, FirstIsraelDashboardRequest, PortalDivisionRequest, PortalEventRequest (+3 more)

### Community 178 - "Community 178"
Cohesion: 0.24
Nodes (9): FieldData, PreviousMatch(), ScoreboardContext, ScoreboardContextValue, ScoreboardProvider(), ScoreboardProviderProps, useScoreboard(), TeamScoreCard() (+1 more)

### Community 179 - "Community 179"
Cohesion: 0.27
Nodes (9): SoundTestDialog(), SoundTestDialogProps, createJudgingSessionCompletedSubscription(), JUDGING_SESSION_COMPLETED_SUBSCRIPTION, SubscriptionData, updateJudgingSessions(), updateQueryWithCallback(), JudgePage() (+1 more)

### Community 180 - "Community 180"
Cohesion: 0.29
Nodes (10): DragState, JudgingTimer(), createTimerReducer(), formatTime(), getJudgingStages(), JudgingTimerControls, JudgingTimerState, TimerAction (+2 more)

### Community 181 - "Community 181"
Cohesion: 0.17
Nodes (11): author, engines, node, license, name, express, overrides, @nx/express (+3 more)

### Community 182 - "Community 182"
Cohesion: 0.29
Nodes (10): CalendarContext, CalendarContextType, CalendarProvider(), CalendarProviderProps, createAgendaBlock(), createBlock(), createInitialBlocks(), BlocksByType (+2 more)

### Community 183 - "Community 183"
Cohesion: 0.29
Nodes (9): AudienceDisplayContext, AudienceDisplayContextData, AudienceDisplayProvider(), AudienceDisplayProviderProps, AwardWinnerSlideStyle, useAudienceDisplay(), MessageDisplay(), AudienceDisplayState (+1 more)

### Community 184 - "Community 184"
Cohesion: 0.25
Nodes (7): EventProvider(), UserProvider(), GET_VOLUNTEER_EVENT_DATA_QUERY, GetVolunteerEventDataQuery, GetVolunteerEventDataQueryVariables, VolunteerLayout(), VolunteerLayoutProps

### Community 185 - "Community 185"
Cohesion: 0.27
Nodes (7): AudioPlayerOptions, useAudioPlayer(), JUDGING_SOUNDS, JudgingSoundType, FIELD_TIMER_SOUNDS, FieldTimerSoundType, useTimerSounds()

### Community 186 - "Community 186"
Cohesion: 0.22
Nodes (8): RobotPerformanceInfo, TeamInformationChart(), TeamInformationChartData, TeamInformationChartProps, TeamProfileChart(), TeamProfileChartData, TeamProfileChartProps, TeamInsightsDashboardProps

### Community 187 - "Community 187"
Cohesion: 0.20
Nodes (9): compilerOptions, module, outDir, strict, target, types, exclude, extends (+1 more)

### Community 188 - "Community 188"
Cohesion: 0.24
Nodes (7): ABORT_JUDGING_SESSION_MUTATION, AbortJudgingSessionMutationData, AbortJudgingSessionMutationVars, JudgingStartedEvent, START_JUDGING_SESSION_MUTATION, StartJudgingSessionMutationData, StartJudgingSessionMutationVars

### Community 189 - "Community 189"
Cohesion: 0.29
Nodes (6): TeamProvider(), GET_TEAM_DATA_QUERY, GetTeamDataQuery, GetTeamDataQueryVariables, TeamLayout(), TeamLayoutProps

### Community 190 - "Community 190"
Cohesion: 0.20
Nodes (9): compilerOptions, allowJs, allowSyntheticDefaultImports, jsx, strict, extends, files, include (+1 more)

### Community 191 - "Community 191"
Cohesion: 0.20
Nodes (9): executor, outputs, name, projectType, $schema, sourceRoot, tags, targets (+1 more)

### Community 192 - "Community 192"
Cohesion: 0.20
Nodes (9): compilerOptions, allowJs, allowSyntheticDefaultImports, jsx, strict, extends, files, include (+1 more)

### Community 193 - "Community 193"
Cohesion: 0.20
Nodes (9): executor, outputs, name, projectType, $schema, sourceRoot, tags, // targets (+1 more)

### Community 194 - "Community 194"
Cohesion: 0.20
Nodes (9): compilerOptions, allowJs, allowSyntheticDefaultImports, jsx, strict, extends, files, include (+1 more)

### Community 195 - "Community 195"
Cohesion: 0.28
Nodes (8): FieldErrors, FormAction, formReducer(), FormState, SettingsSection(), SettingsSectionProps, SendGridSettings, SendGridSettingsSchema

### Community 196 - "Community 196"
Cohesion: 0.31
Nodes (8): ActiveMatchPanel(), ActiveMatchPanelProps, getParticipantStatus(), getStatusBorderColor(), getStatusIcon(), Match, Participant, TeamReadinessStatus

### Community 197 - "Community 197"
Cohesion: 0.31
Nodes (4): TeamListItem(), TeamList(), TeamPagination(), TeamPaginationProps

### Community 198 - "Community 198"
Cohesion: 0.22
Nodes (8): compilerOptions, declaration, outDir, target, types, exclude, extends, include

### Community 199 - "Community 199"
Cohesion: 0.22
Nodes (8): dependencies, tslib, exports, main, name, type, typings, version

### Community 200 - "Community 200"
Cohesion: 0.22
Nodes (8): executor, name, projectType, $schema, sourceRoot, tags, targets, lint

### Community 201 - "Community 201"
Cohesion: 0.32
Nodes (4): RubricRadioIcon(), RubricRadioIconProps, CoreValuesFieldCheckedIcon(), CoreValuesFieldUncheckedIcon()

### Community 202 - "Community 202"
Cohesion: 0.25
Nodes (7): dependencies, tslib, main, name, type, typings, version

### Community 203 - "Community 203"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, files, include

### Community 204 - "Community 204"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, types, exclude, extends, include

### Community 205 - "Community 205"
Cohesion: 0.25
Nodes (7): CoreValuesForm, CVFormAuthor, CVFormCategory, CVFormCategoryNames, CVFormCategoryNamesTypes, CVFormSubject, CVFormSubjectTypes

### Community 206 - "Community 206"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, migrate, scheduler, scheduler:linux:darwin, scheduler:win32

### Community 207 - "Community 207"
Cohesion: 0.29
Nodes (6): compilerOptions, esModuleInterop, extends, files, include, references

### Community 208 - "Community 208"
Cohesion: 0.38
Nodes (3): sponsorImages, SponsorsRow(), SponsorsDisplay()

### Community 209 - "Community 209"
Cohesion: 0.52
Nodes (4): GET_EVENT_BY_SLUG_QUERY, EventDetails, GetEventBySlugQueryResult, GetEventBySlugQueryVariables

### Community 210 - "Community 210"
Cohesion: 0.33
Nodes (6): createMatchEndgameTriggeredSubscription(), MATCH_ENDGAME_TRIGGERED_SUBSCRIPTION, MatchEndgameTriggeredEvent, MatchEndgameTriggeredSubscriptionData, SubscriptionVars, updateQueryWithCallback()

### Community 211 - "Community 211"
Cohesion: 0.43
Nodes (5): CurrentMatchHero(), getStatusColor(), MatchScheduleTable(), useMc(), MatchStatus

### Community 212 - "Community 212"
Cohesion: 0.33
Nodes (5): UPDATE_PARTICIPANT_STATUS, UpdateParticipantStatusResult, UpdateParticipantStatusVars, ParticipantNotPresentModal(), ParticipantNotPresentModalProps

### Community 213 - "Community 213"
Cohesion: 0.29
Nodes (6): @apollo/client, ApolloClient, DeclareDefaultOptions, Mutate, Query, WatchQuery

### Community 214 - "Community 214"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, types, exclude, extends, include

### Community 215 - "Community 215"
Cohesion: 0.48
Nodes (6): findAndReplace(), findAndReplaceBy(), isObject(), updateNested(), updateObjectKeysBy(), updateObjectKeysById()

### Community 216 - "Community 216"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, types, exclude, extends, include

### Community 217 - "Community 217"
Cohesion: 0.29
Nodes (6): dependencies, tslib, main, name, typings, version

### Community 218 - "Community 218"
Cohesion: 0.33
Nodes (4): GeneralInsightsDashboardProps, TeamInsightsDashboard(), Stat(), StatProps

### Community 219 - "Community 219"
Cohesion: 0.47
Nodes (3): getApiBase(), GraphiQLWrapper(), GraphiQLWrapper

### Community 220 - "Community 220"
Cohesion: 0.47
Nodes (5): MIN_SNAP_DURATION, positionToTime(), SNAP_MINUTES_VALUE, snapToGrid(), timeToPosition()

### Community 221 - "Community 221"
Cohesion: 0.53
Nodes (3): GET_DIVISION_VENUE_QUERY, GetDivisionVenueQuery, GetDivisionVenueQueryVariables

### Community 222 - "Community 222"
Cohesion: 0.33
Nodes (5): createMatchCompletedSubscription(), MATCH_COMPLETED_SUBSCRIPTION, MatchCompletedEvent, MatchCompletedSubscriptionData, SubscriptionVars

### Community 223 - "Community 223"
Cohesion: 0.33
Nodes (5): createTeamArrivedSubscription(), SubscriptionVars, TEAM_ARRIVED_SUBSCRIPTION, TeamArrivedEvent, TeamArrivedSubscriptionData

### Community 224 - "Community 224"
Cohesion: 0.40
Nodes (5): ALL_STATUSES, getStatusIcon(), ParticipantStatus, StatusLegend(), StatusLegendProps

### Community 225 - "Community 225"
Cohesion: 0.47
Nodes (3): Props, RichText(), Tag

### Community 226 - "Community 226"
Cohesion: 0.47
Nodes (4): FlagProps, getRegionDisplay(), getRegionFlag(), getRegionFlagUrl()

### Community 228 - "Community 228"
Cohesion: 0.50
Nodes (4): categoryColors, CombinedFeedbackTable(), CombinedFeedbackTableProps, Rubric

### Community 229 - "Community 229"
Cohesion: 0.50
Nodes (4): getStatusConfig(), SessionStatus, SessionStatusIndicator(), SessionStatusIndicatorProps

### Community 230 - "Community 230"
Cohesion: 0.40
Nodes (4): MATCH_STAGE_ADVANCED_SUBSCRIPTION, MatchStageAdvancedEvent, MatchStageAdvancedSubscriptionData, SubscriptionVars

### Community 231 - "Community 231"
Cohesion: 0.40
Nodes (4): MATCH_STARTED_SUBSCRIPTION, MatchStartedEvent, MatchStartedSubscriptionData, SubscriptionVars

### Community 232 - "Community 232"
Cohesion: 0.40
Nodes (4): createMatchUpdatedSubscription(), MATCH_UPDATED_SUBSCRIPTION, MatchUpdatedSubscriptionData, SubscriptionVars

### Community 234 - "Community 234"
Cohesion: 0.60
Nodes (3): SlideScaler(), SlideScalerProps, useDimensions()

### Community 235 - "Community 235"
Cohesion: 0.50
Nodes (3): cvFormSchema, CVFormSchema, CVFormSchemaCategory

### Community 242 - "Community 242"
Cohesion: 0.50
Nodes (3): CategoryScoresChart(), CategoryScoresChartData, CategoryScoresChartProps

### Community 243 - "Community 243"
Cohesion: 0.50
Nodes (3): JudgingRoomDelayChart(), JudgingRoomDelayChartData, JudgingRoomDelayChartProps

### Community 244 - "Community 244"
Cohesion: 0.50
Nodes (3): RobotConsistencyChart(), RobotConsistencyChartData, RobotConsistencyChartProps

## Knowledge Gaps
- **1778 isolated node(s):** `*.svg`, `{ composePlugins, withNx }`, `createNextIntlPlugin`, `nextConfig`, `plugins` (+1773 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `database` connect `GraphQL Server Core` to `Division GraphQL Resolvers`, `Audience Display System`, `Community 133`, `Backend Mutations`, `Community 20`, `Community 23`, `Community 26`, `Community 159`, `Community 34`, `Community 35`, `Community 170`, `Community 171`, `Community 68`, `Community 83`, `Community 96`, `Community 99`, `Community 112`, `Community 116`, `Community 117`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `merge()` connect `Referee GraphQL` to `Scorekeeper System`, `Head Referee Dashboard`, `Judge Advisor Interface`, `Judging Status Reports`, `Field Head Queuer`, `Tournament Manager GraphQL`, `Field Status Reports`, `Community 142`, `Lead Judge Interface`, `Community 24`, `Community 154`, `Community 155`, `Community 39`, `Community 173`, `Community 45`, `Community 179`, `Community 52`, `Community 53`, `Community 55`, `Community 56`, `Community 57`, `Community 66`, `Community 70`, `Community 75`, `Community 78`, `Community 84`, `Community 88`, `Community 222`, `Community 223`, `Community 97`, `Community 230`, `Community 231`, `Community 232`, `Community 114`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `Community 49` to `Community 37`, `Admin Event Management`, `Admin Localization`, `Community 73`, `Community 139`, `Community 110`, `Community 47`, `Community 111`, `Community 48`, `Community 51`, `Community 148`, `Community 22`, `Community 184`, `Community 153`, `Community 27`, `Community 28`, `Community 125`, `Community 158`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `*.svg`, `{ composePlugins, withNx }`, `createNextIntlPlugin` to the rest of the system?**
  _1778 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Division GraphQL Resolvers` be split into smaller, more focused modules?**
  _Cohesion score 0.020186335403726708 - nodes in this community are weakly interconnected._
- **Should `Audience Display System` be split into smaller, more focused modules?**
  _Cohesion score 0.021972049689440994 - nodes in this community are weakly interconnected._
- **Should `GraphQL Server Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06371976647206005 - nodes in this community are weakly interconnected._