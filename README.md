# Social-media-app-backend

This project is a backend API implementation for an Instagram clone. It provides endpoints to handle user authentication, posting images, liking posts, following users, and more.

## Features

- **User Authentication**: Endpoints for user registration, login, and authentication using JWT tokens.
- **Posts**: APIs to create, read, update, and delete posts. Users can upload images along with captions.
- **Likes and Comments**: Functionality to like and comment on posts.
- **Followers and Following**: Endpoints for users to follow and unfollow other users.
- **User Profile**: APIs to view and update user profiles.

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing user data, posts, and other information.
- **JWT (JSON Web Tokens)**: Authentication mechanism for securing APIs.
- **Multer**: Middleware for handling file uploads.
- **bcrypt**: Library for hashing passwords.

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/instagram-clone-backend.git

2. Install Dependencies: Navigate to the project directory and install the necessary dependencies using:
    "npm install"
3. Configure Environment Variables: Create a .env file in the project root and add the following variables:
   PORT = 500
   SALT = 10
   CONNECTION_PASSWORD = 1234 (change this with your Db password)
   CONNECTION_USERNAME = root (change this with your Db username)
   CONNECTION_HOST= localhost (change this with your Db host)
   CONNECTION_DATABASE= socialapp (change this with your Db name)
   JWT_SECRET = thisIsMyDemoApp

4. Run the Application:Start the backend server using: "npm start"
