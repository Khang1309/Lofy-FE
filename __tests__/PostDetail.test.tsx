import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PostDetail from '../app/post/[postid]/index';
import api from '../app/services/api';

// --- 1. MOCK EXPO ROUTER ---
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
    router: {
        push: (...args: any[]) => mockPush(...args),
        back: (...args: any[]) => mockBack(...args),
    },
    useLocalSearchParams: () => ({
        postid: 1,
    }),
    Stack: {
        Screen: ({ options, children }: any) => <>{children}</>, // Mock Stack.Screen
    },
}));

// --- 2. MOCK REACT NAVIGATION ---
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        setOptions: jest.fn(),
    }),
    useFocusEffect: (callback: any) => {
        const React = require('react');
        React.useEffect(() => {
            const fn = callback();
            return () => {
                if (typeof fn === 'function') fn();
            };
        }, [callback]);
    },
}));

// Mock Alert.alert
jest.spyOn(Alert, 'alert');// --- 2. MOCK API ---
jest.mock('../app/services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        patch: jest.fn(),
        post: jest.fn(),
    }
}));

// --- 3. MOCK SENTRY ---
jest.mock('@sentry/react-native', () => ({
    captureException: jest.fn(),
}));

// --- 4. MOCK HEADER THEME & STATUS COLOR ---
jest.mock('../styles/theme', () => ({
    headerTheme: {
        colors: {
            primary: '#2563EB',
        },
    },
    statusColor: {
        colorsBackground: {
            open: '#fee2e2',
            withSecurity: '#fef3c7',
            return: '#dcfce7',
            pending: '#f3f4f6',
        },
        colorsText: {
            open: '#ef4444',
            withSecurity: '#d97706',
            return: '#22c55e',
            pending: '#6b7280',
        },
    },
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

// --- 6. MOCK VECTOR ICONS ---
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// --- 7. MOCK SAFE AREA INSETS ---
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({
        bottom: 10,
        top: 0,
        left: 0,
        right: 0,
    }),
}));

