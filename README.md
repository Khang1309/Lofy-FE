# Lofy-FE

## Overview
Lofy-FE is a web application designed to provide users with an engaging platform for managing and enjoying music content. It allows users to create, share, and interact with playlists while enjoying a seamless musical experience.

## Tech Stack
- **Frontend:** React.js, Redux
- **Styling:** CSS, Sass
- **APIs:** RESTful APIs
- **Build Tool:** Webpack
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
├── src/             # Source files
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── services/    # Services to handle API calls
│   ├── redux/       # Redux store, actions, and reducers
│   └── App.js       # Main application file
├── package.json     # Project metadata and dependencies
└── README.md        # Project documentation
```

## Key Features
- User authentication and authorization
- Playlist creation and sharing
- Search functionality for songs and artists
- Responsive design and accessibility features

## Contribution Guidelines
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

### Please ensure that your code adheres to the project's coding standards and includes tests where necessary.