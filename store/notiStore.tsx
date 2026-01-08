import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../app/services/api';
import { NotificationListSchema, Notification } from '../schema/notification';



interface NotificationState {
    ListNotifications: Notification[];
    setNotifications: (items: Notification[]) => void;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => void;
    fetchNotifications: (page?: number, limit?: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            ListNotifications: [],
            unreadCount: 0,

            setNotifications: (items) =>
                set({
                    ListNotifications: items,
                }),

            fetchNotifications: async (page, number) => {
                try {
                    const pageNum = page || 1; // Explicitly get the page number
                    const limitNum = number || 10;
                    const res = await api.get(`/others/notifications?page=${pageNum}&number=${limitNum}`);
                    console.log(res)
                    const validatedData = NotificationListSchema.parse(res);
                    const incomingList = validatedData ?? [];
                    let finalAPIList = [];

                    if (pageNum === 1) {
                        finalAPIList = incomingList;
                    } else {
                        const currentList = get().ListNotifications ?? [];
                        finalAPIList = [...currentList, ...incomingList];
                    }

                    const uniqueNotifications = Array.from(
                        new Map(finalAPIList.map(item => [item.id, item])).values()
                    );
                    get().setNotifications(uniqueNotifications);

                } catch (error) {
                    console.error("Failed to fetch and validate notifications:", error);
                }
            },

            markAsRead: async (id) => {
                try {
                    const res = await api.patch(`/others/notifications?noti_id=${id}`, {}, {});
                }
                catch (error) {
                    console.error("Failed to mark notification as read:", error);
                }
            },

            markAllAsRead: () => {

            },
        }),
        {
            name: 'notification-storage', // Tên key trong AsyncStorage
            storage: createJSONStorage(() => AsyncStorage), // Cấu hình dùng AsyncStorage
        }
    )
);