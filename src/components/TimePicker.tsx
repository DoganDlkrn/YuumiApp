import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hours: number;
  minutes: number;
  onChangeHours: (hours: number) => void;
  onChangeMinutes: (minutes: number) => void;
  isToday: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
  isToday
}) => {
  const { t } = useLanguage();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Generate time picker options
  const generateHourOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      // If it's today, only show hours from current hour onwards
      if (isToday && i < currentHour) continue;
      
      options.push(
        <TouchableOpacity
          key={`hour-${i}`}
          style={[
            styles.timeOption,
            hours === i && styles.selectedTimeOption
          ]}
          onPress={() => onChangeHours(i)}
        >
          <Text style={[
            styles.timeOptionText,
            hours === i && styles.selectedTimeOptionText
          ]}>
            {i.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += 5) {
      // If it's today and current hour, only show minutes from current minute onwards
      if (isToday && hours === currentHour && i < currentMinute) continue;
      
      options.push(
        <TouchableOpacity
          key={`minute-${i}`}
          style={[
            styles.timeOption,
            minutes === i && styles.selectedTimeOption
          ]}
          onPress={() => onChangeMinutes(i)}
        >
          <Text style={[
            styles.timeOptionText,
            minutes === i && styles.selectedTimeOptionText
          ]}>
            {i.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }
    return options;
  };

  const isTimeValid = () => {
    if (!isToday) return true;
    
    if (hours > currentHour) return true;
    if (hours === currentHour && minutes >= currentMinute) return true;
    
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('time.select')}</Text>
            <Text style={styles.modalSubtitle}>{t('delivery.time.select')}</Text>
          </View>
          
          <View style={styles.timePickerContent}>
            <View style={styles.timePickerColumns}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>{t('hour')}</Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timeOptionsContainer}
                >
                  {generateHourOptions()}
                </ScrollView>
              </View>
              
              <Text style={styles.timePickerSeparator}>:</Text>
              
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>{t('minute')}</Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timeOptionsContainer}
                >
                  {generateMinuteOptions()}
                </ScrollView>
              </View>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isTimeValid() && styles.disabledButton
              ]}
              onPress={onConfirm}
              disabled={!isTimeValid()}
            >
              <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timePickerContent: {
    padding: 15,
  },
  timePickerColumns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerColumn: {
    alignItems: 'center',
    width: 70,
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  timeOptionsContainer: {
    paddingVertical: 10,
  },
  timeOption: {
    padding: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 25,
  },
  selectedTimeOption: {
    backgroundColor: '#00B2FF',
  },
  timeOptionText: {
    fontSize: 16,
  },
  selectedTimeOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#eee',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  confirmButtonText: {
    color: '#00B2FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TimePicker; 