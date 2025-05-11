import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

// This component extends TouchableOpacity but removes the visual feedback effect
// by setting activeOpacity to 1.0 (completely opaque, no dimming)
type TouchableWithoutFeedbackProps = TouchableOpacityProps & {
  // Any additional props specific to this component can be added here
};

const TouchableWithoutFeedback: React.FC<TouchableWithoutFeedbackProps> = ({
  children,
  activeOpacity = 1.0, // Override any provided activeOpacity to ensure no feedback
  ...restProps
}) => {
  return (
    <TouchableOpacity
      activeOpacity={1.0}
      {...restProps}
    >
      {children}
    </TouchableOpacity>
  );
};

export default TouchableWithoutFeedback; 