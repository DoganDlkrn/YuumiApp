import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface YLogoProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const YLogo: React.FC<YLogoProps> = ({
  size = 100,
  color = '#00B2FF',
  style,
}) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Svg width={size * 0.7} height={size * 0.8} viewBox="0 0 100 120" fill="none">
        <Path
          d="M20 10 L50 55 L80 10 L100 10 L60 70 L60 110 L40 110 L40 70 L0 10 Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default YLogo; 