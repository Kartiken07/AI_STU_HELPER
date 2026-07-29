import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, apiPost } from '../api/config';

// Types
interface QuizScores {
  aptitude_score: number;
  science_score: number;
  arts_score: number;
  commerce_score: number;
  interest_science: number;
  interest_arts: number;
  interest_commerce: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'aptitude' | 'science' | 'arts' | 'commerce';
}

// Interest Scale Component
const InterestScale: React.FC<{
  title: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ title, value, onChange }) => {
  const scaleStyle: React.CSSProperties = {
    marginBottom: '2rem'
  };

  const titleStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.1rem',
    marginBottom: '1rem',
    fontWeight: '500',
    textAlign: 'center'
  };

  const scaleContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap'
  };

  const scaleButtonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '2px solid #555',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const getSelectedStyle = (num: number) => ({
    ...scaleButtonStyle,
    backgroundColor: value === num ? '#3b82f6' : 'transparent',
    color: value === num ? 'white' : '#ccc',
    borderColor: value === num ? '#3b82f6' : '#555',
    transform: value === num ? 'scale(1.1)' : 'scale(1)'
  });

  return (
    <div style={scaleStyle}>
      <h4 style={titleStyle}>{title}</h4>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            style={getSelectedStyle(num)}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

// Question Item Component
const QuestionItem: React.FC<{
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (questionId: string, answerIndex: number) => void;
}> = ({ question, selectedAnswer, onAnswerSelect }) => {
  const questionStyle: React.CSSProperties = {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    borderRadius: '14px',
    border: '1px solid rgba(60, 120, 215, 0.25)',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: '100%',
    maxWidth: '100%',
    margin: '0 0 2rem 0'
  };

  const questionTextStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.1rem',
    marginBottom: '1rem',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '1.5'
  };

  const optionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center'
  };

  const optionButtonStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '10px',
    color: '#e5e7eb',
    cursor: 'pointer',
    fontSize: '1rem',
    textAlign: 'center',
    transition: 'all 0.25s ease'
  };

  const getSelectedOptionStyle = (index: number) => ({
    ...optionButtonStyle,
    backgroundColor: selectedAnswer === index ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.05)',
    borderColor: selectedAnswer === index ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.25)',
    color: selectedAnswer === index ? 'white' : '#e5e7eb',
    transform: selectedAnswer === index ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: selectedAnswer === index ? '0 8px 22px rgba(59, 130, 246, 0.25)' : 'none'
  });

  return (
    <div style={questionStyle}>
      <h4 style={questionTextStyle}>{question.question}</h4>
      <div style={optionsStyle}>
        {question.options.map((option, index) => (
          <button
            key={index}
            style={getSelectedOptionStyle(index)}
            onClick={() => onAnswerSelect(question.id, index)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Question Section Component
const QuestionSection: React.FC<{
  title: string;
  questions: Question[];
  selectedAnswers: { [questionId: string]: number };
  onAnswerSelect: (questionId: string, answerIndex: number) => void;
}> = ({ title, questions, selectedAnswers, onAnswerSelect }) => {
  const sectionStyle: React.CSSProperties = {
    marginBottom: '3rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
    borderRadius: '18px',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
    width: '100%',
    maxWidth: '100%',
    margin: '0 0 3rem 0'
  };

  const titleStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.5rem',
    marginBottom: '2rem',
    fontWeight: 'bold',
    borderBottom: '3px solid #3b82f6',
    paddingBottom: '0.5rem',
    textAlign: 'center'
  };

  return (
    <div style={sectionStyle}>
      <h3 style={titleStyle}>{title}</h3>
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          selectedAnswer={selectedAnswers[question.id] ?? null}
          onAnswerSelect={onAnswerSelect}
        />
      ))}
    </div>
  );
};

// Submit Button Component
const SubmitButton: React.FC<{
  onSubmit: () => void;
  isSubmitting: boolean;
}> = ({ onSubmit, isSubmitting }) => {
  const buttonStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    display: 'block',
    padding: '1.2rem 2rem',
    background: isSubmitting ? 'linear-gradient(135deg, #4b5563, #374151)' : 'linear-gradient(135deg, #3b82f6, #10b981)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: isSubmitting ? 0.7 : 1,
    transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
    boxShadow: isSubmitting ? 'none' : '0 10px 28px rgba(59, 130, 246, 0.35)'
  };

  return (
    <button
      style={buttonStyle}
      onClick={onSubmit}
      disabled={isSubmitting}
      onMouseEnter={(e) => {
        if (!isSubmitting) {
          const target = e.currentTarget as HTMLButtonElement;
          target.style.transform = 'scale(1.02)';
          target.style.boxShadow = '0 14px 32px rgba(59, 130, 246, 0.45)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSubmitting) {
          const target = e.currentTarget as HTMLButtonElement;
          target.style.transform = 'scale(1)';
          target.style.boxShadow = '0 10px 28px rgba(59, 130, 246, 0.35)';
        }
      }}
    >
      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
    </button>
  );
};

