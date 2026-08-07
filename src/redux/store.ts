import { configureStore } from '@reduxjs/toolkit'
import { semesterReducer } from './semetser/semesterSlice'
import { authReducer } from './auth/authSlice'

export const store = configureStore({
    reducer: {
        semester: semesterReducer,
        auth: authReducer
    }
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;