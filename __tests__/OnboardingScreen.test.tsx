import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../app/auth/welcome/index';

// 1. Mock Navigation and Storage
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
    router: {
        replace: (path: string) => mockReplace(path),
    },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
}));

describe('<WelcomeScreen />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: UI Rendering (Title)
    it('renders the welcome title correctly', () => {
        const { getByText } = render(<WelcomeScreen />);
        expect(getByText('Chào mừng bạn👋')).toBeTruthy();
        expect(getByText(/Tìm và trả lại đồ thất lạc/)).toBeTruthy();
    });

    // Test Case 2: Button Rendering
    it('contains the "Let\'s Go!" button', () => {
        const { getByText } = render(<WelcomeScreen />);
        const button = getByText("Let's Go!");
        expect(button).toBeTruthy();
    });

    // Test Case 3: Interaction (Press & Navigation)
    it('saves flag and navigates to login on button press', async () => {
        const { getByText } = render(<WelcomeScreen />);
        const button = getByText("Let's Go!");

        fireEvent.press(button);

        await waitFor(() => {
            // Check if AsyncStorage was called
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasSeenWelcome', 'true');
            // Check if router.replace was called with correct path
            expect(mockReplace).toHaveBeenCalledWith('/auth/login');
        });
    });
});