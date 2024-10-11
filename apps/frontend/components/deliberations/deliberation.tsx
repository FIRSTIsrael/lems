import { ObjectId, WithId } from 'mongodb';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  JudgingDeliberation,
  AwardNames,
  Award,
  PRELIMINARY_DELIBERATION_PICKLIST_LENGTH
} from '@lems/types';
import { reorder } from '@lems/utils/arrays';

interface DeliberationProps {
  value: JudgingDeliberation;
  onChange: (value: Partial<JudgingDeliberation>) => void;
  awards?: Array<WithId<Award>>;
  children?: React.ReactNode;
}

const Deliberation: React.FC<DeliberationProps> = ({ value, onChange, awards, children }) => {
  const getPicklistSize = (name: AwardNames) => {
    if (awards) return awards.filter(award => award.name === name).length;
    return PRELIMINARY_DELIBERATION_PICKLIST_LENGTH;
  };

  const getPicklist = (name: AwardNames) => {
    return [...(value.awards[name] ?? [])];
  };

  const isTeamInPicklist = (teamId: string | ObjectId, name: AwardNames) => {
    return getPicklist(name).includes(teamId as ObjectId);
  };

  const setPicklist = (name: AwardNames, newList: Array<ObjectId>) => {
    setPicklists({ [name]: newList });
  };

  const setPicklists = (newPicklists: { [key in AwardNames]?: Array<ObjectId> }) => {
    const newDeliberation = { ...value };
    newDeliberation.awards = { ...value.awards, ...newPicklists };
    onChange({ awards: newDeliberation.awards });
  };

  const addTeamToPicklist = (teamId: string, index: number, name: AwardNames) => {
    const picklist: Array<string | ObjectId> = [...getPicklist(name)];
    if (picklist.length >= getPicklistSize(name)) return;
    if (picklist.includes(teamId)) return;

    picklist.splice(index, 0, teamId);
    setPicklist(name, picklist as Array<ObjectId>);
  };

  const removeTeamFromPicklist = (teamId: string, name: AwardNames) => {
    const newPicklist = getPicklist(name).filter(id => id.toString() !== teamId);
    setPicklist(name, newPicklist);
  };

  const moveTeamBetweenPicklists = (
    teamId: string,
    source: AwardNames,
    destination: AwardNames,
    index: number
  ) => {
    let destinationPicklist: Array<string | ObjectId> = [...getPicklist(destination)];
    if (destinationPicklist.length >= getPicklistSize(destination)) {
      return;
    }

    let sourcePicklist: Array<string | ObjectId> = [...getPicklist(source)];
    sourcePicklist = sourcePicklist.filter(id => id !== teamId);
    destinationPicklist.splice(index, 0, teamId);
    setPicklists({ [source]: sourcePicklist, [destination]: destinationPicklist });
  };

  return (
    <DragDropContext
      onDragEnd={result => {
        const { source, destination, draggableId } = result;
        if (!destination) {
          return;
        }
        const teamId = draggableId.split(':')[1];

        if (destination.droppableId === 'trash') {
          if (source.droppableId === 'team-pool') {
            return;
          }
          removeTeamFromPicklist(teamId, source.droppableId as AwardNames);
          return;
        }

        const destinationList = destination.droppableId as AwardNames;
        switch (source.droppableId) {
          case 'team-pool':
            if (isTeamInPicklist(teamId, destinationList)) {
              return;
            }
            addTeamToPicklist(teamId, destination.index, destinationList);
            break;
          case destination.droppableId:
            const reordered = reorder(
              getPicklist(destinationList),
              source.index,
              destination.index
            );
            setPicklist(destinationList, reordered);
            break;
          default:
            moveTeamBetweenPicklists(
              teamId,
              source.droppableId as AwardNames,
              destinationList,
              destination.index
            );
            break;
        }
      }}
    >
      {children}
    </DragDropContext>
  );
};

export default Deliberation;
