export const eventTypeDefs = `#graphql
  """
  Represents an event in the LEMS system
  """
  type Event {
    """
    Unique identifier for the event
    """
    id: ID!
    
    """
    URL-friendly identifier for the event
    """
    slug: String!
    
    """
    Display name of the event
    """
    name: String!
    
    """
    Start date of the event (ISO 8601 format)
    """
    startDate: String!
    
    """
    End date of the event (ISO 8601 format)
    """
    endDate: String!
    
    """
    Whether the event is fully set up with all divisions configured
    """
    isFullySetUp: Boolean!
    
    """
    All unique volunteer roles assigned to divisions in this event
    """
    volunteerRoles: [String!]!
  }

  type Query {
    """
    Retrieve all events with optional filtering
    """
    events(
      fullySetUp: Boolean
      startAfter: String
      startBefore: String
      endAfter: String
      endBefore: String
    ): [Event!]!
    
    """
    Retrieve a specific event by ID or slug
    """
    event(id: ID, slug: String): Event
  }
`;
