# Scoresheet Creation

## Logic File Format

Scoresheet has 3 fields:

`season`: Season name. Basic string field.
`missions`: Mission array. Most of the logic is stored here.
`validators`: Global functions that manage resources etc.

Localization for scoresheets is written and stored separately from logic.
The logic contain only the pure logic and identifiers reusable across languages.

### Writing Missions

Each mission is structured as follows:
`id`: ID of the mission. Usually begins with 'm' followed by 2 numbers (e.g. `m01`). Follow the IDs in the RGR.
`clauses`: Array of mission clauses. Explained in further detail below.
`calculation`: Function that accepts clause values and returns calculated points.
Calculation functions also validate the clause values within each mission against one another.

#### Clauses

Each clause represents one scoring condition. Clauses have 3 types:
`boolean`: The most basic clause. Render as 2 buttons, yes and no.
`enum`: Most common clause. Allows for rendering buttons with custom text where only one option can be chosen.
For enum types, an additional field `options` needs to be defined which is an array including the enum keys.
`number`: Great for missions with larger quantities of options. Allows selecting a number within a range.
For number types, min and max need to be defined.

All clauses must be structured as follows:

```typescript

  type: MissionClauseType;
  default: boolean | string | number;
  options?: Array<string>;
  min?: number;
  max?: number;

```

Make sure to unclude a default value that corresponds to the initial setting of the field.

#### Calculation

The `calculation` function of each mission accepts clause values in order as arguments.
Each calculation should return one single number representing points earned in the mission.
Calculation functions can throw a `ScoresheetError` if conditions within the mission are not met.

Note regarding calculation functions:
The typescript compiler assumes each argument in the function can either be boolean, string, or number.
In order to satisfy the compiler, use String(x), Number(x) and Boolean(x).

#### Mission Examples

MASTERPIECE season EIB
This is the equipment inspection bonus. It is either acheived or not acheived.

```typescript

    {
      id: 'eib',
      clauses: [{ type: 'boolean', default: false }],
      calculation: clause1 => (clause1 ? 20 : 0)
    },

```

CARGO CONNECT season M04
This mission required moving an airplane and a truck past a certain line, and awarded 10 bonus points for moving both.

```typescript

    {
      id: 'm04',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false }
      ],
      calculation: (clause1, clause2) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 10;
        if (clause1 && clause2) points += 10;
        return points;
      }
    }

```

REPLAY Season M09
This mission required flipping tires and moving them into circles.
Notice that the calculation number throws an error if the amount of flipped tires in circles is greater than the tires flipped.

```typescript

    {
      id: 'm09',
      clauses: [
        { type: 'boolean', default: false },
        { type: 'boolean', default: false },
        { type: 'enum', options: ['0', '1', '2'], default: '0' }
      ],
      calculation: (clause1, clause2, clause3) => {
        let points = 0;
        if (clause1) points += 10;
        if (clause2) points += 15;
        points += Number(clause3) * 5;

        if (Number(clause3) > Number(clause1) + Number(clause2))
          throw new ScoresheetError('m09-e1');

        return points;
      }
    },

```

CARGO CONNECT M17
This mission will reward more points if more tokens are left on the field.
Notice the default value of 6 since we start with 6 tokens.

```typescript

{
      id: 'm17',
      clauses: [{ type: 'number', min: 0, max: 6, default: 6 }],
      calculation: clause1 => {
        switch (Number(clause1)) {
          case 1:
            return 10;
          case 2:
            return 15;
          case 3:
            return 25;
          case 4:
            return 35;
          default:
            return 50;
        }
      }
    }

```

### Validators

In some cases, validating mission clauses within the mission is not enough.
These cases require you to write a validator function, which receives a parameter called `values`.
`values` is an array of mission values, structured as follows:
`[{id: string, values: [clause1, clause2, clause3]}]` where clauses can be any type of clause.
Validators should throw an error if their conditions are not satisfied.

When writing validators, mission results are obtained using `findMission`.
In case an invalid mission is accessed, error `e-00` will be thrown.
Make sure to include it in the localization.

#### Validator Examples

REPLAY Season
In this season, M06 Clause 2 cannot be completed with M07.

```typescript
missions => {
  const m06 = findMission(missions, 'm06');
  const m07 = findMission(missions, 'm07');
  if (m06.values[1] && m07.values[0]) throw new ScoresheetError('e1');
};
```

CARGO CONNECT Season
In this season, there were a limited number of containers and multiple missions that used them.

```typescript
missions => {
  // Cargo containers cannot be in circles no matter what
  const m15 = findMission(missions, 'm15');
  const m16 = findMission(missions, 'm16');

  if (Number(m15.values[2]) + Number(m16.values[0]) + Number(m16.values[1]) > 8)
    throw new ScoresheetError('e1');
};
```

## Localization File Format

Localization is language dependant and should reference the IDs from the logic file.
A localization file should be named with an ISO 639-1 langugage code.

Localized scoresheet has 3 fields:

`missions`: Main localization field. Missions, their values, and erros are stored here.
`errors`: Global errors returned by the `validations` field on the scoresheet.

### Writing Localized Missions

A localized mission has the following fields:
`id`: ID of the mission. Should match the ID in the scoresheet logic file.
`title`: Title of the mission.
`description`: Optinal description for the mission, if the mission has text which is not associated with any `clause`.
`clauses`: Array of mission clauses. Explained in further detail below.
`remarks`: Optional array of additional remarks below the mission content.
`errors`: Optional array of error messages received from the `calculation` function.

#### Writing Localized Clauses

Mission clauses are parsed in the oder that they are declared on the scoresheet.
Make sure to preserve item order in arrays.

A localized clause has the following fields:
`description`: Text descibing the conditions for the clause.
`labels` Optional array that should only be filled for `enum` clauses. Contains text for enum buttons.

### Examples

MASTERPIECE Season M04

```typescript

    {
      id: 'm04',
      title: 'MASTERPIECE℠',
      clauses: [
        {
          description:
            'פריט האמנות מ-LEGO® של הקבוצה שלכם נמצא לפחות באופן חלקי באזור המטרה של המוזיאון:'
        },
        { description: '**בונוס:** ופריט האמנות נתמך לחלוטין על ידי המעמד:' }
      ],
      remarks: [
        'כדי לזכות בבונוס, בסיום המקצה לפריט האמנות מותר לגעת במעמד בלבד, ולמעמד אסור לגעת בציוד של הקבוצה מלבד פריט האמנות.'
      ],
      errors: [{ id: 'm04-e1', description: 'לא ניתן לקבל את הבונוס מבלי לבצע את המשימה.' }]
    }

```
