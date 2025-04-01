from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv
import requests
from database import (
    init_db, get_user_by_email, create_user, update_user,
    get_user_picks, add_pick, update_pick_result
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SERVER_NAME'] = os.getenv('VERCEL_URL', 'localhost:5000')
app.config['PREFERRED_URL_SCHEME'] = 'https'

# Initialize database
init_db()

# TheOddsAPI configuration
ODDS_API_KEY = os.getenv('THE_ODDS_API_KEY')
ODDS_API_HOST = 'https://api.the-odds-api.com/v4'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin):
    def __init__(self, id, email, name, phone, password_hash, subscription_type='free', last_pick_date=None, picks_remaining=3):
        self.id = id
        self.email = email
        self.name = name
        self.phone = phone
        self.password_hash = password_hash
        self.subscription_type = subscription_type
        self.last_pick_date = last_pick_date
        self.picks_remaining = picks_remaining

    @staticmethod
    def from_db(user_data):
        return User(
            id=user_data['id'],
            email=user_data['email'],
            name=user_data['name'],
            phone=user_data['phone'],
            password_hash=user_data['password_hash'],
            subscription_type=user_data['subscription_type'],
            last_pick_date=datetime.fromisoformat(user_data['last_pick_date']) if user_data.get('last_pick_date') else None,
            picks_remaining=user_data.get('picks_remaining', 3)
        )

@login_manager.user_loader
def load_user(user_id):
    user_data = get_user_by_email(user_id)
    return User.from_db(user_data) if user_data else None

def get_sports_odds(sport='upcoming'):
    url = f"{ODDS_API_HOST}/sports/{sport}/odds"
    params = {
        'apiKey': ODDS_API_KEY,
        'regions': 'us',
        'markets': 'h2h,spreads',
        'oddsFormat': 'american'
    }
    response = requests.get(url, params=params)
    return response.json() if response.status_code == 200 else None

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        phone = request.form.get('phone')
        password = request.form.get('password')
        
        if get_user_by_email(email):
            flash('Email already registered')
            return redirect(url_for('signup'))
        
        user_data = {
            'email': email,
            'name': name,
            'phone': phone,
            'password_hash': generate_password_hash(password),
            'subscription_type': 'free',
            'last_pick_date': datetime.now().isoformat(),
            'picks_remaining': 3
        }
        
        db_user = create_user(user_data)
        user = User.from_db(db_user)
        login_user(user)
        return redirect(url_for('dashboard'))
    
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user_data = get_user_by_email(email)
        if user_data and check_password_hash(user_data['password_hash'], password):
            user = User.from_db(user_data)
            login_user(user)
            return redirect(url_for('dashboard'))
        
        flash('Invalid email or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    user_picks = get_user_picks(current_user.id)
    return render_template('dashboard.html', picks=user_picks)

@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html')

@app.route('/settings')
@login_required
def settings():
    return render_template('settings.html')

@app.route('/api/chat', methods=['POST'])
@login_required
def chat_api():
    if current_user.picks_remaining <= 0 and current_user.subscription_type == 'free':
        return jsonify({
            'message': "I apologize, mighty one! You've used all your free wishes. Subscribe to receive more magical picks!"
        })
    
    # Get real odds from TheOddsAPI
    odds_data = get_sports_odds()
    if not odds_data:
        return jsonify({
            'message': "My crystal ball is a bit cloudy at the moment. Please try again later!"
        })
    
    # Select the best pick based on odds analysis (simplified for now)
    best_game = odds_data[0] if odds_data else None
    if best_game:
        home_team = best_game['home_team']
        away_team = best_game['away_team']
        markets = best_game.get('bookmakers', [{}])[0].get('markets', [])
        odds = next((m for m in markets if m['key'] == 'h2h'), {}).get('outcomes', [])
        
        if odds:
            favorite = max(odds, key=lambda x: x['price'])
            confidence = min(85, max(65, int(favorite['price'])))
            
            response = {
                'pick': f"I foresee {favorite['name']} triumphing over their opponent in the {home_team} vs {away_team} game!",
                'confidence': confidence,
                'odds': f"+{favorite['price']}" if favorite['price'] > 0 else str(favorite['price'])
            }
        else:
            response = {
                'pick': f"I see an exciting match between {home_team} and {away_team}, but the spirits are unclear about the winner.",
                'confidence': 70,
                'odds': "N/A"
            }
    else:
        response = {
            'pick': "The mystical forces are gathering strength. Please try again in a moment.",
            'confidence': 0,
            'odds': "N/A"
        }
    
    # Update picks remaining
    if current_user.subscription_type == 'free':
        current_user.picks_remaining -= 1
        update_user(current_user.id, {'picks_remaining': current_user.picks_remaining})
    
    # Store pick in history
    pick_data = {
        'user_id': current_user.id,
        'date': datetime.now().isoformat(),
        'pick': response['pick'],
        'result': 'Pending',
        'confidence': response['confidence'],
        'odds': response['odds']
    }
    add_pick(pick_data)
    
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 