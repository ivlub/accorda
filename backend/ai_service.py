import os
import google.generativeai as genai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the API key from environment variables (set via docker-compose)
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Configure the Gemini client library
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY environment variable not found. AI service may not work.")
else:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        logger.info("Google Generative AI configured successfully.")
    except Exception as e:
        logger.error(f"Error configuring Google Generative AI: {e}")

# TODO: evaluate which model to use. gemini 2.5 pro is more accurate but slower. 1.5 flash is faster but less accurate.
DEFAULT_MODEL = 'gemini-1.5-flash'
# DEFAULT_MODEL = 'gemini-2.5-pro-exp-03-25'    


async def generate_text_from_gemini(prompt: str, model_name: str = DEFAULT_MODEL) -> str:
    """
    Generates text using the specified Google Gemini model.

    Args:
        prompt: The text prompt to send to the model.
        model_name: The name of the Gemini model to use.

    Returns:
        The generated text response from the model, or an error message.
    """
    if not GOOGLE_API_KEY:
        return "Error: Google API Key not configured."

    try:
        logger.info(f"Generating text with model: {model_name}")
        model = genai.GenerativeModel(model_name)
        # Use generate_content_async for compatibility with FastAPI async routes
        response = await model.generate_content_async(prompt)

        # Basic safety check (can be expanded based on response.prompt_feedback)
        if not response.candidates:
             logger.warning("No candidates returned from Gemini API.")
             return "Error: No response generated (potentially due to safety settings)."

        if response.candidates[0].finish_reason != 'STOP':
             logger.warning(f"Gemini generation finished with reason: {response.candidates[0].finish_reason}")
             # You might want to handle different finish reasons (e.g., SAFETY)

        logger.info("Successfully received response from Gemini API.")
        return response.text

    except Exception as e:
        logger.error(f"Error calling Google Gemini API: {e}", exc_info=True)
        # Depending on the error, you might get more details, e.g., e.response.status_code
        return f"Error generating text: An internal error occurred."

# Example of how to potentially call it (for testing or direct script use)
# if __name__ == '__main__':
#     import asyncio
#     async def main():
#         if not GOOGLE_API_KEY:
#              print("Set the GOOGLE_API_KEY environment variable to run this example.")
#              return
#         test_prompt = "Explain the concept of asynchronous programming in Python."
#         print(f"Sending prompt: {test_prompt}")
#         result = await generate_text_from_gemini(test_prompt)
#         print("\n--- Gemini Response ---")
#         print(result)
#         print("-----------------------")
#     asyncio.run(main()) 