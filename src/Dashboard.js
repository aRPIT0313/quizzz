import React, { useEffect, useState } from "react";
import questionsData from "./questions";
import { shuffleArray } from "./shuffle";
import "./dashboard.css";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  /* Subjects */
  const subjects = ["Math", "Science", "English"];
  const [selectedSubject, setSelectedSubject] = useState("Math");

  /* Difficulty */
  const [difficulty, setDifficulty] = useState("Easy");

  /* Quiz State */
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  /* Party / Result */
  const [showPopup, setShowPopup] = useState(false);
  const [showResults, setShowResults] = useState(false);

  /* User */
  const username = "Guest";

  /* Track per-question correctness */
  const [questionResults, setQuestionResults] = useState([]);

  /* Load Questions */
  useEffect(() => {
    const levelQuestions =
      questionsData?.[selectedSubject]?.[difficulty] || [];
    const shuffled = shuffleArray(levelQuestions).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowPopup(false);
    setShowResults(false);
    setQuestionResults([]);
  }, [selectedSubject, difficulty]);

  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];

  /* Next Button */
  const handleNext = () => {
    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) setScore((prev) => prev + 1);

    setQuestionResults((prev) => [
      ...prev,
      { question: currentQuestion.question, correct: isCorrect },
    ]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowPopup(true);
    }
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  /* Prepare Chart Data */
  const barData = {
    labels: questionResults.map((_, idx) => `Q${idx + 1}`),
    datasets: [
      {
        label: "Correct (1) / Wrong (0)",
        data: questionResults.map((q) => (q.correct ? 1 : 0)),
        backgroundColor: questionResults.map((q) =>
          q.correct ? "#16a34a" : "#ef4444"
        ),
      },
    ],
  };

  const pieData = {
    labels: ["Correct", "Wrong"],
    datasets: [
      {
        label: "Overall Performance",
        data: [
          questionResults.filter((q) => q.correct).length,
          questionResults.filter((q) => !q.correct).length,
        ],
        backgroundColor: ["#16a34a", "#ef4444"],
      },
    ],
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

      {/* QUESTION WINDOW */}
      {!showResults && (
        <div className="quiz-container">
          <div className="question-card">
            <h3>
              Q{currentIndex + 1}. {currentQuestion.question}
            </h3>

            <div className="options">
              {currentQuestion.options.map((opt, index) => (
                <label
                  key={index}
                  className={`option ${selectedOption === index ? "selected" : ""}`}
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
        </div>
      )}

      {/* 🎉 PARTY POPUP */}
      {showPopup && !showResults && (
        <div className="party-overlay">
          <div className="party-popup">
            <h1>🎉 Congratulations!</h1>
            <p>
              You scored <strong>{score}</strong> out of{" "}
              <strong>{questions.length}</strong>
            </p>

            <button
              className="retry-btn"
              onClick={() => setShowResults(true)}
            >
              View Results 📊
            </button>
          </div>
        </div>
      )}

      {/* CHARTS VIEW */}
      {showResults && (
        <div className="charts-container" style={{ padding: "30px", textAlign: "center" }}>
          <h2>📊 Quiz Results</h2>

          <div style={{ width: "700px", margin: "20px auto" }}>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: "Question-wise Correct/Wrong" },
                },
                scales: {
                  y: { ticks: { stepSize: 1 }, min: 0, max: 1 },
                },
              }}
            />
          </div>

          <div style={{ width: "400px", margin: "40px auto" }}>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: {
                  title: { display: true, text: "Overall Performance" },
                },
              }}
            />
          </div>

          {/* BACK BUTTON */}
          <button
            className="next-btn"
            style={{ marginTop: "20px" }}
            onClick={() => {
              setShowResults(false);
              setShowPopup(false);
              setCurrentIndex(0);
              setSelectedOption(null);
              setScore(0);
              setQuestionResults([]);
            }}
          >
            Back to Quiz 🔙
          </button>
        </div>
      )}
    </div>
  );
}
