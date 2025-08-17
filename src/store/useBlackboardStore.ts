// 'use client';
import { create } from 'zustand';

interface BlackboardState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export const useBlackboardStore = create<BlackboardState>((set) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
}));
