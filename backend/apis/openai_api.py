import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from typing import List

load_dotenv()
client = OpenAI(api_key=os.getenv('PERPLEXITY_API_KEY'), base_url="https://api.perplexity.ai")

async def inspo_generation(text_snippets: List[str]):
    system_query = f"""
    You are a writer looking for inspiration. You have a lot of text snippets that 
    represent ideas you have noted down for your writing. Your objective is to 
    summarize these ideas, generate inspiration/samples, and ideas for your work.    
    """
    user_query = f"""
    Here are the text snippets that you have noted down for your writing:
    {text_snippets}
    Compile these ideas and generate an eloquent summary of these text snippets and merge
    these different snippets into sample coherent ideas for your writing. The goal is to 
    generate inspiration for your writing.

    Format your response in the following way:
    Summary: [A coherent summary of the text snippets]
    Sample Ideas: [List of sample ideas based on the text snippets]
    Idea inspiration: [Generate some inspiration for your writing based on the text snippets]
    """

    messages = [{"role": "system", "content": system_query}, 
                {"role": "user", "content": user_query}]

    response = client.chat.completions.create(
        model="llama-3.1-sonar-small-128k-online",
        messages=messages, 
        max_tokens=500          
    )

    parsed_response = json.dumps(response, indent=4)
    
    return response.choices[0].text.strip()