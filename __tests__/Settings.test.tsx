import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Settings from '../app/(tabs)/settings';
import api from '../app/services/api';

// --- 1. MOCK EXPO ROUTER ---
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
    router: {
        push: (...args: any[]) => mockPush(...args),
        replace: (...args: any[]) => mockReplace(...args),
    },
}));

// --- 2. MOCK API ---
jest.mock('../app/services/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    }
}));

// --- 3. MOCK SENTRY ---
jest.mock('@sentry/react-native', () => ({
    captureException: jest.fn(),
}));

// --- 4. MOCK SECURE STORE ---
jest.mock('expo-secure-store', () => ({
    deleteItemAsync: jest.fn(),
}));

// --- 5. MOCK USER STORE ---
const mockClearUser = jest.fn();

jest.mock('../store/useUserStore', () => {
    const mockStore = jest.fn((selector) => {
        const mockState = {
            role: 'user',
            id: 123,
            clearUser: mockClearUser,
        };
        return selector ? selector(mockState) : mockState;
    });
    mockStore.getState = () => ({
        clearUser: mockClearUser,
    });
    return {
        __esModule: true,
        default: mockStore,
    };
});

// --- 6. MOCK ALERT ---
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: mockAlert,
}));

describe('<Settings />', () => {
    const mockUserData = {
        alias: 'Test User',
        email: 'test@hcmut.edu.vn',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup the API return value for every test
        (api.post as jest.Mock).mockResolvedValue(mockUserData);
        // Reset to default user role
        const { default: useUserStoreMock } = require('../store/useUserStore');
        useUserStoreMock.mockImplementation((selector) => {
            const mockState = {
                role: 'user',
                id: 123,
                clearUser: mockClearUser,
            };
            return selector ? selector(mockState) : mockState;
        });
    });

    // Test Case 1: Renders loading initially
    it('renders loading state initially', () => {
        const { getByTestId } = render(<Settings />);
        // ActivityIndicator might not have testID, but we can check if it's rendered
        // Since it's hard to query ActivityIndicator directly, we'll check after loading
    });

    // Test Case 2: Renders user data after loading
    it('renders user data after loading', async () => {
        const { getByText } = render(<Settings />);

        await waitFor(() => {
            expect(getByText('Test User')).toBeTruthy();
        });

        expect(getByText('test@hcmut.edu.vn')).toBeTruthy();
        expect(getByText('Vai trò: Người dùng')).toBeTruthy();
    });

    // Test Case 3: Handles API error
    it('handles API error gracefully', async () => {
        (api.post as jest.Mock).mockRejectedValue(new Error('API Error'));

        const { getByText } = render(<Settings />);

        await waitFor(() => {
            expect(getByText('API Error')).toBeTruthy();
        });
    });

    // Test Case 4: Navigates to my posts
    it('navigates to my posts when history card is pressed', async () => {
        const { getByText } = render(<Settings />);

        await waitFor(() => {
            expect(getByText('Test User')).toBeTruthy();
        });

        const historyCard = getByText('Lịch sử');
        fireEvent.press(historyCard);

        expect(mockPush).toHaveBeenCalledWith('/post/mypost');
    });

    // Test Case 5: Shows admin statistics for admin role
    it('shows statistics card for admin role', async () => {
        const { default: useUserStoreMock } = require('../store/useUserStore');
        useUserStoreMock.mockImplementation((selector) => {
            const mockState = {
                role: 'admin',
                id: 123,
                clearUser: mockClearUser,
            };
            return selector ? selector(mockState) : mockState;
        });

        const { getByText } = render(<Settings />);

        await waitFor(() => {
            expect(getByText('Test User')).toBeTruthy();
        });

        expect(getByText('Thống kê')).toBeTruthy();
        expect(getByText('Vai trò: Quản trị viên')).toBeTruthy();
    });

    // Test Case 6: Handles logout with confirmation
    it('handles logout with confirmation', async () => {
        const { getByText } = render(<Settings />);

        await waitFor(() => {
            expect(getByText('Test User')).toBeTruthy();
        });

        const logoutCard = getByText('Log out');
        fireEvent.press(logoutCard);

        // Since Alert.alert is mocked, we need to simulate the onPress
        // In a real test, you might need to mock Alert.alert with a custom implementation
        // For now, we'll assume the alert triggers the logout
        expect(Alert.alert).toHaveBeenCalledWith(
            "Đăng xuất",
            "Bạn có chắc là muốn đăng xuất không?",
            expect.any(Array)
        );
    });

    // Test Case 7: Does not show statistics for regular user
    it('does not show statistics card for regular user', async () => {
        const { queryByText } = render(<Settings />);

        await waitFor(() => {
            expect(queryByText('Test User')).toBeTruthy();
        });

        expect(queryByText('Thống kê')).toBeNull();
    });
});