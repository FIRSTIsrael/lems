import { gql, TypedDocumentNode } from '@apollo/client';
import type { AudienceDisplayScreen } from '../types';

interface UpdateAudienceDisplaySettingEvent {
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
  version: number;
}

interface UpdateAudienceDisplaySettingMutationData {
  updateAudienceDisplaySetting: UpdateAudienceDisplaySettingEvent;
}

interface UpdateAudienceDisplaySettingMutationVars {
  divisionId: string;
  display: AudienceDisplayScreen;
  settingKey: string;
  settingValue: unknown;
}

export const UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION: TypedDocumentNode<
  UpdateAudienceDisplaySettingMutationData,
  UpdateAudienceDisplaySettingMutationVars
> = gql`
  mutation UpdateAudienceDisplaySettingEvent(
    $divisionId: String!
    $display: AudienceDisplayScreen!
    $settingKey: String!
    $settingValue: JSON!
  ) {
    updateAudienceDisplaySetting(
      divisionId: $divisionId
      display: $display
      settingKey: $settingKey
      settingValue: $settingValue
    ) {
      display
      settingKey
      settingValue
      version
    }
  }
`;
