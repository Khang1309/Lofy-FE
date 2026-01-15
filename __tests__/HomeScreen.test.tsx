import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
// Use require to access View inside the mock if needed, or rely on the render environment
import { View } from 'react-native';
import ScrollableTabView from '../app/(tabs)/index';
import api from '../app/services/api';

// --- 1. MOCK ASYNC STORAGE ---
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// --- 2. MOCK EXPO ROUTER ---
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    router: {
        push: (...args: any[]) => mockPush(...args),
    },
    useFocusEffect: (cb: any) => {
        const React = require('react');
        React.useEffect(cb, [cb]);
    },
    Link: 'Link',
}));

// --- 3. MOCK API ---
jest.mock('../app/services/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        delete: jest.fn(),
    }
}));

// --- 4. MOCK ZUSTAND STORE ---
jest.mock('../store/useUserStore', () => {
    return {
        __esModule: true,
        default: jest.fn((selector) => {
            const mockState = {
                followedThreadIds: [],
                toggleThreadFollow: jest.fn(),
                isThreadFollowed: () => false,
            };
            return selector(mockState);
        }),
        getState: () => ({
            followedThreadIds: [],
            isThreadFollowed: () => false,
        })
    };
});

// --- 5. MOCK SENTRY & UTILS ---
jest.mock('@sentry/react-native', () => ({
    captureException: jest.fn(),
}));

const mockLogUserAction = jest.fn();
jest.mock('../app/services/utils', () => ({
    logUserAction: mockLogUserAction,
    Analytics: { logEvent: jest.fn() },
}));

// --- 6. MOCK UI LIBRARIES ---
jest.mock('react-native-elements', () => ({ Icon: 'Icon' }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// --- 7. MOCK TAB VIEW (FIXED) ---
// This was the cause of the "Unable to find H1" error.
// We must render the `renderTabBar` prop so the headers appear.
jest.mock('react-native-tab-view', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        TabView: ({ renderScene, renderTabBar, navigationState }: any) => {
            // 1. Render the custom TabBar (Where "H1", "All" texts are)
            const tabBar = renderTabBar ? renderTabBar({ navigationState }) : null;

            // 2. Render the current active Scene (Where the posts are)
            const currentRoute = navigationState.routes[navigationState.index];
            const scene = renderScene({ route: currentRoute });

            return (
                <View>
                    {tabBar}
                    {scene}
                </View>
            );
        },
        SceneMap: (scenes: any) => ({ route }: any) => scenes[route.key](),
    };
});

describe('<ScrollableTabView /> (HomeScreen)', () => {
    const mockPostsData = {
        page: 1,
        total: 1,
        posts: [
            {
                id: 1,
                title: 'Test Lost Item',
                building: 'H1',
                post_floor: '1',
                nearest_room: '101',
                found_at: new Date('2024-01-15').toISOString(),
                post_description: 'Description 1',
                post_status: 'OPEN',
                usr_id: 123,
                images: [{ url: 'http://test.com/img1.png' }]
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup the API return value for every test
        (api.post as jest.Mock).mockResolvedValue(mockPostsData);
    });

    // Test Case 1: Render Tab Bar
    it('renders the tab bar with building names', async () => {
        const { getByText } = render(<ScrollableTabView />);

        // Now these should pass because the mock renders the TabBar
        expect(getByText('All')).toBeTruthy();
        expect(getByText('H1')).toBeTruthy();

        // Waiting for the API data ensures the "act" warnings are resolved
        // because we wait for the state updates to finish before ending the test.
        await waitFor(() => {
            expect(getByText('Test Lost Item')).toBeTruthy();
        });
    });

    // Test Case 2: Render Button
    it('renders the "Tạo bài" button', async () => {
        const { getByText } = render(<ScrollableTabView />);

        // Always wait for the initial data load to complete 
        // to avoid "act" warnings from pending promises.
        await waitFor(() => {
            expect(getByText('Test Lost Item')).toBeTruthy();
        });

        expect(getByText('Tạo bài')).toBeTruthy();
    });

    // Test Case 3: Filter Interaction
    it('opens filter panel when Time filter is pressed', async () => {
        const { getByText } = render(<ScrollableTabView />);

        await waitFor(() => {
            expect(getByText('Test Lost Item')).toBeTruthy();
        });

        const timeFilterBtn = getByText('Time');
        fireEvent.press(timeFilterBtn);

        await waitFor(() => {
            expect(getByText('Trong vòng 7 ngày')).toBeTruthy();
        });
    });
});