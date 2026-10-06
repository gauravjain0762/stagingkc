import { useState } from 'react';
import './EducationQuizPage.css';

const QUESTIONS = [
  { type: 'Multiple choice', question: 'What is the most important first step before beginning a new practice?', options: ['Choose the most advanced technique', 'Talk through boundaries and expectations', 'Skip preparation if you feel confident', 'Focus only on equipment'], answer: [1] },
  { type: 'True / false', question: 'Clear communication should continue throughout an activity.', options: ['True', 'False'], answer: [0] },
  { type: 'Multiple choice', question: 'What should you do if someone asks to pause?', options: ['Finish the current step first', 'Pause and check in', 'Continue more slowly', 'Wait until the end to discuss it'], answer: [1] },
  { type: 'Multiple answer', question: 'Which are useful parts of a pre-activity check-in? Select all that apply.', options: ['Discussing boundaries', 'Agreeing on a stop signal', 'Assuming consent from past experience', 'Checking comfort and readiness'], answer: [0, 1, 3] },
  { type: 'True / false', question: 'A participant can change their mind after an activity has started.', options: ['True', 'False'], answer: [0] },
  { type: 'Multiple choice', question: 'What is a good response when you are unsure about a safety decision?', options: ['Guess and continue', 'Pause and seek reliable guidance', 'Ask someone to decide without context', 'Ignore the concern'], answer: [1] },
  { type: 'Multiple choice', question: 'Why is preparation important?', options: ['It removes the need to communicate', 'It helps people make informed choices and respond thoughtfully', 'It guarantees nothing will change', 'It is only needed for advanced learners'], answer: [1] },
  { type: 'Multiple answer', question: 'Which are signs that a check-in may be needed? Select all that apply.', options: ['A change in comfort', 'Uncertainty or hesitation', 'A request to stop', 'Everything is proceeding as planned'], answer: [0, 1, 2] },
  { type: 'Multiple choice', question: 'What should a useful aftercare conversation include?', options: ['A chance to share how the experience felt', 'Only a technical review', 'A requirement to continue immediately', 'No conversation unless something went wrong'], answer: [0] },
  { type: 'True / false', question: 'Safety practices should adapt to the people and circumstances involved.', options: ['True', 'False'], answer: [0] },
];

export default function EducationQuizPage({ course, lesson, onBack, onComplete }) {
  const [stage, setStage] = useState('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);
  const question = QUESTIONS[questionIndex];
  const selected = answers[questionIndex] || [];
  const toggleAnswer = optionIndex => setAnswers(previous => {
    const current = previous[questionIndex] || [];
    const next = question.type === 'Multiple answer'
      ? (current.includes(optionIndex) ? current.filter(answer => answer !== optionIndex) : [...current, optionIndex])
      : [optionIndex];
    return { ...previous, [questionIndex]: next };
  });
  const begin = () => { setAnswers({}); setQuestionIndex(0); setResult(null); setAttempts(previous => previous + 1); setStage('question'); };
  const finish = () => {
    const correct = QUESTIONS.reduce((sum, currentQuestion, index) => {
      const given = [...(answers[index] || [])].sort();
      const expected = [...currentQuestion.answer].sort();
      return sum + (given.length === expected.length && given.every((value, i) => value === expected[i]) ? 1 : 0);
    }, 0);
    const score = Math.round(correct / QUESTIONS.length * 100);
    setResult({ correct, score, passed: score >= 70 });
    setStage('result');
  };
  const continueCourse = () => { if (result?.passed) onComplete?.(); else onBack?.(); };
  return <main className="eq-page"><header className="eq-header"><button onClick={onBack}>← Back to Course</button><div><strong>{course.title}</strong><span>{lesson.title}</span></div><span className="eq-header-tag">ASSESSMENT</span></header>
    {stage === 'intro' && <section className="eq-intro"><div className="eq-icon">✓</div><span className="eq-eyebrow">COURSE ASSESSMENT</span><h1>{lesson.title}</h1><p>Check your understanding of {course.title} before moving on.</p><div className="eq-stats"><div><b>{QUESTIONS.length}</b><span>Questions</span></div><div><b>70%</b><span>Passing score</span></div><div><b>{2 - attempts}</b><span>Attempts remaining</span></div><div><b>10 min</b><span>Estimated time</span></div></div><div className="eq-note">You can review and change your answers before submitting. You have up to two attempts.</div><button className="eq-primary" onClick={begin} disabled={attempts >= 2}>{attempts >= 2 ? 'No attempts remaining' : attempts ? 'Try Again' : 'Start Quiz'}</button></section>}
    {stage === 'question' && <section className="eq-question-wrap"><div className="eq-question-top"><div><span>QUESTION {questionIndex + 1} OF {QUESTIONS.length}</span><h1>{question.question}</h1></div><b>{question.type}</b></div><div className="eq-progress"><i style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} /></div><div className="eq-options">{question.options.map((option, index) => <label key={option} className={selected.includes(index) ? 'selected' : ''}><input type={question.type === 'Multiple answer' ? 'checkbox' : 'radio'} name={`question-${questionIndex}`} checked={selected.includes(index)} onChange={() => toggleAnswer(index)} /><span className="eq-option-mark">{selected.includes(index) ? '✓' : String.fromCharCode(65 + index)}</span><span>{option}</span></label>)}</div><footer className="eq-question-footer"><button className="eq-secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex(index => index - 1)}>← Previous</button><span>{Object.keys(answers).length} of {QUESTIONS.length} answered</span>{questionIndex < QUESTIONS.length - 1 ? <button className="eq-primary" disabled={!selected.length} onClick={() => setQuestionIndex(index => index + 1)}>Next →</button> : <button className="eq-primary" disabled={!selected.length} onClick={finish}>Submit Assessment</button>}</footer></section>}
    {stage === 'result' && <section className="eq-result"><div className={`eq-result-mark ${result.passed ? 'passed' : 'failed'}`}>{result.passed ? '✓' : '!'}</div><span className="eq-eyebrow">ASSESSMENT COMPLETE</span><h1>{result.passed ? 'Great work!' : 'Keep learning and try again'}</h1><div className="eq-score">{result.score}<small>%</small></div><div className={`eq-pass ${result.passed ? 'passed' : 'failed'}`}>{result.passed ? 'PASS ✓' : 'FAILED'}</div><p>Passing score: 70%</p><div className="eq-result-stats"><span><b>{result.correct}</b>Correct</span><span><b>{QUESTIONS.length - result.correct}</b>Incorrect</span></div>{result.passed && <div className="eq-points">✦ +20 Education Points</div>}{result.passed ? <button className="eq-primary" onClick={continueCourse}>Continue Course →</button> : <div className="eq-result-actions">{attempts < 2 && <button className="eq-primary" onClick={begin}>Retake Quiz</button>}<button className="eq-secondary" onClick={continueCourse}>{attempts < 2 ? 'Review Course' : 'Return to Course'}</button></div>}</section>}
  </main>;
}
