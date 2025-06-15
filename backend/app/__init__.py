from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS # CORSをここに移動

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app) # CORSの初期化も、この中で行う

    db.init_app(app)
    migrate.init_app(app, db)

    # Blueprintの登録を、関数の中で行う！
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

# modelsのインポートも、このファイルの一番下で行う
from app import models