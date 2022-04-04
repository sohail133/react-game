import React from "react";
import Question from "./Question.jsx";
import Answers from "./Answers.jsx";
import Timer from "./Timer.jsx";
import CurrentScore from "./CurrentScore.jsx";
import Lifelines from "./Lifelines.jsx";
import Voting from "./Voting.jsx";
import Winnings from "./Winnings.jsx";
import data from "./data.js";
const url = window.location.origin;
const atob = require("atob");

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: "",
      questionNumber: 0,
      allAnsBtns: [],
      idxCorrAns: null,
      correctAnswer: "",
      allAnswers: [],
      loading: true,
      additionalField: "",
      name: document.getElementById("app").getAttribute("data-user-name"),
      additionalFieldPlaceHolder:
        document.getElementById("app").getAttribute("data-additional-field") !==
        null
          ? document.getElementById("app").getAttribute("data-additional-field")
          : "",
      gameScore: { name: "", score: 0 },
      canAnswer: [false, false, false, false],
      canType: true,
      dChanceActiv: false,
      text: "Who wants to be a doctor?",
      scores: 0,
      secsLeft: 30,
      maxSecRound: 30,
      canUseLifelines: [false, false, false, false],
      lifelinesStatus: [true, true, true, true],
      canClickControl: [true, false, false],
      currentWinnings: 0,
      guaranteedWinnings: 0,
      isPause: false,
    };
  }

  shuffle = (arr) => {
    for (let i = arr.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
    }

    return arr;
  };

  htmlDecode = (input) => {
    const e = document.createElement("div");
    e.innerHTML = input;
    return e.childNodes[0].nodeValue;
  };

  randombetween = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  insertQuestion = (data) => {
    const incorrect_answers = [];
    incorrect_answers.push(data.incorrect_answer1);
    incorrect_answers.push(data.incorrect_answer2);
    incorrect_answers.push(data.incorrect_answer3);
    const correctAnswer = this.htmlDecode(data.correct_answer);
    const allAnswers = this.shuffle(incorrect_answers.concat(correctAnswer));
    const idxCorrAns = allAnswers.indexOf(correctAnswer);
    this.setState({
      question: data.question,
      correctAnswer: correctAnswer,
      idxCorrAns: idxCorrAns,
      canAnswer: [true, true, true, true],
      allAnswers: allAnswers,
      loading: false,
    });
  };

  getQuestion = () => {
    const competitionNumber = parseInt(
      window.location.pathname.substring(
        window.location.pathname.lastIndexOf("/") + 1
      )
    );
    const baseUrl = `${url}/competitions/${competitionNumber}/competition_questions/${this.state.questionNumber}`;
    fetch(baseUrl, {
      mode: "no-cors",
    })
      .then((data) => data.json())
      .then((data) => {
        this.insertQuestion(JSON.parse(atob(data.question)));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };
  handleFieldChange = (event) => {
    this.setState({
      additionalField: event.target.value,
    });
  };

  prepareQuestion = (status) => {
    this.getQuestion();
    this.setState({
      canUseLifelines: status,
      questionNumber: this.state.questionNumber + 1,
      lifelinesStatus: status,
      canAnswer: [true, true, true, true],
      canClickControl: [false, false, false],
      secsLeft: 30 + this.state.secsLeft,
    });
  };

  finishGame = (text) => {
    clearInterval(this.intervalId);
    this.updateRanking(false, true);
    this.changeAudio("gameSounds", "wrong_answer");
    this.changeAudio("mainTheme", "main_theme");
    this.setState({
      canUseLifelines: [false, false, false, false],
      canClickControl: [false, false, false],
      canAnswer: [false, false, false, false],
      canType: true,
      text: text,
    });
  };

  startGame = (event) => {
    event.preventDefault();
    if (this.state.name.length > 0) {
      
      //Clear inteval in case multiple click on Start Game button
      clearInterval(this.intervalId);
      this.changeAudio("gameSounds", "lets_play");
      this.timeuot = setTimeout(
        () => this.changeAudio("mainTheme", "easy"),
        1000
      );
      this.exitVotingResult();
      this.prepareQuestion([true, true, true, true]);
      this.setState({
        text: `Hello ${this.state.name}! This is your first question:`,
        maxSecRound: 30,
        canType: false,
        scores: 0,
        currentWinnings: 0,
        guaranteedWinnings: 0,
        secsLeft: 30,
        canUseLifelines: [true, true, true, true],
        isPause: false,
      });
      this.intervalId = setInterval(this.timer.bind(), 1000);
    }
  };

  timer = () => {
    if (!this.state.isPause) {
      this.setState({
        secsLeft: this.state.secsLeft - 1,
      });
    }
    if (this.state.secsLeft === 0) {
      this.finishGame("Time is over!");
      window.location.replace(window.location.origin);
    }
  };

  nextRound = () => {
    this.changeAudio("gameSounds", "next");
    this.timeuot = setTimeout(
      () => this.changeAudio("mainTheme", data.themeRound[this.state.scores]),
      1000
    );
    this.removeHiglightAnswer()
    this.exitVotingResult();
    this.prepareQuestion(this.state.lifelinesStatus);
    this.setText("Great! This is your next question!");
    this.intervalId = setInterval(this.timer.bind(), 1000);
    this.setState({
      maxSecRound: this.state.secsLeft + 30,
    });
  };

  setText = (text) => {
    this.setState({
      text: text,
    });
  };

  changeAudio = (id, src) => {
    const audio = document.querySelector(`#${id}`);
    audio.currentTime = 0;
    audio.src = `./sounds/${src}.mp3`;
    audio.play();
  };

  removeHiglightAnswer = () => {
    this.state.allAnsBtns[this.state.idxCorrAns].classList.remove("correct");
  }

  hightlightCorrectAns = () => {
    this.state.allAnsBtns[this.state.idxCorrAns].classList.remove("selected");
    this.state.allAnsBtns[this.state.idxCorrAns].classList.add("correct");
  };

  hightlightSelectedAns = (idx) => {
    this.state.allAnsBtns[idx].classList.add("selected");
    this.state.allAnsBtns[idx].disabled = true;
  };

  hightlightWrongAns = (idx) => {
    this.state.allAnsBtns[idx].classList.remove("selected");
    this.state.allAnsBtns[idx].classList.add("wrong");
    this.state.allAnsBtns[idx].disabled = true;
    this.updateRanking(false);
    window.location.replace(window.location.origin);
  };

  handleAnsSelect = (answer, i) => {
    this.changeAudio("gameSounds", "final_answer");
    this.state.allAnsBtns = document.querySelectorAll(".answerBtn");
    this.hightlightSelectedAns(i);
    this.setState({
      isPause: true,
      canAnswer: [false, false, false, false],
      canUseLifelines: [false, false, false, false],
    });
    this.timeoutId = setTimeout(() => {
      if (i === this.state.idxCorrAns) {
        clearInterval(this.intervalId);
        this.hightlightCorrectAns();
        this.setState({
          isPause: false,
          votingVis: "hidden",
          dChanceActiv: false,
          scores: this.state.scores + 1,
          canAnswer: [false, false, false, false],
          canClickControl: [false, true, true],
          canUseLifelines: [false, false, false, false],
          currentWinnings: data.currentWinnings[this.state.scores],
          guaranteedWinnings: data.guaranteedWinnings[this.state.scores],
        });

        if (this.state.scores < 15) {
          this.changeAudio("gameSounds", "correct_answer");
          this.setText("Correct answer! Do you want to continue playing??");
        } else {
          this.setState({
            canClickControl: [false, false, false],
          });
          this.updateRanking(false);
          this.changeAudio("mainTheme", "winning_theme");
          this.changeAudio("gameSounds", "you_won_million");
          this.setText("Congratulations! You've just won!");
        }
      } else {
        if (this.state.dChanceActiv === false) {
          this.hightlightCorrectAns();
          this.hightlightWrongAns(i);
          this.updateRanking(false);
          this.finishGame("Wrong answer!");
        } else {
          this.setText("Wrong answer! but you have another chance!");
          this.setState({
            isPause: false,
            canAnswer: [true, true, true, true],
            dChanceActiv: false,
          });
          this.hightlightWrongAns(i);
        }
      }
    }, 2500);
  };

  resign = () => {
    this.changeAudio("gameSounds", "resign");
    this.timeuot = setTimeout(
      () => this.changeAudio("mainTheme", "main_theme"),
      1000
    );
    this.setText(
      `Congratulations! You won ${this.state.currentWinnings} points`
    );
    this.setState({
      canType: true,
      canClickControl: [false, false, false],
      canUseLifelines: [false, false, false, false],
      canAnswer: [false, false, false],
    });

    this.updateRanking(true);
  };

  updateRanking = (resigned, timeOver = false) => {
    const competitionNumber = parseInt(
      window.location.pathname.substring(
        window.location.pathname.lastIndexOf("/") + 1
      )
    );
    if (
      (resigned && this.state.currentWinnings > 0) ||
      (!resigned && !timeOver)
    ) {
      const time = (this.state.scores + 1) * 30 - this.state.secsLeft;
      const formData = new FormData();
      formData.append("competition_result[name]", this.state.name);
      formData.append(
        "competition_result[score]",
        !resigned ? this.state.guaranteedWinnings : this.state.currentWinnings
      );
      formData.append(
        "competition_result[additional_field]",
        this.state.additionalField
      );
      formData.append(
        "competition_result[total_time]",
        this.state.lifelinesStatus[0] === true ? time : time + 30
      );
      formData.append(
        "competition_result[lifelines_used]",
        this.state.lifelinesStatus.filter((el) => el === false).length
      );

      const baseUrl = `${url}/competitions/${competitionNumber}/competition_results`;
      fetch(baseUrl, {
        method: "Post",
        body: formData,
      }).then(res => res.json()).then(r => window.location.replace(window.location.origin)).catch(err => console.log(err))
    }
  };

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  //Lifelines

  handleAddExtraTime = () => {
    this.setText("You've got extra 30 second!");
    const lifelinesStatus = this.state.lifelinesStatus;
    lifelinesStatus[0] = false;
    this.state.canUseLifelines = [false, false, false, false];
    this.changeAudio("gameSounds", "lifelines");
    this.setState({
      secsLeft: this.state.secsLeft + 30,
    });
  };

  handleFiftyFifty = () => {
    this.setText("Let's highlight two wrong answers!");
    const lifelinesStatus = this.state.lifelinesStatus;
    lifelinesStatus[1] = false;
    this.state.canUseLifelines = [false, false, false, false];
    this.changeAudio("gameSounds", "lifelines");
    this.state.allAnsBtns = [...document.querySelectorAll(".answerBtn")];
    this.state.allAnsBtns.splice(this.state.idxCorrAns, 1);
    this.shuffle(this.state.allAnsBtns);
    for (let i = 0; i < 2; i++) {
      this.state.allAnsBtns[i].disabled = true;
      this.state.allAnsBtns[i].classList.add("wrong");
    }
  };

  handleVoting = () => {
    this.setText("Let's give audience a chance!");
    const lifelinesStatus = this.state.lifelinesStatus;
    lifelinesStatus[3] = false;
    this.state.canUseLifelines = [false, false, false, false];
    this.changeAudio("gameSounds", "lifelines");

    const votingReults = document.querySelector(".votingResults");
    const votingResultAll = document.querySelectorAll(".votingResult");
    votingResultAll.forEach((r) => (r.style.visibility = "visible"));
    votingReults.style.visibility = "visible";
    const max = 100;
    const r1 = this.randombetween(1, max - 3);
    const r2 = this.randombetween(1, max - 2 - r1);
    const r3 = this.randombetween(1, max - 1 - r1 - r2);
    const r4 = max - r1 - r2 - r3;
    const rndNums = [r1, r2, r3, r4];
    const maxNum = Math.max(r1, r2, r3, r4);
    const maxNumIdx = rndNums.indexOf(maxNum);

    if (this.randombetween(0, this.state.scores / 2) === 0) {
      const tmp = rndNums[maxNumIdx];
      rndNums[maxNumIdx] = rndNums[this.state.idxCorrAns];
      rndNums[this.state.idxCorrAns] = tmp;
    }

    const percentDiagrams = document.querySelectorAll(".percentageDiagram");
    const percentages = document.querySelectorAll(".percentage");

    percentDiagrams[0].style.height = `${rndNums[0]}px`;
    percentDiagrams[1].style.height = `${rndNums[1]}px`;
    percentDiagrams[2].style.height = `${rndNums[2]}px`;
    percentDiagrams[3].style.height = `${rndNums[3]}px`;

    let counter0 = 0;
    let counter1 = 0;
    let counter2 = 0;
    let counter3 = 0;

    this.setTimer0 = setInterval(() => {
      percentages[0].innerText = `${counter0}%`;

      if (counter0 === rndNums[0]) {
        clearInterval(this.setTimer0);
      }

      counter0++;
    }, 2500 / rndNums[0]);

    this.setTimer1 = setInterval(() => {
      percentages[1].innerText = `${counter1}%`;

      if (counter1 === rndNums[1]) {
        clearInterval(this.setTimer1);
      }

      counter1++;
    }, 2500 / rndNums[1]);

    this.setTimer2 = setInterval(() => {
      percentages[2].innerText = `${counter2}%`;

      if (counter2 === rndNums[2]) {
        clearInterval(this.setTimer2);
      }

      counter2++;
    }, 2500 / rndNums[2]);

    this.setTimer3 = setInterval(() => {
      percentages[3].innerText = `${counter3}%`;

      if (counter3 === rndNums[3]) {
        clearInterval(this.setTimer3);
      }

      counter3++;
    }, 2500 / rndNums[3]);
  };

  handleDoubleChance = () => {
    this.setText("Good choice! It makes things easier.");
    const lifelinesStatus = this.state.lifelinesStatus;
    lifelinesStatus[4] = false;
    this.state.canUseLifelines = [false, false, false, false];
    this.changeAudio("gameSounds", "lifelines");
    this.setState({
      dChanceActiv: true,
    });
  };

  exitVotingResult = () => {
    const votingReults = document.querySelector(".votingResults");
    const votingResultAll = document.querySelectorAll(".votingResult");
    const percentages = document.querySelectorAll(".percentage");
    const percentDiagrams = document.querySelectorAll(".percentageDiagram");
    votingReults.style.visibility = "hidden";
    votingResultAll.forEach((r) => (r.style.visibility = "hidden"));
    percentages.forEach((p) => (p.innerText = "0%"));
    percentDiagrams.forEach((d) => (d.style.height = "0px"));
  };

  render() {
    return (
      <div className="container gameContainer">
        <div className="panel">
          <form className="form" style={{ width: "100%" }}>
            <label>
              <input
                type="text"
                value={this.state.name}
                placeholder="Enter your name..."
                onChange={this.handleNameChange}
                disabled={!this.state.canClickControl[0]}
                required
              ></input>
            </label>
            {this.state.additionalFieldPlaceHolder === "" &&
            this.state.additionalFieldPlaceHolder === "" ? (
              ""
            ) : (
              <label>
                <input
                  type="text"
                  value={this.state.additionalField}
                  placeholder={`Enter your ${this.state.additionalFieldPlaceHolder}...`}
                  onChange={this.handleFieldChange}
                  disabled={!this.state.canClickControl[0]}
                ></input>
              </label>
            )}
            {!this.state.canClickControl[0] ? (
              ""
            ) : (
              <input
                className="panelButton"
                onClick={this.startGame}
                type="submit"
                value="START NEW GAME"
              />
            )}
          </form>
          <button
            className="panelButton"
            onClick={this.nextRound}
            disabled={!this.state.canClickControl[1]}
          >
            NEXT QUESTION
          </button>
          <button
            className="panelButton"
            onClick={this.resign}
            disabled={!this.state.canClickControl[2]}
          >
            RESIGN
          </button>
          <Winnings
            guaranteed={this.state.guaranteedWinnings}
            current={this.state.currentWinnings}
          />
          <Timer time={this.state.secsLeft} maxTime={this.state.maxSecRound} />
        </div>
        <div className="game">
          <h1 className="text">{this.state.text}</h1>
          <Question question={this.state.question} />
          <Answers
            allAnswers={this.state.allAnswers}
            canAnswer={this.state.canAnswer}
            onMyClick={this.handleAnsSelect}
            shuffle={this.shuffle}
          />
          <Lifelines
            canUseLifelines={this.state.canUseLifelines}
            onMyClickAddExtraTime={this.handleAddExtraTime}
            onMyClickFiftyFifty={this.handleFiftyFifty}
            onMyClickChangeQuestion={this.handleChangeQuestion}
            onMyClickVoting={this.handleVoting}
            onMyClickDoubleChance={this.handleDoubleChance}
          />
          <Voting />
        </div>
        <div className="winnings">
          <CurrentScore currentScore={this.state.scores} />
        </div>
      </div>
    );
  }
}
