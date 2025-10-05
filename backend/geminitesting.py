import google.generativeai as genai

genai.configure(api_key="AIzaSyBqpN-lzZ4ePx99up3DpAaGZ1f6ChWS4vg")

# List all models available to your API key
models = genai.list_models()
print(models)
