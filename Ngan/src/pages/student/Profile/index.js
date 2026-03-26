import { Tabs } from 'antd';
import ProfileOverview from './ProfileOverview';
import ProfileLearning from './ProfileLearning';
function Profile(){
    const items = [
    {
      key: "1",
      label: "Overview",
      children: <ProfileOverview />,
    },
    {
      key: "2",
      label: "Learning",
      children: <ProfileLearning/>,
    },
  ];
  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  );
}
export default Profile;