// Score Tracker Component (for development - hidden in production)
const ScoreTracker: React.FC<{ scores: QuizScores }> = ({ scores }) => {
  const trackerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#2a2a2a',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #444',
    color: 'white',
    fontSize: '0.8rem',
    maxWidth: '200px',
    display: 'none' // Hidden in production
  };

  return (
    <div style={trackerStyle}>
      <h4>Scores (Dev Mode)</h4>
      <p>Aptitude: {scores.aptitude_score}</p>
      <p>Science: {scores.science_score}</p>
      <p>Arts: {scores.arts_score}</p>
      <p>Commerce: {scores.commerce_score}</p>
      <p>Interest Sci: {scores.interest_science}</p>
      <p>Interest Arts: {scores.interest_arts}</p>
      <p>Interest Com: {scores.interest_commerce}</p>
    </div>
  );
};

// Main Quiz Page Component
const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  // Sample questions data
  const sampleQuestions: Question[] = [
    // Aptitude Questions
    {
      id: 'apt1',
      question: 'What is the next number in the sequence: 2, 4, 8, 16, ?',
      options: ['20', '24', '32', '64'],
      correctAnswer: 2,
      category: 'aptitude'
    },
    {
      id: 'apt2',
      question: 'If A = 1, B = 2, C = 3, what does "CAB" equal?',
      options: ['6', '312', '321', '123'],
      correctAnswer: 0,
      category: 'aptitude'
    },
    // Science Questions
    {
      id: 'sci1',
      question: 'What is the chemical formula for water?',
      options: ['H2O', 'CO2', 'NaCl', 'CH4'],
      correctAnswer: 0,
      category: 'science'
    },
    {
      id: 'sci2',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      category: 'science'
    },
    // Arts Questions
    {
      id: 'art1',
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
      correctAnswer: 2,
      category: 'arts'
    },
    {
      id: 'art2',
      question: 'Which of these is a primary color?',
      options: ['Green', 'Orange', 'Purple', 'Blue'],
      correctAnswer: 3,
      category: 'arts'
    },
    // Commerce Questions
    {
      id: 'com1',
      question: 'What does GDP stand for?',
      options: ['Gross Domestic Product', 'General Data Processing', 'Global Development Plan', 'Government Debt Portfolio'],
      correctAnswer: 0,
      category: 'commerce'
    },
    {
      id: 'com2',
      question: 'What is the basic principle of supply and demand?',
      options: ['Higher supply = Higher prices', 'Lower demand = Higher prices', 'Higher demand = Higher prices', 'Supply and demand are unrelated'],
      correctAnswer: 2,
      category: 'commerce'
    }
  ];

  // State management
  const [scores, setScores] = useState<QuizScores>({
    aptitude_score: 0,
    science_score: 0,
    arts_score: 0,
    commerce_score: 0,
    interest_science: 5,
    interest_arts: 5,
    interest_commerce: 5
  });

  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [, setError] = useState('');

  const estimateStreamFromScores = () => {
    const { science_score, commerce_score, arts_score, interest_science, interest_commerce, interest_arts } = scores;
    if (science_score + interest_science >= commerce_score + arts_score + interest_commerce + interest_arts) {
      return 'Engineering Stream - Based on your science scores and interests!';
    }
    if (commerce_score + interest_commerce >= arts_score + interest_arts) {
      return 'Commerce Stream - Based on your commerce scores and interests!';
    }
    return 'Arts Stream - Based on your arts scores and interests!';
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));

    // Update scores
    const question = sampleQuestions.find(q => q.id === questionId);
    if (question) {
      const isCorrect = answerIndex === question.correctAnswer;
      const categoryKey = `${question.category}_score` as keyof QuizScores;

      setScores(prev => {
        const currentScore = prev[categoryKey] as number;
        const previousAnswer = selectedAnswers[questionId];
        let newScore = currentScore;

        // If there was a previous answer, subtract its contribution
        if (previousAnswer !== undefined) {
          const wasPreviousCorrect = previousAnswer === question.correctAnswer;
          if (wasPreviousCorrect) {
            newScore -= 1;
          }
        }

        // Add score for current answer if correct
        if (isCorrect) {
          newScore += 1;
        }

        return {
          ...prev,
          [categoryKey]: Math.max(0, newScore)
        };
      });
    }
  };

  // Handle interest scale changes
  const handleInterestChange = (category: 'science' | 'arts' | 'commerce', value: number) => {
    const scoreKey = `interest_${category}` as keyof QuizScores;
    setScores(prev => ({
      ...prev,
      [scoreKey]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result: any = await apiPost(API.SUBMIT_QUIZ, scores);
      setApiResponse(result.predicted_stream);
    } catch (error: any) {
      console.error('Quiz submission error:', error);
      setError('Failed to submit quiz. Using estimated prediction.');
      const bestStream = estimateStreamFromScores();
      setApiResponse(bestStream);
    }
    setIsSubmitting(false);

    // Navigate back to chat with a status message
    navigate('/chat', {
      state: {
        initialBotMessage: 'Please wait while we choose the best paths for you based on your assessment...',
        interestsFromQuiz: {
          interest_science: scores.interest_science,
          interest_arts: scores.interest_arts,
          interest_commerce: scores.interest_commerce,
          aptitude_score: scores.aptitude_score,
          science_score: scores.science_score,
          arts_score: scores.arts_score,
          commerce_score: scores.commerce_score
        }
      }
    });
  };

  // Filter questions by category
  const aptitudeQuestions = sampleQuestions.filter(q => q.category === 'aptitude');
  const scienceQuestions = sampleQuestions.filter(q => q.category === 'science');
  const artsQuestions = sampleQuestions.filter(q => q.category === 'arts');
  const commerceQuestions = sampleQuestions.filter(q => q.category === 'commerce');

  // Main page styles with proper centering
  const pageStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #0f172a 50%, #111827 100%)',
    minHeight: '100vh',
    width: '100%',
    color: 'white',
    padding: '6rem 16px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflowX: 'hidden'
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '3rem',
    width: '100%'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
    marginBottom: '1rem',
    color: 'white',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #3b82f6, #10b981)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    color: '#ccc',
    marginBottom: '2rem',
    lineHeight: '1.5'
  };

  const sectionsContainerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  };

  const interestSectionStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
    borderRadius: '18px',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
    width: '100%',
    maxWidth: '100%',
    margin: '0 0 3rem 0'
  };

  const interestTitleStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.5rem',
    marginBottom: '2rem',
    fontWeight: 'bold',
    borderBottom: '3px solid #3b82f6',
    paddingBottom: '0.5rem',
    textAlign: 'center'
  };

  const responseStyle: React.CSSProperties = {
    marginTop: '2rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
    borderRadius: '18px',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    display: apiResponse ? 'block' : 'none',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
    width: '100%',
    maxWidth: '100%',
    margin: '2rem 0 0 0'
  };

  const responseHeaderStyle: React.CSSProperties = {
    color: 'white',
    marginBottom: '1rem',
    fontSize: '1.3rem',
    fontWeight: 'bold'
  };

  const responseTextStyle: React.CSSProperties = {
    color: '#34d399',
    fontSize: '1.1rem',
    fontWeight: '500',
    lineHeight: '1.6'
  };

  return (
    <div style={pageStyle}>
      <style>{`
        /* Make this page full-bleed */
        #root { max-width: none !important; padding: 0 !important; text-align: initial !important; }
        html, body { overflow-x: hidden !important; width: 100% !important; }
        body { display: block !important; place-items: initial !important; margin: 0 !important; }
      `}</style>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>🎯 Career Assessment Quiz</h1>
          <p style={subtitleStyle}>
            Answer the following questions to discover your ideal career path
          </p>
        </div>

        <div style={sectionsContainerStyle}>
          <QuestionSection
            title="📊 Aptitude / General Questions"
            questions={aptitudeQuestions}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuestionSection
            title="🔬 Science Questions"
            questions={scienceQuestions}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuestionSection
            title="🎨 Arts Questions"
            questions={artsQuestions}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
          />

          <QuestionSection
            title="💼 Commerce Questions"
            questions={commerceQuestions}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
          />

          <div style={interestSectionStyle}>
            <h3 style={interestTitleStyle}>💡 Interest Levels</h3>
            <InterestScale
              title="Interest in Science (1-10)"
              value={scores.interest_science}
              onChange={(value) => handleInterestChange('science', value)}
            />
            <InterestScale
              title="Interest in Arts (1-10)"
              value={scores.interest_arts}
              onChange={(value) => handleInterestChange('arts', value)}
            />
            <InterestScale
              title="Interest in Commerce (1-10)"
              value={scores.interest_commerce}
              onChange={(value) => handleInterestChange('commerce', value)}
            />
          </div>

          <SubmitButton
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <div style={responseStyle}>
            <h3 style={responseHeaderStyle}>🎉 Recommended Career Stream:</h3>
            <p style={responseTextStyle}>{apiResponse}</p>
          </div>
        </div>

        <ScoreTracker scores={scores} />
      </div>
    </div>
  );
};

export default QuizPage;