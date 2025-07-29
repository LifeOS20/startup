import React from 'react';
import { Text } from 'react-native';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  const getIcon = (routeName: string) => {
    switch (routeName) {
      case 'Dashboard':
        return '🏠';
      case 'Health':
        return '❤️';
      case 'Finance':
        return '💰';
      case 'Schedule':
        return '📅';
      case 'Family':
        return '👨‍👩‍👧‍👦';
      case 'SmartHome':
        return '🏡';
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {getIcon(route.name)}
    </Text>
  );
};

export default TabBarIcon; 