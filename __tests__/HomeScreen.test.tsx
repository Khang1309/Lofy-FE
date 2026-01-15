import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScrollableTabView from '../app/(tabs)/index';

// --- MOCKS SETUP ---

// 1. Mock Expo Router & Focus Effect
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
    useFocusEffect: (cb: any) => cb(), // Run effect immediately
    Link: 'Link',
}));

// 2. Mock API (Prevent actual network calls)
jest.mock('../app/services/api', () => ({
    post: jest.fn(() => Promise.resolve({
        page: 1,
        total: 1,
        posts: [
            {
                id: 1,
                title: 'Test Lost Item',
                building: 'H6',
                post_floor: '1',
                nearest_room: '101',
                found_at: new Date().toISOString(),
                post_description: 'Description',
                post_status: 'OPEN',
                usr_id: 123,
                images: [{ url: 'http://test.com/img.png' }]
            }
        ]
    })),
    delete: jest.fn(),
}));

// 3. Mock Zustand Store
jest.mock('../store/useUserStore', () => {
    // Return a hook that always returns specific values
    const actual = jest.requireActual('../store/useUserStore');
    return {
        __esModule: true,
        default: (selector: any) => {
            // Mock state values
            const mockState = {
                followedThreadIds: [],
                toggleThreadFollow: jest.fn(),
                isThreadFollowed: () => false
            };
            return selector(mockState);
        },
        // If you use .getState() somewhere
        getState: () => ({ isThreadFollowed: () => false })
    };
});

// 4. Mock Sentry & Utils
jest.mock('@sentry/react-native', () => ({
    captureException: jest.fn(),
}));

jest.mock('../app/services/utils', () => ({
    logUserAction: jest.fn(),
    Analytics: { logEvent: jest.fn() },
}));

describe('<ScrollableTabView /> (HomeScreen)', () => {
    // Test Case 1: Render Main Tabs
    it('renders the tab bar with building names', () => {
        const { getByText } = render(<ScrollableTabView />);
        expect(getByText('All')).toBeTruthy();
        expect(getByText('H1')).toBeTruthy();
        expect(getByText('H6')).toBeTruthy();
    });

    // Test Case 2: Render "Create Post" Button
    it('renders the "Tạo bài" button', async () => {
        const { getByText } = render(<ScrollableTabView />);
        // Wait for initial render
        await waitFor(() => {
            expect(getByText('Tạo bài')).toBeTruthy();
        });
    });

    // Test Case 3: Filter Interaction
    it('opens filter panel when Time filter is pressed', async () => {
        const { getByText } = render(<ScrollableTabView />);

        // Find the "Time" button inside the component
        const timeFilterBtn = getByText('Time');
        fireEvent.press(timeFilterBtn);

        // Check if the dropdown options appear
        await waitFor(() => {
            expect(getByText('Trong vòng 7 ngày')).toBeTruthy();
        });
    });
});