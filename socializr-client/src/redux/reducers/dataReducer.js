import { SET_SCREAMS, LIKE_SCREAM, UNLIKE_SCREAM, LOADING_DATA, DELETE_SCREAM, POST_SCREAM } from '../types';

const initialState = {
    screams: [], //array that holds all screams
    scream: {}, //details of one scream
    loading: false
};

export default function(state = initialState, action) {
    switch(action.type){
        case LOADING_DATA:
            return {
                ...state, //spread state
                loading: true
            }
        case SET_SCREAMS:
            return {
                ...state,
                screams: action.payload,
                loading: false
            }
        case LIKE_SCREAM:
        case UNLIKE_SCREAM:
            //find array index of scream with the same id as the one returned by payload 
            let index = state.screams.findIndex((scream) => scream.screamId === action.payload.screamId);
            state.screams[index] = action.payload; //replace scream in the state
            return {
                ...state
            }
        case DELETE_SCREAM:
            index = state.screams.findIndex(scream => scream.screamId === action.payload);
            state.screams.splice(index, 1);
            return {
                ...state
            }
        case POST_SCREAM:
            return {
                ...state,
                screams: [
                    action.payload,
                    ...state.screams
                ]
            }
        default:
            return state;
    }
}