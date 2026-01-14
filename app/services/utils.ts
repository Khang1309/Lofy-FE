
// import analytics from '@react-native-firebase/analytics';


import * as Sentry from "@sentry/react-native";

export const logUserAction = (category: string, message: string, data?: object) => {
    Sentry.addBreadcrumb({
        category: category, // e.g., 'cart', 'auth', 'search'
        message: message,   // e.g., 'User filtered by "Lost Items"'
        level: "info",
        data: data,
    });
};

export const Analytics = {
    // 1. Log a specific action (e.g., "User clicked Buy")
    logEvent: async (eventName: string, params: object = {}) => {
        //await analytics().logEvent(eventName, params);
        console.log(`📊 Logged Event: ${eventName}`, params);
    },

    // 2. Log screen navigation (e.g., "User is on Profile")
    logScreen: async (screenName: string, screenClass: string = screenName) => {
        // await analytics().logScreenView({
        //     screen_name: screenName,
        //     screen_class: screenClass,
        // });
        console.log('screen');
    },

    // 3. Set User ID (When they login)
    setUserId: async (id: string | number) => {
        //await analytics().setUserId(id.toString());
        console.log(id);
    },

    // 4. Set User Properties (e.g., Role: Student/Admin)
    setUserProperty: async (name: string, value: string) => {
        //await analytics().setUserProperty(name, value);
        console.log("props");
    }
};

