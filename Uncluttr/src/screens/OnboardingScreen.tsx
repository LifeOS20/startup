import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { lifeOSAI } from '../lib/ai-service';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  aiTip?: string;
}

const OnboardingScreen = () => {
  const [slides, setSlides] = useState<OnboardingSlide[]>([
    {
      id: '1',
      title: 'Welcome to LifeOS',
      description: 'Your personal CEO for life management. Organize, optimize, and orchestrate all aspects of your life in one place.',
      image: '🚀',
    },
    {
      id: '2',
      title: 'Holistic Integration',
      description: 'Manage your health, finances, schedule, family, and smart home from a single dashboard.',
      image: '🔄',
    },
    {
      id: '3',
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations and insights to optimize your daily life and prevent burnout.',
      image: '🧠',
    },
    {
      id: '4',
      title: 'Privacy First',
      description: 'Your sensitive data stays on your device with local processing for maximum privacy and security.',
      image: '🔒',
    },
    {
      id: '5',
      title: 'Ready to Start?',
      description: 'Take control of your life with LifeOS - your personal life operating system.',
      image: '✨',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuthStore();

  // Generate AI tips for each slide on component mount
  useEffect(() => {
    generateAITips();
  }, []);

  const generateAITips = async () => {
    setIsLoadingTips(true);
    try {
      const updatedSlides = [...slides];

      // Generate tips for each slide
      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        const prompt = `Generate a brief, helpful tip related to the following onboarding slide for a personal life management app:
        
        Slide Title: ${slide.title}
        Slide Description: ${slide.description}
        
        Provide a concise, practical tip that enhances the user's understanding of this feature or concept. Keep it under 100 characters.`;

        try {
          const tip = await lifeOSAI.generateText ? await lifeOSAI.generateText(prompt, 100) : getDefaultTip(i);
          updatedSlides[i] = {
            ...slide,
            aiTip: tip || getDefaultTip(i),
          };
        } catch (error) {
          console.error(`Failed to generate tip for slide ${i}:`, error);
          updatedSlides[i] = {
            ...slide,
            aiTip: getDefaultTip(i),
          };
        }
      }

      setSlides(updatedSlides);
    } catch (error) {
      console.error('Failed to generate AI tips:', error);
    } finally {
      setIsLoadingTips(false);
    }
  };

  const getDefaultTip = (index: number): string => {
    const defaultTips = [
      'Set up your profile completely for personalized recommendations.',
      'Connect your health and finance apps for better insights.',
      'Enable notifications to get timely AI insights.',
      'Review privacy settings regularly to maintain control.',
      'Start with one area of focus and gradually expand.',
    ];
    return defaultTips[index] || defaultTips[0];
  };

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={slides}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.image}>{item.image}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            {isLoadingTips ? (
              <View style={styles.tipContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.tipLoadingText}>Generating tip...</Text>
              </View>
            ) : item.aiTip ? (
              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>AI Tip:</Text>
                <Text style={styles.tipText}>{item.aiTip}</Text>
              </View>
            ) : null}
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={flatListRef}
      />

      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index ? styles.activeIndicator : null,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={() => completeOnboarding()}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListContainer: {
    flex: 3,
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 40,
  },
  image: {
    fontSize: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginHorizontal: 5,
    opacity: 0.3,
  },
  activeIndicator: {
    opacity: 1,
    backgroundColor: '#007AFF',
  },
  buttonContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#6c757d',
    fontSize: 16,
  },
  tipContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    maxWidth: width - 40,
  },
  tipTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#343a40',
  },
  tipText: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  tipLoadingText: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 8,
  },
});

export default OnboardingScreen;