describe('<PostDetail />', () => {
    const mockPostData = {
        id: 1,
        title: 'Test Lost Wallet',
        building: 'H1',
        post_floor: '3',
        nearest_room: '301',
        found_at: new Date('2024-01-15T10:00:00Z').toISOString(),
        post_description: 'Black leather wallet found near entrance',
        post_status: 'OPEN',
        usr_id: 456, // Not the current user
        images: [{ url: 'http://test.com/img1.png' }],
    };

    const mockClaimData = null; // No claim for this user

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup API return values
        (api.get as jest.Mock).mockImplementation((endpoint) => {
            if (endpoint.includes('get-post-details')) {
                return Promise.resolve(mockPostData);
            } else if (endpoint.includes('/claims/me')) {
                return Promise.resolve(mockClaimData);
            }
            return Promise.resolve(null);
        });
        
        (api.post as jest.Mock).mockImplementation((endpoint) => {
            if (endpoint.includes('infoById')) {
                return Promise.resolve({ alias: 'Test User' });
            }
            return Promise.resolve(null);
        });
    });

    // Test Case 1: Renders post detail after loading
    it('renders post detail after loading', async () => {
        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('H1')).toBeTruthy();
        expect(getByText('3')).toBeTruthy();
        expect(getByText('301')).toBeTruthy();
        expect(getByText('Black leather wallet found near entrance')).toBeTruthy();
    });

    // Test Case 2: Displays correct status badge for OPEN status
    it('displays correct status badge for OPEN status', async () => {
        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('Đang tìm chủ nhân')).toBeTruthy();
    });

    // Test Case 3: Shows "Liên hệ nhận đồ" button when user has no claim
    it('shows contact button when user has no claim', async () => {
        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('Liên hệ nhận đồ')).toBeTruthy();
    });

    // Test Case 4: Shows "Xem yêu cầu" button when user has a claim
    it('shows view claim button when user has a claim', async () => {
        (api.get as jest.Mock).mockImplementation((endpoint) => {
            if (endpoint.includes('get-post-details')) {
                return Promise.resolve(mockPostData);
            } else if (endpoint.includes('/claims/me')) {
                return Promise.resolve({ id: 1, claim_description: 'Test claim' }); // Has claim
            } else if (endpoint.includes('infoById')) {
                return Promise.resolve({ alias: 'Test User' });
            }
            return Promise.resolve(null);
        });

        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('Xem yêu cầu')).toBeTruthy();
    });

    // Test Case 5: Navigates to submit claim when button is pressed
    it('navigates to submit claim screen when contact button is pressed', async () => {
        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        const contactBtn = getByText('Liên hệ nhận đồ');
        fireEvent.press(contactBtn);

        expect(mockPush).toHaveBeenCalledWith(`/post/1/submit_claim`);
    });

    // Test Case 6: Navigates to report screen
    it('navigates to report screen when report button is pressed', async () => {
        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        const reportBtn = getByText('Báo cáo');
        fireEvent.press(reportBtn);

        expect(mockPush).toHaveBeenCalledWith(`/post/1/report`);
    });

    // Test Case 7: Shows delete alert for post creator
    it('shows delete alert when post creator presses delete', async () => {
        // Mock as post creator
        const { default: useUserStoreMock } = require('../store/useUserStore');
        useUserStoreMock.mockImplementation((selector) => {
            const mockState = {
                role: 'user',
                id: 456, // Same as usr_id in mockPostData
                clearUser: mockClearUser,
            };
            return selector ? selector(mockState) : mockState;
        });

        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        const deleteBtn = getByText('Gỡ bỏ');
        fireEvent.press(deleteBtn);

        expect(Alert.alert).toHaveBeenCalledWith(
            "Gỡ bài viết",
            "Bạn có chắc là muốn gỡ bài viết này không? Hành động này không thể hoàn tác",
            expect.any(Array)
        );
    });

    // Test Case 8: Handles API error gracefully
    it('handles API error gracefully', async () => {
        (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));

        const { getByText, queryByText } = render(<PostDetail />);

        await waitFor(() => {
            // Should show "Không tìm thấy bài viết" or similar error message
            expect(queryByText('Không tìm thấy bài viết.')).toBeTruthy();
        }, { timeout: 2000 });
    });

    // Test Case 9: Disables contact button when post status is not OPEN
    it('disables contact button when post status is not OPEN', async () => {
        (api.get as jest.Mock).mockImplementation((endpoint) => {
            if (endpoint.includes('get-post-details')) {
                return Promise.resolve({
                    ...mockPostData,
                    post_status: 'ARCHIVED',
                });
            } else if (endpoint.includes('/claims/me')) {
                return Promise.resolve(null);
            }
            return Promise.resolve(null);
        });

        const { queryByText, getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        // When status is not OPEN, the contact button should not be rendered
        const contactBtn = queryByText('Liên hệ nhận đồ');
        expect(contactBtn).toBeFalsy();
    });

    // Test Case 10: Shows edit button for post creator
    it('shows edit button for post creator', async () => {
        // Mock as post creator
        const { default: useUserStoreMock } = require('../store/useUserStore');
        useUserStoreMock.mockImplementation((selector) => {
            const mockState = {
                role: 'user',
                id: 456, // Same as usr_id in mockPostData
                clearUser: mockClearUser,
            };
            return selector ? selector(mockState) : mockState;
        });

        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('Sửa')).toBeTruthy();
    });

    // Test Case 11: Shows admin delete button for admin role
    it('shows delete button for admin users', async () => {
        // Mock as admin user
        const { default: useUserStoreMock } = require('../store/useUserStore');
        useUserStoreMock.mockImplementation((selector) => {
            const mockState = {
                role: 'admin',
                id: 789, // Different user
                clearUser: mockClearUser,
            };
            return selector ? selector(mockState) : mockState;
        });

        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('Báo cáo')).toBeTruthy();
        expect(getByText('Gỡ bỏ')).toBeTruthy();
    });

    // Test Case 12: Displays user who posted the item
    it('displays user who posted the item', async () => {
        const { getByText } = render(<PostDetail />);

        await waitFor(() => {
            expect(getByText('Test Lost Wallet')).toBeTruthy();
        });

        expect(getByText('Test User')).toBeTruthy();
    });
});