import json
from sentiment_service import MultilingualSentimentAnalyzer

def test_analyzer():
    analyzer = MultilingualSentimentAnalyzer()
    
    # Test cases with different scenarios
    test_conversations = [
        # Case 1: Refund Request (Hindi -> Malayalam -> Telugu)
        """Customer: मैं अपने ऑर्डर का रिफंड चाहता हूं, प्रोडक्ट काम नहीं कर रहा है।
Agent: ക്ഷമിക്കണം, താങ്കളുടെ അസൗകര്യത്തിന്. എന്താണ് പ്രശ്നം?
Customer: बटन टूट गया है और स्क्रीन भी खराब है।
Agent: സർ, ഞാൻ റീഫണ്ട് പ്രോസസ്സ് ചെയ്യാം.
Customer: ధన్యవాదాలు, ఎంత సమయం పడుతుంది?
Agent: 3-4 దినాలు పడుతుంది సార్.
Customer: ठीक है, धन्यवाद।""",

        # Case 2: Complex Technical Issue (Telugu -> Hindi -> Malayalam)
        """Customer: నా మొబైల్ యాప్ క్రాష్ అవుతోంది, డేటా అంతా పోయింది.
Agent: चिंता मत कीजिए, मैं आपकी मदद करूंगा। क्या आपने ऐप को अपडेट किया है?
Customer: అవును, అప్డేట్ చేశాను, కానీ ఇంకా సమస్య ఉంది.
Agent: വിശദമായി പരിശോധിക്കാം. ആപ്പ് ഡാറ്റ ക്ലിയർ ചെയ്യാമോ?
Customer: हां, मैं कोशिश करता हूं।
Agent: മികച്ചത്, ഇപ്പോൾ റീസ്റ്റാർട്ട് ചെയ്യൂ.
Customer: वाह! काम कर रहा है। बहुत बहुत धन्यवाद।""",

        # Case 3: Mixed Feedback (Malayalam -> Hindi -> Telugu)
        """Customer: സേവനം മെച്ചപ്പെടുത്തണം, വളരെ സമയം എടുക്കുന്നു.
Agent: आपकी प्रतिक्रिया के लिए धन्यवाद। हम सुधार करेंगे।
Customer: പക്ഷേ, ജീവനക്കാർ വളരെ സഹായകരമാണ്.
Agent: మీ అభిప్రాయానికి ధన్యవాదాలు, మేము మెరుగుపరుస్తాము.
Customer: सेवा अच्छी है लेकिन समय ज्यादा लगता है।
Agent: हम जल्द ही इसमें सुधार करेंगे।""",

        # Case 4: Service Recovery (Telugu -> Malayalam -> Hindi)
        """Customer: చాలా నిరాశగా ఉంది, రెండు వారాలుగా సమస్య పరిష్కారం కాలేదు.
Agent: വളരെ ക്ഷമിക്കണം. ഞാൻ പ്രശ്നം ഉടൻ പരിഹരിക്കാം.
Customer: ఎన్నిసార్లు ఇదే మాట వింటున్నాను.
Agent: इस बार मैं खुद देखूंगा कि समस्या हल हो जाए।
Customer: സത്യമാണോ? ഉറപ്പാണോ?
Agent: हां, मैं वादा करता हूं। अभी हल करता हूं।
Customer: അത്ഭുതം! പ്രശ്നം പരിഹരിച്ചു. വളരെ നന്ദി.""",

        # Case 5: Product Exchange (Hindi -> Telugu -> Malayalam)
        """Customer: मुझे प्रोडक्ट एक्सचेंज करना है, साइज़ छोटा है।
Agent: అవును సర్, మీ ఆర్డర్ నంబర్ చెప్పగలరా?
Customer: ऑर्डर नंबर 12345 है।
Agent: വലിപ്പം എന്താണ് വേണ്ടത്?
Customer: एक्स लार्ज चाहिए।
Agent: సరే, రిప్లేస్మెంట్ ప్రోసెస్ మొదలుపెడతాను.
Customer: കൈമാറ്റം എപ്പോൾ പൂർത്തിയാകും?
Agent: 5-7 दिनों में हो जाएगा।"""
    ]
    
    for i, conversation in enumerate(test_conversations, 1):
        print(f"\n{'='*20} Test Case {i} {'='*20}")
        print("\n=== Original Conversation ===")
        print(conversation)
        
        print("\n=== Translation ===")
        translated = analyzer.detect_and_translate(conversation)
        print("\nDebug Info:")
        print(analyzer.last_debug_info)
        print("\nTranslated Text:")
        print(translated)
        
        print("\n=== Sentiment Analysis ===")
        result = analyzer.analyze_sentiment(conversation)
        print("\nSentiment Analysis Result:")
        print(json.dumps(json.loads(result), indent=2))
        print("\n" + "="*50)

if __name__ == "__main__":
    test_analyzer() 