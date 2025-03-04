# Node.js Measurements Test

## Running the Application

1. **Install dependencies**  
   Run the following command in the project root directory to install all necessary dependencies:
   ```bash
   npm install

2. **Start the application**  
   Ensure that Docker is running, then execute:
   ```bash
   docker-compose up --build
   ```
   This will build and run both the application and the database.

3. **Accessing the API documentation**  
   Once the application is running, open http://localhost:3000/api-docs/#/ in your browser.
   This will open the Swagger page, where you can explore and test the available endpoints.

## Running Tests
   To run the unit and integration tests, simply use:
   ```bash
   npm test
