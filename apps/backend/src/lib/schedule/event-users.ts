import { WithId } from 'mongodb';
import { randomString } from '@lems/utils';
import {
  Event,
  RobotGameTable,
  JudgingRoom,
  User,
  RoleTypes,
  getAssociationType,
  JudgingCategoryTypes
} from '@lems/types';

export const getEventUsers = (
  event: WithId<Event>,
  tables: Array<WithId<RobotGameTable>>,
  rooms: Array<WithId<JudgingRoom>>
): User[] => {
  const users = [];
  RoleTypes.forEach(role => {
    if (getAssociationType(role)) {
      const aType = getAssociationType(role);
      let iterable;
      switch (aType) {
        case 'room':
          iterable = rooms;
          break;
        case 'table':
          iterable = tables;
          break;
        case 'category':
          iterable = JudgingCategoryTypes;
          break;
      }

      iterable.forEach(value => {
        const user: User = {
          eventId: event._id,
          isAdmin: false,
          role: role,
          roleAssociation: {
            type: aType,
            value: value._id ? value._id : value
          },
          password: randomString(4),
          lastPasswordSetDate: new Date()
        };

        users.push(user);
      });
    } else {
      const user: User = {
        eventId: event._id,
        isAdmin: false,
        role: role,
        password: randomString(4),
        lastPasswordSetDate: new Date()
      };
      users.push(user);
    }
  });

  return users;
};
