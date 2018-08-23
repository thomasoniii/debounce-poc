import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import _ from 'lodash';


const defaultQuestionType = 'page load';

class App extends Component {

  /* allow different debounce timers for different question types.
     The hope would be that we'd cut down on network traffic - a multiple choice question could save
     over the wire to the server instantly, since the user is done with their answer after they click the
     choice.

     An essay question could, for example, defer saving the answer until the user has paused typing (for 1 second, in this case).
     This way we're not constantly sending network traffic while the user is typing and instead merely update it after they save.

     Other question types could have different debounced values, as appropriate.

     There's also a non-question type here: "page load", which would set the debounce time to 1ms so we could fire off the single save
     event as fast as possible during initialization, but then immediately switch to a slower time - either a static value such as 100 or 500
     or something specific to the question type.
  */

  static defaultProps = {
    questionTypeMap : {
      'multiple choice' : 1,
      'essay'           : 1000,
      'math'            : 500,
      'page load'       : 1,

    }
  }

  state = {
    counter              : 0,
    timerDuration        : this.props.questionTypeMap[defaultQuestionType],
    selectedQuestionType : defaultQuestionType,
  }

  constructor(props) {

    super(props);

    /* the makeDebouncedFunction() just wraps lodash's debounce but also returns a bound function.
       for the case of the ServerBackendEnhancer class, we'd change line 23 from:
       this._saveRemote = this._saveRemote.bind(this);
       to this:
       this._saveRemote = this.makeDebouncedFunction(this._saveRemote, 1);
       (or whatever is used as the timer duration)

       After adding the makeDebouncedFunction, of course.

       That way, the code in _saveRemote doesn't need to change at all and by using lodash's debounce
       method we're not re-creating new anonymous functions for the setTimeouts everytime it's called.

       The downside is that lodash is a relatively heavyweight library and importing it may have negative
       size/speed effects if we're not already using it.

       The upside is we don't need to change the existing code at all, only the bind function here.
    */

    this.debouncedClick        = this.makeDebouncedFunction(this.onClick, this.state.timerDuration);
    this.nondebouncedClick     = this.onClick.bind(this);

    this.onChangeTimerDuration = this.onChangeTimerDuration.bind(this);
    this.onQuestionTypeChange  = this.onQuestionTypeChange.bind(this);

  }

  componentDidMount() {
    // for demo purposes, fire off a whole bunch of debouncedClicks when the component mounts.
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();
    this.debouncedClick();

    //and then switch to a slower debounce time after the page init is done, however that is determined.
    this.setQuestionType( 'essay' );
  }

  makeDebouncedFunction(func, delay) {
    return _.debounce(func, delay).bind(this);
  }

  onClick() {
    this.setState({counter : this.state.counter + 1});
  }

  // this function is wired into the input field with the timerDuration, and modifies
  // the debounced function as desired
  onChangeTimerDuration(e) {

    const timerDuration = e.target.value;

    this.debouncedClick = this.makeDebouncedFunction(this.onClick, timerDuration);
    this.setState({ timerDuration });
  }

  // this one is wired into the question type selector and then calls the non-event based
  // function to update the timer duration based upon the lookup of the question type.
  onQuestionTypeChange(e) {
    const selectedQuestionType  = e.target.value;
    this.setQuestionType( selectedQuestionType );
  }

  setQuestionType(selectedQuestionType) {

    const timerDuration = this.props.questionTypeMap[ selectedQuestionType ];

    this.debouncedClick = this.makeDebouncedFunction(this.onClick, timerDuration);
    this.setState({ selectedQuestionType, timerDuration });
  }

  render() {

    return (
      <div className="App">
        <div>Clicks: { this.state.counter }</div>
        <div>
          <button onClick={this.debouncedClick}>debounced function</button>
          <button onClick={this.nondebouncedClick}>non-debounced function</button>
        </div>
        <div>
          <select
            value={this.state.selectedQuestionType}
            onChange={this.onQuestionTypeChange}
            >
            { Object.keys(this.props.questionTypeMap).map( q => <option value={q} key={q}>{q}</option>) }
          </select>
          Debounce timer:<input type = 'number' onChange={this.onChangeTimerDuration} value={this.state.timerDuration} />
        </div>
        <div>
          <a href = 'https://github.com/thomasoniii/debounce-poc'>https://github.com/thomasoniii/debounce-poc</a>
        </div>
      </div>
    );
  }
}

export default App;
