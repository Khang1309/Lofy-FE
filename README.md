# Lofy-FE
## NOTE:
This project calls API directly to the server host on Google Cloud Platform. But the server is free so we can only host for about 1 month (since January), so now the Frontend will look very empty when you clone and run the code. You can find the GitHub link to the Backend here: ```https://github.com/ntkh4nq/lofy.git```


## Overview
Lofy-FE is a mobile application designed to provide student at HCMUT with an engaging platform for finding their lost items. It allows users to create, submit, and interact with each post.

## Tech Stack
- **Frontend:** React Native, Zustand
- **Styling:** CSS, TailwindCSS
- **APIs:** RESTful APIs
- **Build Tool:** Expo
- **Testing:** Jest, React Testing Library

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Khang1309/Lofy-FE.git
   cd Lofy-FE
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the application**:
   ```bash
   npm start
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts
- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `npm run eject`: Removes this tool and copies build dependencies to your project.

## Project Structure
```
Lofy-FE/
├── public/          # Static files
├── app/             # Source files
│   ├── (tabs)/      # Reusable components
│   ├── auth/        # Page for log in
│   ├── create/      # Page for creation of posts
│   ├── notification/# Page for all notification list
│   ├── post/        # Page for viewing the details of the post abd claims inside that post
│   ├── report/      # Page to report the post
│   ├── services/    # Services to handle API calls
│   └── App.js       # Main application file
├── package.json     # Project metadata and dependencies
└── README.md        # Project documentation
```

## Key Features
- User authentication and authorization
- Post creation and deletion
- Search functionality for posts
- Responsive design and accessibility features



