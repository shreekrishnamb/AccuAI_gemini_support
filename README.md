# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Running Locally

To run this project on your local machine, please follow these steps:

### 1. Set up your Environment Variables

The generative AI features in this application rely on the Gemini API. You will need to obtain an API key from Google AI Studio.

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key.
2.  In the root of your project, create a new file named `.env.local`.
3.  Add your API key to the `.env.local` file like this:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 2. Install Dependencies

Open your terminal, navigate to the project directory, and run the following command to install the necessary packages:

```bash
npm install
```

### 3. Run the Development Servers

This project requires two separate development servers to run concurrently in two different terminal windows:

*   **Terminal 1: Next.js App**
    This command starts the main web application.

    ```bash
    npm run dev
    ```

*   **Terminal 2: Genkit Flows**
    This command starts the Genkit server that runs the AI flows for transcription and translation.

    ```bash
    npm run genkit:dev
    ```

Once both servers are running, you can open your web browser to `http://localhost:9002` (or the URL specified in the `npm run dev` output) to see your application in action.