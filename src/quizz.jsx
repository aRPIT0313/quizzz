import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateMCQs } from "./gptservice";
import "./quiz.css";


const Quiz = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { subject, level } = state;
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(generateMCQs(subject));
  }, [subject]);

  return (
    <div className="quiz-container">
      <h2>{subject} - {level}</h2>

      {questions.map((q, i) => (
        <div key={i}>
          <p>{i + 1}. {q.question}</p>
          {q.options.map(opt => (
            <label key={opt}>
              <input type="radio" name={i} /> {opt}
            </label>
          ))}
        </div>
      ))}

      <button onClick={() => navigate("/dashboard", {
        state: { subject, completedLevel: level }
      })}>
        Submit Quiz
      </button>
    </div>
  );
};

export default Quiz;
