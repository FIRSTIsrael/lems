interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  division_id: string;
}

interface PitMapArea {
  id: string;
  name: string;
  max_teams: number;
  division_id: string | null;
}

interface TeamAssignment {
  team_id: string;
  pit_map_area_id: string;
  position_x: number;
  position_y: number;
  spot_number: number;
}

interface AffiliationGroup {
  affiliation: string;
  teams: Team[];
}

/**
 * Groups teams by affiliation to keep teams from the same organization together
 */
function groupTeamsByAffiliation(teams: Team[]): AffiliationGroup[] {
  const affiliationMap = new Map<string, Team[]>();

  teams.forEach(team => {
    const existing = affiliationMap.get(team.affiliation) || [];
    existing.push(team);
    affiliationMap.set(team.affiliation, existing);
  });

  return Array.from(affiliationMap.entries())
    .map(([affiliation, teams]) => ({ affiliation, teams }))
    .sort((a, b) => b.teams.length - a.teams.length); // Largest groups first
}

/**
 * Distributes teams across pit map areas, keeping teams from the same affiliation together
 * @param teams - Array of teams to distribute
 * @param areas - Array of pit map areas with capacity constraints
 * @returns Array of team assignments with positions
 */
export function distributeTeamsAcrossPitAreas(
  teams: Team[],
  areas: PitMapArea[]
): TeamAssignment[] {
  if (teams.length === 0 || areas.length === 0) {
    return [];
  }

  // Group teams by affiliation
  const affiliationGroups = groupTeamsByAffiliation(teams);

  // Initialize area tracking
  const areaCapacity = areas.map(area => ({
    area,
    remaining: area.max_teams,
    assignedTeams: [] as Team[]
  }));

  const assignments: TeamAssignment[] = [];

  // Try to place affiliation groups together in the same area
  for (const group of affiliationGroups) {
    let groupTeams = [...group.teams];

    while (groupTeams.length > 0) {
      // Find the area with the most remaining capacity that can fit at least one team
      const bestArea = areaCapacity
        .filter(ac => {
          // If area is division-specific, only accept teams from that division
          if (ac.area.division_id) {
            return ac.remaining > 0 && groupTeams.some(t => t.division_id === ac.area.division_id);
          }
          return ac.remaining > 0;
        })
        .sort((a, b) => b.remaining - a.remaining)[0];

      if (!bestArea) {
        console.warn(
          `No available area for affiliation group: ${group.affiliation}, remaining teams: ${groupTeams.length}`
        );
        break;
      }

      // Filter teams that can go in this area (division check)
      const eligibleTeams = bestArea.area.division_id
        ? groupTeams.filter(t => t.division_id === bestArea.area.division_id)
        : groupTeams;

      if (eligibleTeams.length === 0) {
        console.warn(
          `No eligible teams for area ${bestArea.area.name} from affiliation ${group.affiliation}`
        );
        break;
      }

      // Take as many teams as possible from this group for this area
      const teamsToAssign = eligibleTeams.slice(0, bestArea.remaining);

      teamsToAssign.forEach(team => {
        const spotNumber = bestArea.assignedTeams.length + 1;
        const position = calculatePosition(spotNumber, bestArea.area.max_teams);

        assignments.push({
          team_id: team.id,
          pit_map_area_id: bestArea.area.id,
          position_x: position.x,
          position_y: position.y,
          spot_number: spotNumber
        });

        bestArea.assignedTeams.push(team);
        bestArea.remaining--;
      });

      // Remove assigned teams from the group
      groupTeams = groupTeams.filter(t => !teamsToAssign.includes(t));
    }
  }

  return assignments;
}

/**
 * Calculates position within an area based on spot number
 * Distributes teams in a grid pattern within the area
 */
function calculatePosition(spotNumber: number, maxTeams: number): { x: number; y: number } {
  // Calculate grid dimensions (roughly square)
  const cols = Math.ceil(Math.sqrt(maxTeams));
  const rows = Math.ceil(maxTeams / cols);

  // Calculate position in grid (0-indexed)
  const index = spotNumber - 1;
  const row = Math.floor(index / cols);
  const col = index % cols;

  // Convert to percentage (with padding)
  const padding = 10; // 10% padding on each side
  const usableWidth = 100 - 2 * padding;
  const usableHeight = 100 - 2 * padding;

  const x = padding + (col / Math.max(cols - 1, 1)) * usableWidth;
  const y = padding + (row / Math.max(rows - 1, 1)) * usableHeight;

  return {
    x: Math.round(x * 10) / 10, // Round to 1 decimal
    y: Math.round(y * 10) / 10
  };
}

/**
 * Validates that all teams can fit in the provided areas
 */
export function validatePitMapCapacity(
  teams: Team[],
  areas: PitMapArea[]
): {
  valid: boolean;
  totalCapacity: number;
  totalTeams: number;
  message?: string;
} {
  const totalCapacity = areas.reduce((sum, area) => sum + area.max_teams, 0);
  const totalTeams = teams.length;

  if (totalCapacity < totalTeams) {
    return {
      valid: false,
      totalCapacity,
      totalTeams,
      message: `Insufficient capacity: ${totalCapacity} spots for ${totalTeams} teams`
    };
  }

  // Check division-specific constraints
  const divisionTeamCounts = new Map<string, number>();
  teams.forEach(team => {
    divisionTeamCounts.set(team.division_id, (divisionTeamCounts.get(team.division_id) || 0) + 1);
  });

  for (const [divisionId, teamCount] of divisionTeamCounts.entries()) {
    const divisionCapacity = areas
      .filter(a => !a.division_id || a.division_id === divisionId)
      .reduce((sum, area) => sum + area.max_teams, 0);

    if (divisionCapacity < teamCount) {
      return {
        valid: false,
        totalCapacity,
        totalTeams,
        message: `Insufficient capacity for division: ${divisionCapacity} spots for ${teamCount} teams`
      };
    }
  }

  return {
    valid: true,
    totalCapacity,
    totalTeams
  };
}
