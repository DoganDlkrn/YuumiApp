
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

// OpenAI API anahtarı - güvenlik için environment variable kullanın
const OPENAI_API_KEY = '';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Restaurant {
  id: string;
  isim?: string;
  name?: string;
  kategori?: string;
  category?: string;
  menu?: MenuItem[];
  items?: MenuItem[];
}

interface MenuItem {
  id: string;
  isim?: string;
  name?: string;
  fiyat?: number;
  price?: number;
  aciklama?: string;
  description?: string;
}

interface AiChefBotProps {
  visible: boolean;
  restaurants: Restaurant[];
  onClose: () => void;
  onAddToCart?: (restaurantId: string, restaurantName: string, itemId: string, itemName: string, quantity?: number) => void;
}

const AiChefBot: React.FC<AiChefBotProps> = ({
  visible,
  restaurants,
  onClose,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedRestaurant, setFocusedRestaurant] = useState<Restaurant | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (visible) {
      // İlk açılış mesajı
      setMessages([
        {
          role: 'assistant',
          content: 'Merhaba! Ben Yuumi AI Chef. Bugün ne yemek istersin? Sana restoranlarımızdan harika önerilerde bulunabilirim.'
        }
      ]);
    }
  }, [visible]);

  // OpenAI API çağrısı
  const callOpenAI = async (messages: Message[]): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Üzgünüm, bir yanıt oluşturamadım.';
    } catch (error) {
      console.error('OpenAI API Hatası:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let systemMessage = '';
      
      if (focusedRestaurant) {
        // Spesifik restoran odaklı sistem mesajı
        const menuItems = (focusedRestaurant.menu || focusedRestaurant.items || [])
          .map(item => `- ${item.isim || item.name} ${item.aciklama || item.description ? '(' + (item.aciklama || item.description) + ')' : ''}`)
          .join('\n');
        
        systemMessage = `Sen Yuumi AI Chef adında yardımsever bir yemek asistanısın. 
Kullanıcı şu anda "${focusedRestaurant.isim || focusedRestaurant.name}" restoranı hakkında konuşuyor.

RESTORAN BİLGİSİ:
Restoran: ${focusedRestaurant.isim || focusedRestaurant.name}
Kategori: ${focusedRestaurant.kategori || focusedRestaurant.category}
Menü:
${menuItems || 'Menü bilgisi mevcut değil'}

Görevlerin:
1. Kullanıcının yemek isteğini analiz et
2. Bu restoranın menüsünden uygun önerilerde bulun
3. Kullanıcı bir yemeği sepete eklemek isterse, "SEPETE_EKLE: [Yemek Adı]" formatında yanıt ver
4. Asla fiyat bilgisi verme
5. Samimi ve yardımsever ol`;
      } else {
        // Genel sistem mesajı
        const restaurantOverview = restaurants.map(r => 
          `${r.isim || r.name} (${r.kategori || r.category})`
        ).join(', ');
        
        systemMessage = `Sen Yuumi AI Chef adında yardımsever bir yemek asistanısın.

MEVCUT RESTORANLAR: ${restaurantOverview}

Görevlerin:
1. Kullanıcının yemek isteğini analiz et
2. Uygun restoranları öner
3. Kullanıcı bir restoran seçerse, o restorana odaklan
4. Samimi ve yardımsever ol
5. Asla fiyat bilgisi verme`;
      }

      const apiMessages: Message[] = [
        { role: 'system', content: systemMessage },
        ...messages.filter(msg => msg.role !== 'system'),
        newUserMessage
      ];

      const response = await callOpenAI(apiMessages);
      
      // Sepete ekleme komutunu kontrol et
      if (response.includes('SEPETE_EKLE:')) {
        const itemName = response.split('SEPETE_EKLE:')[1]?.trim();
        if (itemName && focusedRestaurant && onAddToCart) {
          // Menüden ürünü bul
          const menuItems = focusedRestaurant.menu || focusedRestaurant.items || [];
          const foundItem = menuItems.find(item => 
            (item.isim || item.name)?.toLowerCase().includes(itemName.toLowerCase())
          );
          
          if (foundItem) {
            onAddToCart(
              focusedRestaurant.id,
              focusedRestaurant.isim || focusedRestaurant.name || '',
              foundItem.id,
              foundItem.isim || foundItem.name || '',
              1
            );
            
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `${foundItem.isim || foundItem.name} sepetine eklendi! Başka bir isteğin var mı? 😊`
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Üzgünüm, bu ürünü menüde bulamadım. Lütfen menüdeki ürünlerden birini seçin.'
            }]);
          }
        }
      } else {
        // Normal yanıt
        const cleanResponse = response.replace(/SEPETE_EKLE:.*$/g, '').trim();
        setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
        
        // Restoran odaklanma kontrolü
        if (!focusedRestaurant) {
          const mentionedRestaurant = restaurants.find(r => 
            cleanResponse.toLowerCase().includes((r.isim || r.name || '').toLowerCase())
          );
          if (mentionedRestaurant) {
            setFocusedRestaurant(mentionedRestaurant);
          }
        }
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.'
      }]);
    }

    setIsLoading(false);
  };

  const resetChat = () => {
    setFocusedRestaurant(null);
    setMessages([
      {
        role: 'assistant',
        content: 'Merhaba! Ben Yuumi AI Chef. Bugün ne yemek istersin? Sana restoranlarımızdan harika önerilerde bulunabilirim.'
      }
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" translucent={false} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        {/* Header */}
        <View style={[styles.header, {width: '100%'}]}>
          <Text style={styles.headerTitle}>Yuumi AI Chef</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Focused Restaurant Info */}
        {focusedRestaurant && (
          <View style={styles.focusedRestaurantBar}>
            <Text style={styles.focusedRestaurantText}>
              📍 {focusedRestaurant.isim || focusedRestaurant.name}
            </Text>
            <TouchableOpacity 
              onPress={() => setFocusedRestaurant(null)}
              style={styles.clearFocusButton}
            >
              <Text style={styles.clearFocusButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.content}
              </Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#00B2FF" />
                <Text style={styles.typingText}>Düşünüyor...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ne yemek istersin?"
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#00B2FF',
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
  },
  statusBar: {
    backgroundColor: '#00B2FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  focusedRestaurantBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  focusedRestaurantText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  clearFocusButton: {
    padding: 4,
  },
  clearFocusButtonText: {
    fontSize: 14,
    color: '#1976D2',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 18,
  },
  userMessageText: {
    backgroundColor: '#00B2FF',
    color: '#fff',
  },
  assistantMessageText: {
    backgroundColor: '#fff',
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 25 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 120,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#00B2FF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AiChefBot; 