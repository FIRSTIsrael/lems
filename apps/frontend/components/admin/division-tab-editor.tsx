import { WithId } from 'mongodb';
import { TabContext, TabPanel } from '../general/tab-managment';
import { Paper, Tabs, Tab } from '@mui/material';
import { FllEvent, Division, AwardSchema } from '@lems/types';
import DivisionAwardEditor from './division-award-editor';
import DivisionOutlineEditor from './division-outline-editor';
import DivisionScheduleEditor from './division-schedule-editor';
import { useQueryParam } from '../../hooks/use-query-param';
import { useTranslations } from 'next-intl';

interface DivisionTabEditorProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
  awardSchema: AwardSchema;
}

const DivisionTabEditor: React.FC<DivisionTabEditorProps> = ({ event, division, awardSchema }) => {
  const t = useTranslations('components:admin:division-tab-editor');
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');

  return (
    <TabContext value={activeTab}>
      <Paper sx={{ mt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, newValue: string) => setActiveTab(newValue)}
          centered
        >
          <Tab label={t('schedule')} value="1" />
          <Tab label={t('outline')} value="2" />
          <Tab label={t('awards')} value="3" />
        </Tabs>
      </Paper>
      <TabPanel value="1">
        <DivisionScheduleEditor event={event} division={division} />
      </TabPanel>
      <TabPanel value="2">
        <DivisionOutlineEditor event={event} division={division} />
      </TabPanel>
      <TabPanel value="3">
        <DivisionAwardEditor divisionId={division._id} awardSchema={awardSchema} />
      </TabPanel>
    </TabContext>
  );
};

export default DivisionTabEditor;
