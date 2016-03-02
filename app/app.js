import Riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { questions } from './reducers/reducers';
import './components/app.tag';



/**
* @desc import actions
*/
import {
  fetchQuestions,
  addQuestion,
  upvoteQuestion,
  questionUpvoted,
  questionAdded
} from './actions/actions';



/**
* @desc setup store
*/
const loggerMiddleware = createLogger();
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  loggerMiddleware
)(createStore);

const reduxStore = createStoreWithMiddleware(questions);

/**
* @desc centralized mounts
*/
Riot.mount('app', {
  store: reduxStore,
  fetchQuestions: fetchQuestions,
  upvoteQuestion: upvoteQuestion,
  questionUpvoted: questionUpvoted,
  addQuestion: addQuestion,
  questionAdded: questionAdded,
  title: 'RethinkDB + Redux'
});