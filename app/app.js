import Riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { submissionReducer, sweepsReducer } from './reducers/reducers';
import './components/app.tag';


/**
* @desc centralized mounts
*/
Riot.mount('app', {title: 'RethinkDB'});