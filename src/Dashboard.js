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

import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
  const subjects = ["Math", "Science", "English"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [difficulty, setDifficulty] = useState("Easy");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const [showPopup, setShowPopup] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const username = auth.currentUser?.email || "Guest";

  const [questionResults, setQuestionResults] = useState([]);
  const [completedLevels, setCompletedLevels] = useState({}); 

  // Fetch user progress from Firebase
  useEffect(() => {
    const fetchProgress = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data().quizProgress || {};
        setCompletedLevels(data);
      }
    };
    fetchProgress();
  }, []);

  // Load questions for selected level
  useEffect(() => {
    if (completedLevels[selectedSubject]?.[difficulty]) {
      setShowResults(true);
      setShowPopup(false);
      return;
    }

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
  }, [selectedSubject, difficulty, completedLevels]);

  if (!questions.length && !completedLevels[selectedSubject]?.[difficulty])
    return null;

  const currentQuestion = questions[currentIndex];

  const saveLevelToFirebase = async (subject, difficulty, levelData) => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(
      userDocRef,
      { quizProgress: { [subject]: { [difficulty]: levelData } } },
      { merge: true }
    );
  };

  const handleNext = () => {
    if (selectedOption === null) return; // Extra safety check

    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) setScore((prev) => prev + 1);

    const updatedResults = [
      ...questionResults,
      { question: currentQuestion.question, correct: isCorrect },
    ];
    setQuestionResults(updatedResults);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      const levelData = {
        score: score + (isCorrect ? 1 : 0),
        total: questions.length,
        results: updatedResults,
      };

      setCompletedLevels((prev) => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          [difficulty]: levelData,
        },
      }));

      saveLevelToFirebase(selectedSubject, difficulty, levelData);

      setShowPopup(true);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    window.location.href = "/login";
  };

  const currentLevelResults =
    completedLevels[selectedSubject]?.[difficulty] || {};

  const barData = {
    labels: currentLevelResults.results
      ? currentLevelResults.results.map((_, idx) => `Q${idx + 1}`)
      : [],
    datasets: [
      {
        label: "Correct (1) / Wrong (0)",
        data: currentLevelResults.results
          ? currentLevelResults.results.map((q) => (q.correct ? 1 : 0))
          : [],
        backgroundColor: currentLevelResults.results
          ? currentLevelResults.results.map((q) =>
              q.correct ? "#16a34a" : "#ef4444"
            )
          : [],
      },
    ],
  };

  const pieData = {
    labels: ["Correct", "Wrong"],
    datasets: [
      {
        label: "Overall Performance",
        data: currentLevelResults.results
          ? [
              currentLevelResults.results.filter((q) => q.correct).length,
              currentLevelResults.results.filter((q) => !q.correct).length,
            ]
          : [],
        backgroundColor: ["#16a34a", "#ef4444"],
      },
    ],
  };

  const moveToNextLevel = () => {
    const currentIndex = difficulties.indexOf(difficulty);
    if (currentIndex < difficulties.length - 1) {
      setDifficulty(difficulties[currentIndex + 1]);
      setShowResults(false);
      setShowPopup(false);
    } else {
      alert("You have completed all levels for this subject!");
    }
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
        {difficulties.map((level) => (
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
      {!showResults &&
        !completedLevels[selectedSubject]?.[difficulty] && (
          <div className="quiz-container">
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
        <div
          className="charts-container"
          style={{ padding: "30px", textAlign: "center" }}
        >
          <h2>📊 Results for {difficulty} Level</h2>

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

          <button
            className="next-btn"
            style={{ marginTop: "20px" }}
            onClick={moveToNextLevel}
          >
            Back to Quiz / Next Level 🔜
          </button>
        </div>
      )}
    </div>
  );
}
