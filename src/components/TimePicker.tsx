import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
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

  // Generate hours array (0-23)
  const getValidHours = () => {
    const hoursArray = [];
    for (let i = 0; i < 24; i++) {
      if (isToday && i < currentHour) continue;
      hoursArray.push(i);
    }
    return hoursArray;
  };

  // Generate minutes array (0-59, increment by 5)
  const getValidMinutes = () => {
    const mins = [];
    for (let i = 0; i < 60; i += 5) {
      if (isToday && hours === currentHour && i < currentMinute) continue;
      mins.push(i);
    }
    return mins;
  };

  const validHours = getValidHours();
  const validMinutes = getValidMinutes();

  const isTimeValid = () => {
    if (!isToday) return true;
    if (hours > currentHour) return true;
    if (hours === currentHour && minutes >= currentMinute) return true;
    return false;
  };

  const renderHourOptions = () => {
    return validHours.map((hour) => (
      <TouchableOpacity
        key={hour}
        style={[
          styles.timeOption,
          hours === hour && styles.selectedTimeOption
        ]}
        onPress={() => onChangeHours(hour)}
      >
        <Text style={[
          styles.timeOptionText,
          hours === hour && styles.selectedTimeOptionText
        ]}>
          {hour.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderMinuteOptions = () => {
    return validMinutes.map((minute) => (
      <TouchableOpacity
        key={minute}
        style={[
          styles.timeOption,
          minutes === minute && styles.selectedTimeOption
        ]}
        onPress={() => onChangeMinutes(minute)}
      >
        <Text style={[
          styles.timeOptionText,
          minutes === minute && styles.selectedTimeOptionText
        ]}>
          {minute.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    ));
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
            <Text style={styles.modalTitle}>Saat Seçin</Text>
            <Text style={styles.modalSubtitle}>
              {isToday ? 'Bugün için teslimat saati' : 'Teslimat saati'}
            </Text>
          </View>
          
          <View style={styles.timePickerContainer}>
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplay}>
                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
              </Text>
            </View>
            
            <View style={styles.pickersRow}>
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Saat</Text>
                <ScrollView 
                  style={styles.optionsContainer}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.optionsContent}
                >
                  {renderHourOptions()}
                </ScrollView>
              </View>
              
              <View style={styles.pickerDivider}>
                <Text style={styles.pickerDividerText}>:</Text>
              </View>
              
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Dakika</Text>
                <ScrollView 
                  style={styles.optionsContainer}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.optionsContent}
                >
                  {renderMinuteOptions()}
                </ScrollView>
              </View>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isTimeValid() && styles.disabledButton
              ]}
              onPress={onConfirm}
              disabled={!isTimeValid()}
            >
              <Text style={styles.confirmButtonText}>Onayla</Text>
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timePickerContainer: {
    padding: 20,
  },
  timeDisplayContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: '300',
    color: '#00B2FF',
  },
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pickerSection: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  pickerDivider: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    paddingTop: 35,
  },
  pickerDividerText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#ccc',
  },
  optionsContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionsContent: {
    padding: 5,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  selectedTimeOption: {
    backgroundColor: '#00B2FF',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 0.5,
    borderLeftColor: '#f0f0f0',
  },
  confirmButtonText: {
    color: '#00B2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TimePicker; 