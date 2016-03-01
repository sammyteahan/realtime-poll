/**
* @name reducers
*/
import {
  ADD_QUESTION,
  UPVOTE_QUESTION,
  RECEIVE_QUESTIONS,
  QUESTION_ADDED,
  QUESTION_UPVOTED
} from '../actions/actions';



export function questions(state={}, action) {
  switch(action.type) {
    case RECEIVE_QUESTIONS:
      return Object.assign({}, state, {
        questions: action.data
      });
    case QUESTION_ADDED:
      return Object.assign({}, state, {
        questions: [...state.questions, action.data]
      });
    case QUESTION_UPVOTED:
      return Object.assign({}, state, {
        questions: [
          ...state.questions.slice(0, action.index),
          state.questions[action.index] = action.data,
          ...state.questions.slice(action.index + 1)
        ]
      });
    default:
      return state;
  }
}
