import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

// TouchableWithoutFeedback bileşeni, TouchableOpacity'nin bir wrapper'ı
// activeOpacity değerini 1.0 olarak ayarlayarak dokunma geribildirimini kaldırır
interface TouchableWithoutFeedbackProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

const TouchableWithoutFeedback: React.FC<TouchableWithoutFeedbackProps> = ({
  children,
  activeOpacity = 1.0,
  ...rest
}) => {
  return (
    <TouchableOpacity activeOpacity={activeOpacity} {...rest}>
      {children}
    </TouchableOpacity>
  );
};

export default TouchableWithoutFeedback; 