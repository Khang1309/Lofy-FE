import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MyPostsScreen from '../app/post/mypost/index';
import api from '../app/services/api';

// --- 1. MOCK EXPO ROUTER ---
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    router: {
        push: (...args: any[]) => mockPush(...args),
    },
    Stack: {
        Screen: ({ options, children }: any) => <>{children}</>, // Mock Stack.Screen
    },
}));

// --- 2. MOCK API ---
jest.mock('../app/services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    }
}));

// --- 3. MOCK SENTRY ---
jest.mock('@sentry/react-native', () => ({
    captureException: jest.fn(),
}));

// --- 4. MOCK HEADER THEME ---
jest.mock('styles/theme', () => ({
    headerTheme: {
        colors: {
            primary: '#2563EB',
        },
    },
}));

// --- 5. MOCK VECTOR ICONS ---
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('<MyPostsScreen />', () => {
    const mockPostsData = [
        {
            id: 1,
            title: 'Test Lost Item',
            building: 'H1',
            images: 'http://test.com/img1.png',
            post_floor: '1',
            nearest_room: '101',
            found_at: new Date('2024-01-15T10:00:00Z'),
            post_description: 'Description 1',
            user_id: 123,
            thread_id: 456,
            post_status: 'open',
        },
        {
            id: 2,
            title: 'Another Item',
            building: 'H2',
            images: 'http://test.com/img2.png',
            post_floor: '2',
            nearest_room: '202',
            found_at: new Date('2024-01-16T11:00:00Z'),
            post_description: 'Description 2',
            user_id: 123,
            thread_id: 457,
            post_status: 'archived',
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup the API return value for every test
        (api.get as jest.Mock).mockResolvedValue(mockPostsData);
    });

    // Test Case 1: Renders loading initially
    it('renders loading state initially', () => {
        const { getByText } = render(<MyPostsScreen />);

        expect(getByText('Đang tải bài viết...')).toBeTruthy();
    });

    // Test Case 2: Renders posts after loading
    it('renders posts after data is fetched', async () => {
        const { getByText } = render(<MyPostsScreen />);

        // Wait for the data to load
        await waitFor(() => {
            expect(getByText('Test Lost Item')).toBeTruthy();
        });

        expect(getByText('Another Item')).toBeTruthy();
        expect(getByText('H1 - Tầng 1')).toBeTruthy(); // Building and floor
        expect(getByText('H2 - Tầng 2')).toBeTruthy();
    });

    // Test Case 3: Handles empty posts
    it('renders empty state when no posts', async () => {
        (api.get as jest.Mock).mockResolvedValue([]);

        const { getByText } = render(<MyPostsScreen />);

        await waitFor(() => {
            expect(getByText('Bạn chưa đăng bài viết nào.')).toBeTruthy();
        });

        expect(getByText('Đăng bài ngay')).toBeTruthy();
    });

    // Test Case 4: Navigates to post detail on press
    it('navigates to post detail when a post is pressed', async () => {
        const { getByText } = render(<MyPostsScreen />);

        await waitFor(() => {
            expect(getByText('Test Lost Item')).toBeTruthy();
        });

        const postItem = getByText('Test Lost Item');
        fireEvent.press(postItem);

        expect(mockPush).toHaveBeenCalledWith('/post/1');
    });

    // Test Case 5: Handles API error
    it('handles API error gracefully', async () => {
        (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));

        const { getByText } = render(<MyPostsScreen />);

        // Should render empty state on error
        await waitFor(() => {
            expect(getByText('Bạn chưa đăng bài viết nào.')).toBeTruthy();
        });
    });
});