import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app(): # config_classはもう不要
    app = Flask(__name__)
    
    # --- ここに、すべての設定を直接書き込む！ ---
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SECRET_KEY'] = 'a-very-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # ↓↓↓↓ ここに、あなたの 'sk-...' から始まるキーを貼り付けてください ↓↓↓↓
    app.config['OPENAI_API_KEY'] = 'YOUR_OPENAI_sk-proj-DY1U9SrDvm5MGW2qcDGZpOySYQmodZn1gXWkeJ6timyZEb0LYzgOzC1Mqhi4ZbwsH3uZ69hjwrT3BlbkFJL-a1CDFWr-4XNeuNrFYMvKi_7X2gp8LZS1Z9B0KMZswqzhMPMpwWf3dvdpx6P-QcWT313BreQAAPI_KEY_HERE'
    # -----------------------------------------

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

from app import models