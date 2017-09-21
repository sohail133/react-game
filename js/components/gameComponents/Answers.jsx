import React from 'react';


class Answers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answers: this.props.allAnswers
    }
  }


  onHandleClick = answer => {
      if ( typeof this.props.onMyClick === 'function' ){
          this.props.onMyClick(answer);
      }
  };



  componentWillReceiveProps(nextProps) {
    if(nextProps.allAnswers !== this.props.allAnswers) {
      this.setState({
        answers: this.props.shuffle(nextProps.allAnswers)
      });
    }
  }

  createMarkup = (i, text) => {
  return {__html: i + text};
  }




  render() {
    const letters = ['A: ', 'B: ', 'C: ', 'D: '];
    const btns = this.state.answers.map( (answer, i) => {
            return <button
                      className = 'answerBtn'
                      key = {answer}
                      disabled={!this.props.canAnswer[i]}
                      onClick = {e => this.onHandleClick(answer)} dangerouslySetInnerHTML={this.createMarkup(letters[i], answer)} >
                    </button>
        });

      return <div className = 'container'>
        {btns}
      </div>
    }
}


 module.exports = Answers;
