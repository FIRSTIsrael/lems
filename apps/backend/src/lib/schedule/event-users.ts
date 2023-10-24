import { WithId } from 'mongodb';
import { randomString } from '@lems/utils/random';
import {
  Event,
  RobotGameTable,
  JudgingRoom,
  User,
  RoleTypes,
  getAssociationType,
  JudgingCategoryTypes,
  Role
} from '@lems/types';

export const getEventUsers = (
  event: WithId<Event>,
  tables: Array<WithId<RobotGameTable>>,
  rooms: Array<WithId<JudgingRoom>>
): User[] => {
  const users = [];

  RoleTypes.forEach(role => {
    const user: User = {
      eventId: event._id,
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

  let associationValues;
  switch (associationType) {
    case 'room':
      associationValues = rooms;
      break;
    case 'table':
      associationValues = tables;
      break;
    case 'category':
      associationValues = JudgingCategoryTypes;
      break;
  }

  return associationValues;
};
