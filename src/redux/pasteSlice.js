import { createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
const initialState = {
    pastes:localStorage.getItem("pastes")
        ? JSON.parse(localStorage.getItem("pastes"))
        : []
}
export const pasteSlice = createSlice({
    name: 'paste',
    initialState,
    reducers: {
        addToPastes: (state, action) =>{
            const paste = action.payload;
            state.pastes.push(paste);
            localStorage.setItem("pastes",JSON.stringify(state.pastes));
            toast.success("Paste created successfully.");
        },
        updateToPastes: (state, action) => {
            const paste = action.payload;
            const pasteIndex = state.pastes.findIndex(
                (currentPaste) => currentPaste._id === paste._id
            );

            if (pasteIndex === -1) {
                toast.error("Paste not found.");
                return;
            }

            state.pastes[pasteIndex] = paste;
            localStorage.setItem("pastes", JSON.stringify(state.pastes));
            toast.success("Paste updated successfully.");
        },
        resetAllPastes: (state) => {
            state.pastes = [];
            localStorage.removeItem("pastes");
            toast.success("All pastes deleted.");
        },
        removeFromPaste: (state, action) => {
            state.pastes = state.pastes.filter(
                (paste) => paste._id !== action.payload
            );
            localStorage.setItem("pastes", JSON.stringify(state.pastes));
            toast.success("Paste deleted successfully.");
        },
        togglePinPaste: (state, action) => {
            const paste = state.pastes.find((item) => item._id === action.payload);

            if (!paste) {
                toast.error("Paste not found.");
                return;
            }

            paste.pinned = !paste.pinned;
            localStorage.setItem("pastes", JSON.stringify(state.pastes));
            toast.success(paste.pinned ? "Paste pinned." : "Paste unpinned.");
        },
    }
})

export const {
    addToPastes,
    updateToPastes,
    resetAllPastes,
    removeFromPaste,
    togglePinPaste,
} = pasteSlice.actions

export default pasteSlice.reducer