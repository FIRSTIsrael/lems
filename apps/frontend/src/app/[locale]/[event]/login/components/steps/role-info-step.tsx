'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { LoginFormValues, LoginStep } from '../../types';
import { NextStepButton } from '../next-step-button';
import { useVolunteer } from '../volunteer-context';
import { RoleInfo } from '../volunteers.graphql';

type RoleInfoType = 'table' | 'room' | 'category';

const getRoleInfoType = (roleInfo: RoleInfo | null | undefined): RoleInfoType | null => {
  if (!roleInfo) return null;
  if (roleInfo.__typename === 'TableRoleInfo') return 'table';
  if (roleInfo.__typename === 'RoomRoleInfo') return 'room';
  if (roleInfo.__typename === 'CategoryRoleInfo') return 'category';
  return null;
};

const getRoleInfoValue = (roleInfo: RoleInfo | null | undefined): string => {
  if (!roleInfo) return '';
  if (roleInfo.__typename === 'TableRoleInfo') return roleInfo.tableId;
  if (roleInfo.__typename === 'RoomRoleInfo') return roleInfo.roomId;
  if (roleInfo.__typename === 'CategoryRoleInfo') return roleInfo.category;
  return '';
};

export function RoleInfoStep() {
  const t = useTranslations('pages.login');
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();
  const { volunteerData, needsUser } = useVolunteer();

  if (!volunteerData) {
    return null;
  }

  // Role info is identical for all volunteers of the same role
  // so we can just take the first one
  const roleInfoType = getRoleInfoType(volunteerData.volunteers[0].roleInfo);
  if (!roleInfoType) {
    return null; // Should never happen
  }

  let options: Array<{ id: string; name: string }> = [];

  if (roleInfoType === 'category') {
    options = [
      { id: 'core-values', name: 'Core Values' },
      { id: 'robot-design', name: 'Robot Design' },
      { id: 'innovation-project', name: 'Innovation Project' }
    ];
  } else {
    // For table and room, we would need to fetch them separately or from another source
    // For now, we're relying on the backend to validate the role info value
    // Users can enter a specific value, but we'll leave options empty
    options = [];
  }

  // Filter to only options that match this role's volunteers
  const roleInfoValuesForRole = new Set(
    volunteerData.volunteers.map(v => getRoleInfoValue(v.roleInfo))
  );
  const availableOptions = options.filter(opt => roleInfoValuesForRole.has(opt.id));

  const selectedOption = availableOptions.find(opt => opt.id === values.associationValue) || null;

  const handleNext = async () => {
    if (needsUser) {
      setFieldValue('currentStep', LoginStep.User);
      return;
    }

    setFieldValue('currentStep', LoginStep.Password);
  };

  const handleRoleInfoChange = (
    _event: React.SyntheticEvent,
    newValue: (typeof availableOptions)[0] | null
  ) => {
    setFieldValue('associationValue', newValue?.id || '');
  };

  const instructionKey = `roleInfo-${roleInfoType}` as const;

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t(`instructions.${instructionKey}`)}
      </Typography>
      <Autocomplete
        options={availableOptions}
        getOptionLabel={option => option.name}
        value={selectedOption}
        onChange={handleRoleInfoChange}
        renderInput={params => (
          <TextField
            {...params}
            label={t(`fields.${roleInfoType}`)}
            required
            disabled={isSubmitting}
          />
        )}
        disabled={isSubmitting}
      />
      <NextStepButton onClick={handleNext} />
    </>
  );
}
