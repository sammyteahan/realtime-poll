import axios from 'axios';



/**
* @name actions
*/
export const ADD_QUESTION = 'ADD_QUESTION';
export const UPVOTE_QUESTION = 'UPVOTE_QUESTION';
export const QUESTION_UPVOTED = 'QUESTION_UPVOTED';
export const RECEIVE_QUESTIONS = 'RECEIVE_QUESTIONS';
export const QUESTION_ADDED = 'QUESTION_ADDED';
const config = {
  headers: {'Content-Type': 'application/json'}
};



/**
* @name actions
*/
export function fetchQuestions() {
  return function(dispatch, getState) {
    return axios.get('http://localhost:8090/questions').then((response) => {
      dispatch(receiveQuestions(response));
    });
  }
}

export function upvoteQuestion(id, index) {
  return axios.put(`http://localhost:8090/questions/${id}`, {
    id: id
  }, config);
}

/**
* @desc in this realtime example, we don't want to wrap this in a 
* dispatch function and call it via the store in the component. Since
* we are listening for changes from socket.io in our component, it would
* trigger a double action if we were to pass it through our reducers after
* we get our response back.
*/
// export function upvoteQuestion(id, index) {
//   return function(dispatch, getState) {
//     return axios.put(`http://localhost:8090/questions/${id}`, {
//       id: id
//     }, config).then((response) => {
//       dispatch(questionUpvoted(id, index, response));
//     });
//   }
// }

/**
* @desc post new question to /questions
*/
export function addQuestion(payload) {
  return axios.post(`http://localhost:8090/questions`, payload, config);
}



/**
* @name action creators
*/
function receiveQuestions(response) {
  return {
    type: RECEIVE_QUESTIONS,
    data: response.data
  };
}

export function questionUpvoted(index, id, data) {
  return {
    type: QUESTION_UPVOTED,
    id: id,
    index: index,
    data: data
  };
}

export function questionAdded(data) {
  return {
    type: QUESTION_ADDED,
    data: data
  };
}