import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'; //midleware/store enhancer 

import userReducer from './reducers/userReducer';
import dataReducer from './reducers/dataReducer';
import uiReducer from './reducers/uiReducer';

//store = container of the applications state 

//initialize an initial state 
const initialState = {};

//array of middlewear
const middleware = [thunk];

//reducers
//combine the reducers
const reducers = combineReducers({
    //actual state
    //name objects inside the state
    user: userReducer,
    data: dataReducer,
    UI: uiReducer
});

//create the store
const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(reducers, initialState, enhancer);

export default store;