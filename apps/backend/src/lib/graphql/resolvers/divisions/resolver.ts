import db from '../../../database';

export const divisionResolver = async (_parent: unknown, args: { id: string }) => {
  if (!args.id) {
    throw new Error('Division ID is required');
  }

  const division = await db.divisions.byId(args.id).get();

  if (!division) {
    throw new Error(`Division with ID ${args.id} not found`);
  }

  return division;
};
