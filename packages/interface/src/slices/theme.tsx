import { createAction, createReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";

// export const setIsDark = createAction<boolean>("@@THEME/DARK_MODE");
// const reducer = createReducer(true, (builder)=>{
//     builder.addCase(setIsDark,(state, {payload})=>{
//         state = payload;
//     })
//     .addDefaultCase((state,action)=> state)
// })
const slice = createSlice({
    "name": "theme",
    "initialState": false,
    "reducers": {
        setIsDark(state, action: PayloadAction<boolean>){
            return action.payload;
        }
    }
});
export const { setIsDark } = slice.actions
export { slice as themeSlice };

