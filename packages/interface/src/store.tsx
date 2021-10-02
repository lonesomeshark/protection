import { configureStore } from "@reduxjs/toolkit";
import { } from "./slices"
import { themeSlice } from './slices/theme';
const reducer = {
  theme: themeSlice.reducer
};
export const store = configureStore({
  devTools: process.env["NODE_ENV"] === "development",
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
