from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def init_db():
    # Create tables if they don't exist
    supabase.table('users').select('*').limit(1).execute()
    supabase.table('picks_history').select('*').limit(1).execute()

def get_user_by_email(email):
    response = supabase.table('users').select('*').eq('email', email).execute()
    return response.data[0] if response.data else None

def create_user(user_data):
    response = supabase.table('users').insert(user_data).execute()
    return response.data[0]

def update_user(user_id, user_data):
    response = supabase.table('users').update(user_data).eq('id', user_id).execute()
    return response.data[0]

def get_user_picks(user_id):
    response = supabase.table('picks_history').select('*').eq('user_id', user_id).execute()
    return response.data

def add_pick(pick_data):
    response = supabase.table('picks_history').insert(pick_data).execute()
    return response.data[0]

def update_pick_result(pick_id, result):
    response = supabase.table('picks_history').update({'result': result}).eq('id', pick_id).execute()
    return response.data[0] 