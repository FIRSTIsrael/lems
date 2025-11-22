import { getCvFieldIds } from '@lems/season';

const cvFieldIds = getCvFieldIds();

// Make cv rubric values from rubrics collection.
// Add this pipeline after the $match stage in the rubrics collection.
export const cvRubricPipeline = [
  // Step 1 - Group by teamId and make ipFields and rdFields
  {
    $group: {
      _id: '$teamId',
      ipFields: {
        $push: {
          $cond: [{ $eq: ['$category', 'innovation-project'] }, '$data.values', null]
        }
      },
      rdFields: {
        $push: {
          $cond: [{ $eq: ['$category', 'robot-design'] }, '$data.values', null]
        }
      }
    }
  },

  //Step 2a - filter out null values from ipFields and rdFields
  {
    $project: {
      teamId: '$_id',
      ipFields: {
        $filter: {
          input: '$ipFields',
          as: 'ipf',
          cond: { $ne: ['$$ipf', null] }
        }
      },
      rdFields: {
        $filter: {
          input: '$rdFields',
          as: 'rdf',
          cond: { $ne: ['$$rdf', null] }
        }
      }
    }
  },

  // Step 2b - Filter ipFields and rdFields to only include the fields that are in the cvFieldIds
  {
    $project: {
      teamId: '$_id',
      ipFields: {
        $arrayToObject: {
          $filter: {
            input: {
              $objectToArray: { $arrayElemAt: ['$ipFields', 0] }
            },
            as: 'ipf',
            cond: { $in: ['$$ipf.k', cvFieldIds['innovation-project']] }
          }
        }
      },
      rdFields: {
        $arrayToObject: {
          $filter: {
            input: {
              $objectToArray: { $arrayElemAt: ['$rdFields', 0] }
            },
            as: 'rdf',
            cond: { $in: ['$$rdf.k', cvFieldIds['robot-design']] }
          }
        }
      }
    }
  },

  // Step 3 - combine ipFields and rdFields into cvFields
  {
    $project: {
      teamId: true,
      cvFields: {
        $mergeObjects: [
          {
            $arrayToObject: {
              $map: {
                input: { $objectToArray: '$ipFields' },
                as: 'ipf',
                in: {
                  k: { $concat: ['ip-', '$$ipf.k'] },
                  v: '$$ipf.v'
                }
              }
            }
          },
          {
            $arrayToObject: {
              $map: {
                input: { $objectToArray: '$rdFields' },
                as: 'rdf',
                in: {
                  k: { $concat: ['rd-', '$$rdf.k'] },
                  v: '$$rdf.v'
                }
              }
            }
          }
        ]
      }
    }
  },

  // Step 4 - Lookup original rubrics and replace data.values with cvFields
  {
    $lookup: {
      from: 'rubrics',
      localField: 'teamId',
      foreignField: 'teamId',
      as: 'originalDocs'
    }
  },
  {
    $unwind: '$originalDocs'
  },
  {
    $addFields: {
      'originalDocs.data.values': {
        $cond: {
          if: { $eq: ['$originalDocs.category', 'core-values'] },
          then: '$cvFields',
          else: '$originalDocs.data.values'
        }
      }
    }
  },
  {
    $replaceRoot: {
      newRoot: '$originalDocs'
    }
  }
];
