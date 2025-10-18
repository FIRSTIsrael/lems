export const eventTypeDefs = `#graphql
  """
  Represents a division in an event
  """
  type Division {
    """
    Unique identifier for the division
    """
    id: ID!
  }

  """
  Represents a volunteer in an event
  """
  type Volunteer {
    """
    The role this volunteer has
    """
    role: String!
    
    """
    Divisions this volunteer has access to
    """
    divisions: [Division!]!
  }

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
    All divisions in this event
    """
    divisions: [Division!]!
    
    """
    Get volunteers in this event, optionally filtered by role
    """
    volunteers(role: String): [Volunteer!]!
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
