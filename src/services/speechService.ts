import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { AppLanguage } from '../types/user';
import { SeverityLevel } from '../types/inspection';

const SPEECH_PROMPTS = {
  en: {
    moveCloser: 'Move phone closer to the crack, approximately thirty centimeters away.',
    holdSteady: 'Hold steady. Calibrating millimeter focal scale.',
    turnOnFlash: 'Low light detected. Turn on flashlight for accurate analysis.',
    scanning: 'Scanning surface contour...',
    verdictLow: 'Scan complete. Minor surface distress. Structure is safe.',
    verdictMedium: 'Scan complete. Moderate crack detected. Chemical repair recommended.',
    verdictHigh: 'Warning! Critical structural fracture detected. Alerting municipal authorities.',
    joltDetected: 'Pothole impact detected. Geo-tagging infrastructure distress.',
  },
  ta: {
    moveCloser: 'கேமராவை விரிசலுக்கு அருகில் சுமார் முப்பது சென்டிமீட்டர் தொலைவில் பிடிக்கவும்.',
    holdSteady: 'அசையாமல் பிடிக்கவும். துல்லியத்தை கணக்கிடுகிறது.',
    turnOnFlash: 'ஒளி குறைவாக உள்ளது. பிளாஷ்லைட்டை இயக்கவும்.',
    scanning: 'கட்டமைப்பை ஆய்வு செய்கிறது...',
    verdictLow: 'ஆய்வு முடிந்தது. சிறிய விரிசல் மட்டுமே. கட்டமைப்பு பாதுகாப்பாக உள்ளது.',
    verdictMedium: 'ஆய்வு முடிந்தது. மிதமான விரிசல். சீரமைப்பு பரிந்துரைக்கப்படுகிறது.',
    verdictHigh: 'எச்சரிக்கை! ஆபத்தான தீவிர விரிசல் கண்டறியப்பட்டது. அதிகாரிகள் எச்சரிக்கப்படுகிறார்கள்.',
    joltDetected: 'சாலை பள்ளம் கண்டறியப்பட்டது. இருப்பிடம் பதிவு செய்யப்பட்டது.',
  },
  hi: {
    moveCloser: 'फोन को दरार के करीब, लगभग तीस सेंटीमीटर दूर लाएं।',
    holdSteady: 'स्थिर रखें। सतह का विश्लेषण किया जा रहा है।',
    turnOnFlash: 'प्रकाश कम है। टॉर्च चालू करें।',
    scanning: 'संरचना की जांच की जा रही है...',
    verdictLow: 'स्कैन पूर्ण। मामूली सतह दरार। संरचना सुरक्षित है।',
    verdictMedium: 'स्कैन पूर्ण। मध्यम दरार पाई गई। रासायनिक मरम्मत की सिफारिश की जाती है।',
    verdictHigh: 'चेतावनी! गंभीर दरार पाई गई है। आपातकालीन अधिकारियों को सतर्क किया जा रहा है।',
    joltDetected: 'गड्ढे का झटका महसूस हुआ। जियो-टैगिंग जारी है।',
  },
};

export const SpeechService = {
  getLanguageCode(lang: AppLanguage = 'en'): string {
    switch (lang) {
      case 'ta':
        return 'ta-IN';
      case 'hi':
        return 'hi-IN';
      default:
        return 'en-US';
    }
  },

  async speak(text: string, lang: AppLanguage = 'en', rate = 0.95): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = this.getLanguageCode(lang);
          utterance.rate = rate;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }

      await Speech.stop();
      Speech.speak(text, {
        language: this.getLanguageCode(lang),
        pitch: 1.0,
        rate: rate,
      });
    } catch (e) {
      console.warn('SpeechService.speak error:', e);
    }
  },

  async stop(): Promise<void> {
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        await Speech.stop();
      }
    } catch (e) {}
  },

  speakGuidance(
    cue: 'moveCloser' | 'holdSteady' | 'turnOnFlash' | 'scanning',
    lang: AppLanguage = 'en'
  ): void {
    const text = SPEECH_PROMPTS[lang]?.[cue] || SPEECH_PROMPTS.en[cue];
    this.speak(text, lang, 1.0);
  },

  speakVerdict(severity: SeverityLevel, lang: AppLanguage = 'en'): void {
    let text = SPEECH_PROMPTS[lang]?.verdictLow || SPEECH_PROMPTS.en.verdictLow;
    if (severity === 'MEDIUM') {
      text = SPEECH_PROMPTS[lang]?.verdictMedium || SPEECH_PROMPTS.en.verdictMedium;
    } else if (severity === 'HIGH') {
      text = SPEECH_PROMPTS[lang]?.verdictHigh || SPEECH_PROMPTS.en.verdictHigh;
    }
    this.speak(text, lang, 0.9);
  },

  speakJoltDetected(lang: AppLanguage = 'en'): void {
    const text = SPEECH_PROMPTS[lang]?.joltDetected || SPEECH_PROMPTS.en.joltDetected;
    this.speak(text, lang, 1.0);
  },
};
