import sys
import json
import numpy as np
import re
from collections import Counter, defaultdict
import statistics
import random
import torch

try:
    from textblob import TextBlob
except ImportError:
    print(json.dumps({
        "error": "TextBlob not installed",
        "sentiment": "neutral",
        "score": 0,
        "emotional_journey": {"start": 0, "end": 0, "fluctuation": 0, "trend": "neutral"},
        "confidence": 0
    }))
    sys.exit(1)

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
except ImportError:
    print(json.dumps({
        "error": "VADER Sentiment not installed",
        "sentiment": "neutral",
        "score": 0,
        "emotional_journey": {"start": 0, "end": 0, "fluctuation": 0, "trend": "neutral"},
        "confidence": 0
    }))
    sys.exit(1)

try:
    from translate import Translator
except ImportError:
    print(json.dumps({
        "error": "Translate not installed",
        "sentiment": "neutral",
        "score": 0,
        "emotional_journey": {"start": 0, "end": 0, "fluctuation": 0, "trend": "neutral"},
        "confidence": 0
    }))
    sys.exit(1)

# Set global seeds at the start of the analysis
def set_seeds():
    SEED = 42
    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(SEED)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

class MultilingualSentimentAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
    def detect_and_translate(self, text):
        try:
            # Split text into lines
            lines = text.split('\n')
            translated_lines = []
            debug_info = []
            
            for line in lines:
                if not line.strip():
                    translated_lines.append(line)
                    continue
                
                try:
                    # Extract speaker prefix if present
                    prefix = ""
                    if line.startswith(("Customer:", "Agent:")):
                        prefix = line.split(":")[0] + ": "
                        content = ":".join(line.split(":")[1:]).strip()
                    else:
                        content = line.strip()
                    
                    # Try to detect script and translate accordingly
                    if any('\u0900' <= c <= '\u097F' for c in content):  # Devanagari (Hindi)
                        lang = 'hi'
                    elif any('\u0C00' <= c <= '\u0C7F' for c in content):  # Telugu
                        lang = 'te'
                    elif any('\u0D00' <= c <= '\u0D7F' for c in content):  # Malayalam
                        lang = 'ml'
                    else:
                        translated_lines.append(line)
                        continue
                    
                    try:
                        translator = Translator(to_lang="en", from_lang=lang)
                        translated = translator.translate(content)
                        if translated and not translated.startswith("MYMEMORY WARNING"):
                            translated_lines.append(prefix + translated)
                            debug_info.append(f"DEBUG: Translated from {lang}: {content} -> {translated}")
                        else:
                            translated_lines.append(line)
                    except Exception as e:
                        debug_info.append(f"DEBUG: Translation error for language {lang}: {str(e)}")
                        translated_lines.append(line)
                        
                except Exception as e:
                    debug_info.append(f"DEBUG: Line processing error: {line}, Error: {str(e)}")
                    translated_lines.append(line)
            
            result = '\n'.join(translated_lines)
            debug_info.append(f"DEBUG: Final translated text: {result}")
            
            # Store debug info in instance variable for testing
            self.last_debug_info = '\n'.join(debug_info)
            return result
        except Exception as e:
            self.last_debug_info = f"DEBUG: Overall translation error: {str(e)}"
            return text
    
    def clean_text(self, text):
        if not text or not isinstance(text, str):
            return ""
        # Remove special characters but keep Devanagari and other Indian script characters
        text = re.sub(r'[^\w\s\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]', '', text)
        return text.strip()
    
    def analyze_emotional_journey(self, text):
        if not text:
            return self._get_default_journey()
            
        # Enhanced sentence splitting with support for multiple languages and punctuation
        sentences = [s.strip() for s in re.split(r'[।.!?\n]+', text) if s.strip()]
        if not sentences:
            return self._get_default_journey()
            
        emotional_scores = []
        emotional_states = []
        speaker_emotions = {'Customer': [], 'Agent': []}
        current_speaker = 'Customer'  # Default speaker
        
        # Enhanced contextual analysis
        context_window = []
        window_size = 3  # Context window size
        
        for i, sentence in enumerate(sentences):
            # Speaker detection with improved accuracy
            if any(marker in sentence.lower() for marker in ['agent:', 'customer:', 'representative:', 'client:']):
                current_speaker = next(
                    speaker for speaker in ['Agent', 'Customer'] 
                    if any(marker in sentence.lower() for marker in [f'{speaker.lower()}:', f'{speaker.lower()} :'])
                )
                sentence = ':'.join(sentence.split(':')[1:])
            
            # Multi-component sentiment analysis
            vader_scores = self.analyzer.polarity_scores(sentence)
            blob_analysis = TextBlob(sentence)
            
            # Calculate weighted compound score with contextual adjustment
            compound_score = self._calculate_contextual_score(
                vader_scores['compound'],
                blob_analysis.sentiment.polarity,
                context_window,
                current_speaker,
                i,
                len(sentences)
            )
            
            # Update context window
            context_window.append({
                'score': compound_score,
                'speaker': current_speaker,
                'position': i / len(sentences)
            })
            if len(context_window) > window_size:
                context_window.pop(0)
            
            emotional_scores.append(compound_score)
            state = self._get_detailed_emotional_state(compound_score, vader_scores)
            emotional_states.append(state)
            speaker_emotions[current_speaker].append(compound_score)

        # Calculate advanced metrics
        start_score = self._calculate_initial_sentiment(emotional_scores[:3])
        end_score = self._calculate_final_sentiment(emotional_scores[-3:])
        trend_strength = self._calculate_trend_strength(emotional_scores)
        stability = self._calculate_emotional_stability(emotional_scores)
        
        return {
            'start': {
                'score': round(start_score, 3),
                'state': self._get_detailed_emotional_state(start_score, None)
            },
            'end': {
                'score': round(end_score, 3),
                'state': self._get_detailed_emotional_state(end_score, None)
            },
            'fluctuation': round(self._calculate_fluctuation(emotional_scores), 3),
            'stability': round(stability * 100, 3),
            'trend': {
                'direction': self._get_enhanced_trend_direction(emotional_scores),
                'strength': round(trend_strength * 100, 3)
            },
            'dominant_emotion': self._calculate_dominant_emotion(emotional_states, emotional_scores),
            'emotional_range': {
                'min': round(min(emotional_scores), 3),
                'max': round(max(emotional_scores), 3)
            }
        }
    
    def _calculate_contextual_score(self, vader_compound, textblob_polarity, context_window, speaker, position, total_length):
        """Enhanced contextual score calculation"""
        # Base score calculation with enhanced weighting
        base_score = vader_compound * 0.7 + textblob_polarity * 0.3
        
        # Context influence with dynamic weighting
        if context_window:
            context_influence = sum(c['score'] for c in context_window) / len(context_window)
            # Dynamic context weight based on emotional contrast
            contrast = abs(base_score - context_influence)
            context_weight = max(0.1, 0.4 - contrast * 0.5)  # Reduces weight for high contrast
            base_score = base_score * (1 - context_weight) + context_influence * context_weight
        
        # Enhanced position-based adjustment
        position_ratio = position / total_length
        if position_ratio < 0.2:  # Opening statements
            intensity_factor = 1.0 + (0.2 - position_ratio)  # Stronger effect at very start
            base_score *= intensity_factor  # Amplify initial emotions more precisely
        elif position_ratio > 0.8:  # Closing statements
            intensity_factor = 1.0 + (position_ratio - 0.8)  # Stronger effect at very end
            base_score *= intensity_factor  # Amplify final emotions more precisely
        
        # Enhanced speaker-based adjustment
        if speaker == 'Customer':
            # Amplify customer emotions more at the start and end
            if position_ratio < 0.2 or position_ratio > 0.8:
                base_score *= 1.2
            else:
                base_score *= 1.1
        
        # Ensure score stays within bounds while preserving relative intensity
        return max(min(base_score, 1.0), -1.0)
    
    def _calculate_initial_sentiment(self, initial_scores):
        """Calculate more accurate initial sentiment with enhanced weighting"""
        if not initial_scores:
            return 0
        
        # Dynamic weights based on score intensity
        weights = []
        for i, score in enumerate(initial_scores[:3]):
            # Higher weight for more intense emotions
            intensity_factor = 1 + abs(score) * 0.5
            base_weight = [0.6, 0.3, 0.1][i]  # Base weights for first three sentences
            weights.append(base_weight * intensity_factor)
        
        # Normalize weights
        total_weight = sum(weights)
        weights = [w/total_weight for w in weights]
        
        weighted_sum = sum(score * weight for score, weight in zip(initial_scores, weights))
        return weighted_sum
    
    def _calculate_final_sentiment(self, final_scores):
        """Calculate more accurate final sentiment with enhanced weighting"""
        if not final_scores:
            return 0
        
        # Dynamic weights based on score intensity and position
        weights = []
        for i, score in enumerate(reversed(final_scores[-3:])):
            # Higher weight for more intense emotions
            intensity_factor = 1 + abs(score) * 0.5
            base_weight = [0.6, 0.3, 0.1][i]  # Base weights for last three sentences
            weights.append(base_weight * intensity_factor)
        
        # Normalize weights
        total_weight = sum(weights)
        weights = [w/total_weight for w in weights]
        weights.reverse()  # Reverse back to match sentence order
        
        weighted_sum = sum(score * weight for score, weight in zip(final_scores[-3:], weights))
        return weighted_sum
    
    def _calculate_trend_strength(self, scores):
        """Calculate trend strength with improved accuracy"""
        if len(scores) < 2:
            return 0
        
        # Use linear regression to calculate trend
        x = np.array(range(len(scores)))
        y = np.array(scores)
        slope, _ = np.polyfit(x, y, 1)
        
        # Normalize slope to 0-1 range
        return abs(np.tanh(slope * 3))
    
    def _calculate_emotional_stability(self, scores):
        """Calculate emotional stability with improved metrics"""
        if len(scores) < 2:
            return 1.0
        
        # Calculate both variance and rate of change
        variance = np.var(scores)
        changes = np.diff(scores)
        rate_of_change = np.mean(np.abs(changes))
        
        # Combine metrics
        stability = 1.0 - (variance * 0.5 + rate_of_change * 0.5)
        return max(0.0, min(1.0, stability))
    
    def _calculate_fluctuation(self, scores):
        """Calculate emotional fluctuation with enhanced accuracy"""
        if len(scores) < 2:
            return 0
        
        # Consider both standard deviation and peak-to-peak variation
        std_dev = np.std(scores)
        peak_to_peak = max(scores) - min(scores)
        
        return (std_dev * 0.7 + peak_to_peak * 0.3)
    
    def _get_enhanced_trend_direction(self, scores):
        """Determine trend direction with improved accuracy"""
        if len(scores) < 2:
            return 'stable'
        
        # Calculate moving averages
        window_size = min(3, len(scores))
        start_avg = np.mean(scores[:window_size])
        end_avg = np.mean(scores[-window_size:])
        
        # Calculate trend significance threshold
        threshold = 0.1 * np.std(scores) + 0.05
        
        diff = end_avg - start_avg
        if abs(diff) < threshold:
            return 'stable'
        return 'improving' if diff > 0 else 'declining'
    
    def _get_detailed_emotional_state(self, compound_score, detailed_scores):
        if compound_score >= 0.75:
            return 'extremely positive'
        elif compound_score >= 0.5:
            return 'very positive'
        elif compound_score >= 0.25:
            return 'moderately positive'
        elif compound_score >= 0.1:
            return 'slightly positive'
        elif compound_score <= -0.75:
            return 'extremely negative'
        elif compound_score <= -0.5:
            return 'very negative'
        elif compound_score <= -0.25:
            return 'moderately negative'
        elif compound_score <= -0.1:
            return 'slightly negative'
        else:
            if detailed_scores is not None and detailed_scores.get('neu', 0) > 0.8:
                return 'factual'
            return 'neutral'
    
    def _get_trend_direction(self, scores):
        if len(scores) < 2:
            return 'stable'
        
        # Calculate moving average
        window_size = min(3, len(scores))
        start_avg = statistics.mean(scores[:window_size])
        end_avg = statistics.mean(scores[-window_size:])
        
        diff = end_avg - start_avg
        if abs(diff) < 0.1:
            return 'stable'
        elif diff > 0:
            return 'improving'
        else:
            return 'declining'
    
    def _get_default_journey(self):
        return {
            'start': {'score': 0, 'state': 'neutral'},
            'end': {'score': 0, 'state': 'neutral'},
            'fluctuation': 0,
            'stability': 100,
            'trend': {
                'direction': 'stable',
                'strength': 0
            },
            'dominant_emotion': 'neutral',
            'emotional_range': {
                'min': 0,
                'max': 0
            }
        }
    
    def _get_emotional_state(self, compound_score, detailed_scores=None):
        """
        Determine emotional state based on compound score with more granular classification
        """
        if detailed_scores is None:
            detailed_scores = {'neu': 0}

        # More granular emotional state classification
        if compound_score >= 0.75:
            return "extremely positive"
        elif compound_score >= 0.5:
            return "very positive"
        elif compound_score >= 0.25:
            return "moderately positive"
        elif compound_score >= 0.1:
            return "slightly positive"
        elif compound_score <= -0.75:
            return "extremely negative"
        elif compound_score <= -0.5:
            return "very negative"
        elif compound_score <= -0.25:
            return "moderately negative"
        elif compound_score <= -0.1:
            return "slightly negative"
        else:
            # For neutral scores, differentiate between truly neutral and mixed
            if detailed_scores.get('neu', 0) > 0.8:
                return "neutral"
            return "mixed"
    
    def analyze_sentiment(self, text):
        set_seeds()  # Add this line first
        
        try:
            if not text or not isinstance(text, str):
                return json.dumps({
                    "error": "No text provided or invalid input type",
                    "sentiment": "neutral",
                    "score": 0.000,
                    "emotional_journey": self._get_default_journey(),
                    "confidence": 0.000
                })
            
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return json.dumps({
                    "error": "Text is empty after cleaning",
                    "sentiment": "neutral",
                    "score": 0.000,
                    "emotional_journey": self._get_default_journey(),
                    "confidence": 0.000
                })
            
            english_text = self.detect_and_translate(cleaned_text)
            
            # Get emotional journey first
            emotional_journey = self.analyze_emotional_journey(english_text)
            
            # Calculate overall sentiment using VADER and TextBlob
            overall_vader = self.analyzer.polarity_scores(english_text)
            overall_textblob = TextBlob(english_text).sentiment
            
            # Enhanced weighted combination
            vader_weight = 0.7
            textblob_weight = 0.3
            
            # Calculate final score with context awareness
            final_score = (
                overall_vader['compound'] * vader_weight + 
                overall_textblob.polarity * textblob_weight
            ) * 100
            
            # Enhanced confidence calculation
            agreement = 1 - abs(overall_vader['compound'] - overall_textblob.polarity)
            emotional_coherence = 1 - abs(emotional_journey['start']['score'] - emotional_journey['end']['score']) / 2
            confidence = (agreement * 0.6 + emotional_coherence * 0.4) * 100
            
            result = {
                "sentiment": self._get_emotional_state(overall_vader['compound'], overall_vader),
                "score": round(final_score, 3),
                "emotional_journey": emotional_journey,
                "confidence": round(confidence, 3)
            }
            
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({
                "error": str(e),
                "sentiment": "neutral",
                "score": 0.000,
                "emotional_journey": self._get_default_journey(),
                "confidence": 0.000
            })
    
    def _get_dominant_emotion(self, scores):
        if not scores:
            return "neutral"
        
        emotions = [self._get_emotional_state(score) for score in scores]
        emotion_counts = Counter(emotions)
        return max(emotion_counts, key=emotion_counts.get)
    
    def _get_default_response(self):
        return {
            "sentiment": "neutral",
            "score": 0.000,
            "emotional_journey": {
                "start": {
                    "score": 0.000,
                    "state": "neutral"
                },
                "end": {
                    "score": 0.000,
                    "state": "neutral"
                },
                "fluctuation": 0.000,
                "stability": 100.000,
                "trend": {
                    "direction": "stable",
                    "strength": 0.000
                },
                "dominant_emotion": "neutral",
                "emotional_range": {
                    "min": 0.000,
                    "max": 0.000
                }
            },
            "confidence": 0.000
        }
    
    def _calculate_dominant_emotion(self, emotional_states, emotional_scores):
        """
        Calculate the dominant emotion with enhanced accuracy considering both states and scores
        """
        if not emotional_states or not emotional_scores:
            return "neutral"
        
        # Count emotional states
        emotion_counts = Counter(emotional_states)
        
        # Weight emotions by their intensity
        weighted_emotions = defaultdict(float)
        for state, score in zip(emotional_states, emotional_scores):
            weighted_emotions[state] += abs(score)  # Use absolute score as weight
        
        # Combine frequency and intensity
        final_weights = {}
        for emotion in emotion_counts:
            frequency_weight = emotion_counts[emotion] / len(emotional_states)
            intensity_weight = weighted_emotions[emotion] / sum(abs(s) for s in emotional_scores)
            final_weights[emotion] = frequency_weight * 0.6 + intensity_weight * 0.4
        
        # Get the emotion with highest combined weight
        if final_weights:
            dominant_emotion = max(final_weights.items(), key=lambda x: x[1])[0]
        else:
            dominant_emotion = "neutral"
        
        # Special case for mixed emotions
        if len(emotion_counts) > 2 and max(emotion_counts.values()) < len(emotional_states) * 0.4:
            return "mixed"
        
        return dominant_emotion

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            result = {
                "error": "No input text provided. Usage: python sentiment_service.py \"your text here\"",
                "sentiment": "neutral",
                "score": 0.000,
                "emotional_journey": MultilingualSentimentAnalyzer()._get_default_journey(),
                "confidence": 0.000
            }
        else:
            input_text = sys.argv[1]
            analyzer = MultilingualSentimentAnalyzer()
            result = analyzer.analyze_sentiment(input_text)
            
        # Ensure the result is JSON serializable
        if isinstance(result, str):
            print(result)  # Already JSON string
        else:
            print(json.dumps(result))
            
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "sentiment": "neutral",
            "score": 0.000,
            "emotional_journey": MultilingualSentimentAnalyzer()._get_default_journey(),
            "confidence": 0.000
        }))