# GenZora 🎨

Hey! Welcome to GenZora - where AI meets Web3 creativity. We built this during the Zora Network Hackathon to make creating and sharing AI art as easy as posting on social media, but with the power of Web3 behind it.

## What's This All About?

GenZora lets you:
- Generate cool images and videos using AI
- Add some funky cartoon filters to spice things up
- Share your creations on Farcaster
- Mint your art as NFTs on Zora (super cheap - less than 50 cents!)
- Build a following and engage with other creators

## Tech Stack

### Backend (Python + FastAPI)
- AI magic for image/video generation
- Custom filters for that extra pizzazz
- All dockerized for easy deployment

### Frontend (Next.js + Farcaster)
- Clean UI with Tailwind
- Farcaster integration for social features
- Web3 stuff (Zora + Solana)

## Want to Try It Out?

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Don't forget your .env
cp .env.example .env
# Add your API keys and stuff

python main.py  # Fire it up!
```

### Frontend Setup
```bash
cd farcaster_miniapp
npm install

# Same deal with env
cp .env.example .env
# Fill in your keys

npm run dev  # Let's go! 🚀
```

## Environment Keys You'll Need

Drop these in your .env:
- `OPENAI_KEY` - for the AI magic
- `HF_TOKEN` - Hugging Face stuff
- `LOCAL_LLM_RUN` - if you're running models locally

## API Endpoints

### Images
- `POST /generate/text` - Text → Image
- `POST /generate` - Text + Image → New Image
- `POST /{filter_name}` - Add filters to your image

### Videos
- `POST /generate` - Text → Video
- `GET /status` - Check if the video's ready
- `GET /health` - Making sure everything's alive

## Contributing

Got ideas? Found a bug? PRs are always welcome! Just keep it clean and test your stuff before pushing.

## License

MIT Licensed - do your thing, just don't sue me 😅

## Shoutouts

Big thanks to:
- Zora Network for the awesome L2
- Farcaster team for the social tools
- The hackathon organizers for bringing us together

---

Built with ❤️ during the Zora Network Hackathon
