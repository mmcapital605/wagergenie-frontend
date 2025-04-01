# WagerGenie 🧞

A magical sports betting chatbot that grants winning picks through the power of AI and real-time odds data.

## Features

- 🎯 AI-powered sports betting picks
- 💫 Genie-themed interface
- 📊 Pick history tracking
- 💰 Multiple subscription tiers
- 🔒 Secure user authentication
- 📱 Mobile-responsive design

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wagergenie.git
cd wagergenie
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory with:
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
THE_ODDS_API_KEY=be55e8c0376c84086a8d3bf7c670a604
```

5. Run the application:
```bash
flask run
```

6. Visit `http://localhost:5000` in your browser

## Subscription Tiers

- **Free**: 3 initial picks, then 1 pick every 3 days
- **Daily**: 3 picks per day ($19/day or $49/week)
- **Premium**: Unlimited picks ($100/week)

## Development

The application is built with:
- Flask
- Flask-Login
- TailwindCSS
- TheOddsAPI

## License

MIT License - see LICENSE file for details 