## brAInstorm (DubHacks '24 Intel AI Track Winner)

## Inspiration
As regular book, article, and blog post readers as well as affluent writers, we recognized the inherently messy process to brainstorm eloquent, coherent, and impactful ideas. To streamline this messy process and give writers a space to think and compose ideas, we leveraged generative AI tools and full-stack web development to create brAInstorm.

## What it does
Our full-stack app brAInstorm allows users to add snippets of text and audio onto a blank whiteboard. We then use Whisper to process audio snippets and Perplexity AI to generate idea summaries and inspiration bits to aid the challenging and unorganized process of brainstorming. 

## How we built it
We used Vite and React to create the frontend for our full-stack web app. Our backend was built on the FastAPI framework where we implemented a RAG pipeline to push the text snippets and a prompt-engineered query into a Perplexity AI agent and a Multi-Modal LLM called Whisper to process speech to text.

We utilized one of Intel’s AI PCs at DubHacks to fine-tune Whisper on a dataset of human speech and evaluated the model on reading-related audio snippets. We also quantized the Whisper model to optimize it for faster inferences.

## Challenges we ran into
The large size of WAV audio files led to unexpected challenges passing data between the React frontend and the Fast-API backend for LLM inference–we experimented with JSON file conversion, local storage, but ultimately combined FormData file processing with asynchronous FAST-API endpoints to pass data. 

Integrating Speech-2-Text Models into our fullstack Web Application proved challenging – Initially we tried directly integrating the text-2-speech model into javascript, but we realized the model accuracy suffered considerably during the conversion process, so we ultimately settled on performing model inference on the Fast-API backend. 

Converting Quantized LLMs into a format that fit with our fullstack application proved challenging, ultimately we figured out that we needed both bin and xml weights for the model after scouring research papers and other usecases. 

## Accomplishments that we're proud of
We are proud of successfully integrating language models we were not initially familiar with, for example, the multi-modal language model Whisper. Additionally, we are proud of figuring out how to optimize models to perform faster using Intel AI PCs, and string frontend and backend components in a seamless manner. 

Being able to accomplish all of these tasks within the past 24 hours was a eye-opening experience that we thoroughly enjoyed.

## What we learned
We learned a plethora of ML techniques including Post-Training Quantization, conversion to ONNX, and utilizing OpenVINO formats for optimized performance. Concepts like performing model inference on remote computers and writing RAG pipelines were concepts we built a rich experience in through this hackathon.

On top of ML concepts, we had a lot of fun learning how to use Remote Tunnels to SSH into AI Tyber Cloud on VSCode. We also learned how to configure Fast-API endpoints to pass data between the frontend and backend. 

## What's next for brAInstorm
One of the many things we would like to implement in the future is image input and image generation to support a wider audience and be useful for more applications. We hope to implement stable diffusion models into our brAInstorm app to create idea-inspiring visuals for plot points, scene visualizations, and etc. to truly help bring ideas to life.

We also believe that writing is a collaborative process. We would love to turn this into a collaborative app where many creatives can work together and contribute to a single brainstorming whiteboard simultaneously.
