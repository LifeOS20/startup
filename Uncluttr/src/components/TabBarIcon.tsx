import React from 'react';
import { View } from 'react-native';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  const getIconShape = (routeName: string) => {
    const baseSize = size * 0.7;

    switch (routeName) {
      case 'Dashboard':
        return (
          <View style={{ position: 'relative' }}>
            {/* House shape */}
            <View style={{
              width: baseSize,
              height: baseSize * 0.6,
              backgroundColor: focused ? 'white' : color,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              marginTop: baseSize * 0.2,
            }} />
            <View style={{
              position: 'absolute',
              top: 0,
              left: baseSize * 0.1,
              width: 0,
              height: 0,
              borderLeftWidth: baseSize * 0.4,
              borderRightWidth: baseSize * 0.4,
              borderBottomWidth: baseSize * 0.3,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: focused ? 'white' : color,
            }} />
          </View>
        );
      case 'Health':
        return (
          <View style={{
            width: baseSize,
            height: baseSize,
            borderRadius: baseSize / 2,
            backgroundColor: focused ? 'white' : 'transparent',
            borderWidth: focused ? 0 : 2,
            borderColor: color,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: baseSize * 0.3,
              height: baseSize * 0.6,
              backgroundColor: focused ? color : color,
              borderRadius: 2,
              position: 'absolute',
            }} />
            <View style={{
              width: baseSize * 0.6,
              height: baseSize * 0.3,
              backgroundColor: focused ? color : color,
              borderRadius: 2,
              position: 'absolute',
            }} />
          </View>
        );
      case 'Finance':
        return (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={{
                  width: baseSize * 0.8,
                  height: baseSize * 0.2,
                  backgroundColor: focused ? 'white' : color,
                  marginVertical: 1,
                  borderRadius: 2,
                  opacity: focused ? 1 : (1 - index * 0.3),
                }}
              />
            ))}
          </View>
        );
      case 'Schedule':
        return (
          <View style={{
            width: baseSize,
            height: baseSize,
            backgroundColor: focused ? 'white' : 'transparent',
            borderWidth: focused ? 0 : 2,
            borderColor: color,
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: baseSize * 0.7,
              height: 2,
              backgroundColor: focused ? color : color,
              marginBottom: 3,
            }} />
            <View style={{
              width: baseSize * 0.5,
              height: 2,
              backgroundColor: focused ? color : color,
              marginBottom: 3,
            }} />
            <View style={{
              width: baseSize * 0.6,
              height: 2,
              backgroundColor: focused ? color : color,
            }} />
          </View>
        );
      case 'More':
        return (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={{
                  width: baseSize * 0.15,
                  height: baseSize * 0.15,
                  backgroundColor: focused ? 'white' : color,
                  borderRadius: (baseSize * 0.15) / 2,
                  marginVertical: 2,
                }}
              />
            ))}
          </View>
        );
      default:
        return (
          <View style={{
            width: baseSize,
            height: baseSize,
            borderRadius: baseSize / 2,
            backgroundColor: focused ? 'white' : color,
          }} />
        );
    }
  };

  return (
    <View style={{
      width: size + 12,
      height: size + 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: focused ? color : 'transparent',
      borderRadius: (size + 12) / 2,
      borderWidth: focused ? 0 : 1,
      borderColor: focused ? 'transparent' : `${color}20`,
    }}>
      {getIconShape(route.name)}
    </View>
  );
};

export default TabBarIcon; 