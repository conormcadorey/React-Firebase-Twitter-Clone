import { SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED, LOADING_USER, LIKE_SCREAM, UNLIKE_SCREAM } from '../types'; 

//initial state
const initialState = {

    authenticated: false,
    credentials: {},
    loading: false,
    likes: [],
    notifications: []
};

//first param = initial default state 
//second param = action recieved 
export default function(state = initialState, action) {
    //...do something depending on the action type recieved
    switch(action.type){
        case SET_AUTHENTICATED:
            return {
                ...state,
                authenticated: true
            };
            case SET_UNAUTHENTICATED:
                return initialState;
            case SET_USER:
                return {
                    authenticated: true,
                    loading: false,
                    ...action.payload
                };
            case LOADING_USER:
                return {
                    ...state,
                    loading: true
                }
            case LIKE_SCREAM:
                return {
                    ...state, //return state as is
                    likes: [ //return likes array
                        ...state.likes, //spread state.likes
                        //add a new like with the users credentials and the screamId of returned scream from payload
                        {
                            userHandle: state.credentials.handle,
                            screamId: action.payload.screamId
                        }
                    ]
                }
            case UNLIKE_SCREAM:
                return {
                    ...state,
                    //remove scream from likes array using filter 
                    likes: state.likes.filter(like => like.screamId !== action.payload.ScreamId)
                }

                default:
                    return state;
    }
}