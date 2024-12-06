import { WithId } from 'mongodb';
import { randomString } from '@lems/utils/random';
import {
  Division,
  RobotGameTable,
  JudgingRoom,
  User,
  RoleTypes,
  getAssociationType,
  JudgingCategoryTypes,
  Role,
  DivisionSectionTypes,
  FllEvent,
  EventUserAllowedRoles
} from '@lems/types';

export const getDivisionUsers = (
  event: WithId<FllEvent>,
  division: WithId<Division>,
  tables: Array<WithId<RobotGameTable>>,
  rooms: Array<WithId<JudgingRoom>>
): User[] => {
  const users = [];
  const roles = RoleTypes.filter(
    role => !event.eventUsers?.includes(role as EventUserAllowedRoles)
  );

  roles.forEach(role => {
    const user: User = {
      divisionId: division._id,
      isAdmin: false,
      role: role,
      password: randomString(4),
      lastPasswordSetDate: new Date()
    };

    const associationValues = getAssociationValues(role, tables, rooms);
    if (!associationValues) {
      users.push(user);
    } else {
      associationValues.forEach(value => {
        const userWithAssociation = {
          ...user,
          roleAssociation: {
            type: getAssociationType(role),
            value: value._id ? value._id : value
          },
          password: randomString(4)
        };

        users.push(userWithAssociation);
      });
    }
  });

  return users;
};

const getAssociationValues = (
  role: Role,
  tables: Array<WithId<RobotGameTable>>,
  rooms: Array<WithId<JudgingRoom>>
) => {
  const associationType = getAssociationType(role);
  if (!associationType) return null;
  switch (associationType) {
    case 'room':
      return rooms;
    case 'table':
      return tables;
    case 'category':
      return JudgingCategoryTypes;
    case 'section':
      return DivisionSectionTypes;
  }
};
