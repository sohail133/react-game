import React from "react";
const url = window.location.origin;

export default class BestScores extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ranking: [],
    };
  }

  componentDidMount() {
    const competitionNumber = parseInt(
      window.location.pathname.substring(
        window.location.pathname.lastIndexOf("/") + 1
      )
    );
    const baseUrl = `${url}/competitions/${competitionNumber}/leaderboard`;
    fetch(baseUrl, {
      mode: "no-cors",
      headers: { Accept: "application/json" },
    })
      .then((data) => data.json())
      .then((data) => {
        this.setState({
          ranking: data,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // rankRef.on("value", (snapshot) => {
    //   this.setState({
    //     ranking: snapshot.val(),
    //   });
    // });
    // console.log(this.state.ranking);
  }

  render() {
    const scores = [];
    for (let key of Object.keys(this.state.ranking)) {
      scores.push(this.state.ranking[key]);
    }

    const ranking = scores
      .sort((a, b) =>
        b.score === a.score ? a.totalTime - b.totalTime : b.score - a.score
      )
      .map((el, index) => {
        return (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{el.name}</td>
            <td>{el.score}&pound; </td>
            <td>{el.total_time}sec </td>
            <td>{el.lifelines_used}/5</td>
          </tr>
        );
      });

    return (
      <div className="container bestScoreContainer">
        <table className="bestScoreTable">
          <thead>
            <tr>
              <td colSpan="5">Best Scores</td>
            </tr>
            <tr>
              <td>Position</td>
              <td>Name</td>
              <td>Score</td>
              <td>Total time</td>
              <td>Lifelines used</td>
            </tr>
          </thead>
          <tbody>{ranking}</tbody>
        </table>
      </div>
    );
  }
}
