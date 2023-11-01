import { CVFormSchema } from './typing';

export const cvFormSchema: CVFormSchema = {
  columns: [
    {
      title: 'קבוצה / תלמיד'
    },
    {
      title: 'מנטור / הורה / קהל / מתנדב'
    }
  ],
  categories: [
    {
      id: 'exceedsExpectations',
      title: 'מעל ומעבר למצופה',
      emoji: '😍',
      teamOrStudent: [
        'Helping to start another team',
        'Serving as a peer mentor for another team before the event',
        'Creating and sharing training materials or other resources to help other teams'
      ],
      anyoneElse: [
        'Mentoring a coach of another team',
        'Recruiting a school or organization to start new teams',
        'Teaching training courses or providing training materials for new coaches'
      ]
    },
    {
      id: 'aboveExpectations',
      title: 'מעל המצופה',
      emoji: '😃',
      teamOrStudent: [
        'Serving as a peer mentor for another team during the event',
        'Cheering for other team(s) at the Robot Game tables',
        'Sharing knowledge or resources to help another team during the event'
      ],
      anyoneElse: [
        'Sharing knowledge or resources to help another team',
        'Cheering for other team(s) at the Robot Game tables'
      ]
    },
    {
      id: 'standardExpectations',
      title: 'כמצופה',
      emoji: '🙂',
      teamOrStudent: [
        'Listening to and acknowledging the ideas of others',
        'Showing support and encouragement to a team member who is struggling',
        'Being polite and respectful when interacting with Judges, coaches, other adults, or team members',
        'Cheering on their team members or their team’s robot'
      ],
      anyoneElse: [
        'Giving positive, helpful, or encouraging suggestions during Robot Game matches',
        'Helping with carrying or setting up heavy, awkward, or complex presentation materials, props, or visual aids',
        'Giving suggestions or guidance to help team make decisions',
        'Using a computer along with the team; teammembers are using the mouse / keyboard'
      ]
    },
    {
      id: 'possibleConcern',
      title: 'בעיה אפשרית',
      emoji: '🤔',
      teamOrStudent: [
        'Looking at coach for cues during judging sessions',
        'Playing rough, play fighting, throwing stuff',
        'Using swear words, offensive language'
      ],
      anyoneElse: [
        'Carrying the robot or setting up presentation materials without clear reason',
        'Managing presentation slides',
        'Giving negative, overbearing, or excessive instructions during Robot Game matches'
      ]
    },
    {
      id: 'belowExpectations',
      title: 'מתחת למצופה',
      emoji: '☹️',
      teamOrStudent: [
        'Displaying hostile, aggressive actions toward others; name-calling',
        'Showing poor sportsmanship by talking back to the Referee, pouting, gloating upon winning, etc.',
        'Talking about inappropriate topics/using inappropriate language',
        'Being unable to explain/demonstrate work'
      ],
      anyoneElse: [
        'Handling robot, computer or other materials during a judging session',
        'Accessing or updating the robot programing',
        'Speaking to or talking over the team or judges in judging sessions',
        'Challenging the decisions of Referees or Judges'
      ]
    },
    {
      id: 'inappropriate',
      title: 'אינו מתאים',
      emoji: '😡',
      teamOrStudent: [
        'Stealing, vandalism, physical fighting',
        'Bullying',
        'Cheating or intentionally negatively impacting another team'
      ],
      anyoneElse: [
        'Cheating or intentionally negatively impacting another team',
        'Doing work for the team'
      ]
    }
  ]
};
