import { useEffect, useState, useMemo } from 'react';
import Router from 'next/router';
import { Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';
import { JUDGING_SESSION_LENGTH, JudgingSession, Team } from '@lems/types';
import Coundown from '../countdown';

interface TimerProps {
  session: JudgingSession;
  team: Team;
}

const JudgingTimer: React.FC<TimerProps> = ({ session, team }) => {
  const [stageText, setStageText] = useState<string>('זמן התארגנות');
  const [barColor, setBarColor] = useState<string | null>(null);
  const [bgStyle, setBgStyle] = useState<object>({});

  const endTime = dayjs(session.start).add(JUDGING_SESSION_LENGTH, 'seconds');

  // const timerEvents = useMemo(() => {
  //   const flashRedStyle = {
  //     animation: '600ms infinite alternate ease-out breathing-flash-animation'
  //   };

  //   return {

  //   }

  //   return [
  //    {
  //       eventName: 'team_welcome',
  //       eventTime: 1620,
  //       eventAction: () => {}
  //     },
  //     {
  //       eventName: 'skip_team_welcome',
  //       eventTime: 1610,
  //       eventAction: () => {},
  //       button: {
  //         text: 'דלג לתחילת השיפוט',
  //         handleClick: () => {
  //           setSeconds(1560);
  //           setCurrentEvent(event => event + 2);
  //         }
  //       }
  //     },
  //     {
  //       eventName: 'flash_before_begin',
  //       eventTime: 1564,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'begin',
  //       eventTime: 1560,
  //       eventAction: () => {
  //         setIsTimerActive(false);
  //         setStageText('הגיע הזמן להתחיל');
  //         setEventSeconds(300);
  //         setBgStyle({});
  //       },
  //       button: {
  //         text: 'לחצו להתחלת פרויקט החדשנות',
  //         handleClick: () => {
  //           setIsTimerActive(true);
  //           setCurrentEvent(event => event + 1);
  //           setStageText('הצגה - פרויקט החדשנות');
  //           setBarColor('#005BA8');
  //         }
  //       }
  //     },
  //     {
  //       eventName: 'flashBeforeProjectQuestions',
  //       eventTime: 1264,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'questionsProject',
  //       eventTime: 1260,
  //       eventAction: () => {
  //         setEventSeconds(300);
  //         setBgStyle({});
  //         setStageText('שאלות - פרויקט החדשנות');
  //       }
  //     },
  //     {
  //       eventName: 'flashBeforeRobot',
  //       eventTime: 964,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'startRobot',
  //       eventTime: 960,
  //       eventAction: () => {
  //         setBarColor('#007632');
  //         setEventSeconds(300);
  //         setStageText('הצגה - תכנון הרובוט');
  //         setBgStyle({});
  //       }
  //     },
  //     {
  //       eventName: 'flashBeforeRobotQuestions',
  //       eventTime: 664,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'questionsRobot',
  //       eventTime: 660,
  //       eventAction: () => {
  //         setEventSeconds(300);
  //         setStageText('שאלות - תכנון הרובוט');
  //         setBgStyle({});
  //       }
  //     },
  //     {
  //       eventName: 'flashBeforeCoreValues',
  //       eventTime: 364,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'startCoreValues',
  //       eventTime: 360,
  //       eventAction: () => {
  //         setBarColor('#E3000A');
  //         setEventSeconds(180);
  //         setStageText('הצגה - ערכי ליבה');
  //         setBgStyle({});
  //       }
  //     },
  //     {
  //       eventName: 'flashBeforeCoreValuesQuestions',
  //       eventTime: 184,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'questionsCoreValues',
  //       eventTime: 180,
  //       eventAction: () => {
  //         setEventSeconds(180);
  //         setStageText('שאלות - ערכי ליבה');
  //         setBgStyle({});
  //       }
  //     },
  //     {
  //       eventName: 'flashBeforeFinish',
  //       eventTime: 10,
  //       eventAction: () => {
  //         setBgStyle(flashRedStyle);
  //       }
  //     },
  //     {
  //       eventName: 'finish',
  //       eventTime: 0,
  //       eventAction: () => {
  //         setIsTimerActive(false);
  //         setStageText('נגמר הזמן!');
  //       },
  //       button: {
  //         text: 'סיום',
  //         handleClick: () => {
  //           Router.back();
  //         }
  //       }
  //     }
  //   ];
  // }, []);

  return (
    <>
      <div className="root" style={bgStyle}>
        <Paper
          sx={{
            py: 4,
            px: 2,
            textAlign: 'center',
            width: '90%',
            maxWidth: 720
          }}
          style={{
            background: barColor ? `linear-gradient(to bottom, ${barColor} 5%, #fff 5%)` : '#fff'
          }}
        >
          <Coundown variant="h1" targetDate={endTime.toDate()} />
          <Typography variant="h2" fontSize="4rem" fontWeight={400} gutterBottom>
            {stageText}
          </Typography>
          <Typography variant="h4" fontSize="1.5rem" fontWeight={400} gutterBottom>
            ברוכים הבאים קבוצת {team.name} #{team.number} מ{team.affiliation.institution},{' '}
            {team.affiliation.city}
          </Typography>
          <Typography variant="body1" fontSize="1rem" fontWeight={300} gutterBottom>
            מפגש השיפוט יסתיים בשעה{endTime.format('HH:mm')}
          </Typography>
        </Paper>
      </div>
      {/* <style jsx>{`
        .root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        @keyframes breathing-flash-animation {
          from {
            background-color: #ffa99f;
          }
          to {
            background-color: #fff;
          }
        }
      `}</style> */}
    </>
  );
};

export default JudgingTimer;
