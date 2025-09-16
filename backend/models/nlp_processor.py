# import openai
# from config import Config

# class NLPProcessor:
#     def __init__(self):
#         openai.api_key = Config.OPENAI_API_KEY

#     def summarize_text(self, text):
#         if not text:
#             return "No text to summarize."
#         try:
#             response = openai.chat.completions.create(
#                 model="gpt-3.5-turbo",
#                 messages=[
#                     {"role": "system", "content": "You are a helpful assistant that summarizes meeting transcripts concisely."},
#                     {"role": "user", "content": f"Please summarize the following meeting transcript:\n\n{text}"}
#                 ],
#                 max_tokens=200,
#                 temperature=0.7
#             )
#             return response.choices[0].message.content.strip()
#         except Exception as e:
#             return f"Error summarizing text: {e}"

#     def extract_action_items(self, text):
#         if not text:
#             return ["No action items found."]
#         try:
#             response = openai.chat.completions.create(
#                 model="gpt-3.5-turbo",
#                 messages=[
#                     {"role": "system", "content": "You are a helpful assistant that extracts actionable items from meeting transcripts. List each action item clearly with who is responsible, if mentioned."},
#                     {"role": "user", "content": f"From the following meeting transcript, please identify and list all action items and assigned individuals. Format each action item as '- [Action] (Assigned to: [Person])':\n\n{text}"}
#                 ],
#                 max_tokens=300,
#                 temperature=0.5
#             )
#             action_items_raw = response.choices[0].message.content.strip()
#             return [item.strip() for item in action_items_raw.split('\n') if item.strip()]
#         except Exception as e:
#             return [f"Error extracting action items: {e}"]
# smart-meeting-summarizer/backend/models/nlp_processor.py

import openai
from config import Config
import traceback # Import the traceback module

class NLPProcessor:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY

    def summarize_text(self, text):
        if not text:
            return "No text to summarize."
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes meeting transcripts concisely."},
                    {"role": "user", "content": f"Please summarize the following meeting transcript:\n\n{text}"}
                ],
                max_tokens=200,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # THIS IS THE NEW, DETAILED LOGGING
            print("--- AN ERROR OCCURRED IN SUMMARIZE_TEXT ---")
            traceback.print_exc()
            print("---------------------------------------------")
            # Return a more informative error message to the frontend
            return f"Error summarizing text: {str(e)}"

    def extract_action_items(self, text):
        if not text:
            return ["No action items found."]
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts actionable items from meeting transcripts. List each action item clearly with who is responsible, if mentioned."},
                    {"role": "user", "content": f"From the following meeting transcript, please identify and list all action items and assigned individuals. Format each action item as '- [Action] (Assigned to: [Person])':\n\n{text}"}
                ],
                max_tokens=300,
                temperature=0.5
            )
            action_items_raw = response.choices[0].message.content.strip()
            return [item.strip() for item in action_items_raw.split('\n') if item.strip()]
        except Exception as e:
            # THIS IS THE NEW, DETAILED LOGGING
            print("--- AN ERROR OCCURRED IN EXTRACT_ACTION_ITEMS ---")
            traceback.print_exc()
            print("--------------------------------------------------")
            # Return a more informative error message to the frontend
            return [f"Error extracting action items: {str(e)}"]

