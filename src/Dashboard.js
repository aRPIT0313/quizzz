import React, { useEffect, useState } from "react";
import questionsData from "./questions";
import { shuffleArray } from "./shuffle";
import "./dashboard.css";

export default function Dashboard() {
  /* Subjects */
  const subjects = ["Math", "Science", "English"];
  const [selectedSubject, setSelectedSubject] = useState("Math");

  /* Difficulty */
  const [difficulty, setDifficulty] = useState("Easy");

  /* Quiz state */
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  /* User */
  const username = "Guest";

  /* Load questions when subject or difficulty changes */
  useEffect(() => {
    const levelQuestions =
      questionsData?.[selectedSubject]?.[difficulty] || [];

    const shuffled = shuffleArray(levelQuestions).slice(0, 10);

    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  }, [selectedSubject, difficulty]);

  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (selectedOption === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleLogout = () => {
    alert("Logged out");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">Qvizz</div>

        <div className="nav-center">
          {subjects.map((subj) => (
            <span
              key={subj}
              className={selectedSubject === subj ? "subject active" : "subject"}
              onClick={() => setSelectedSubject(subj)}
            >
              {subj}
            </span>
          ))}
        </div>

        <div className="nav-right">
          <span className="username">{username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* DIFFICULTY */}
      <div className="difficulty-bar">
        {["Easy", "Medium", "Hard"].map((level) => (
          <button
            key={level}
            className={difficulty === level ? "active" : ""}
            onClick={() => setDifficulty(level)}
          >
            {level}
          </button>
        ))}
      </div>

      {/* QUIZ */}
      <div className="quiz-container">
        {!quizFinished ? (
          <div className="question-card">
            <h3>
              Q{currentIndex + 1}. {currentQuestion.question}
            </h3>

            <div className="options">
              {currentQuestion.options.map((opt, index) => (
                <label
                  key={index}
                  className={`option ${
                    selectedOption === index ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="option"
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <button
              className="next-btn"
              disabled={selectedOption === null}
              onClick={handleNext}
            >
              {currentIndex === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        ) : (
          /* RESULT */
          <div className="result-card">
            <h2>Quiz Completed 🎉</h2>
            <p>
              Score: <strong>{score} / {questions.length}</strong>
            </p>
            <button
              className="next-btn"
              onClick={() => setDifficulty(difficulty)}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
