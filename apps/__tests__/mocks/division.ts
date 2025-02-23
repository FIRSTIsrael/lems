import { ObjectId } from "mongodb";
import { Division } from "../../../libs/types/src";

export const mockDivision : Division = {
  name: "הבית הסגול",
  color: "purple",
  hasState: false,
  eventId: new ObjectId
}